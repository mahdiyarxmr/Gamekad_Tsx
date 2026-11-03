import { Body, Controller, Get, Post, Query, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtGuard, Roles } from '../common/jwt.guard';
import { EventsService } from '../events/events.service';
import { audit } from '../common/audit';

@ApiTags('wallet')
@Controller()
@UseGuards(JwtGuard)
export class FinanceController {
  constructor(private prisma: PrismaService, private events: EventsService) {}

  @Get('wallet')
  async wallet(@Req() req: any) {
    const w = await this.prisma.wallet.upsert({
      where: { userId: req.user.id },
      create: { userId: req.user.id, balance: 0 },
      update: {},
    });
    const tx = await this.prisma.walletTransaction.findMany({
      where: { userId: req.user.id },
      orderBy: { id: 'desc' },
      take: 50,
    });
    return { balance: w.balance, transactions: tx };
  }

  @Post('wallet/charge')
  async charge(@Req() req: any, @Body() body: any) {
    const amount = Math.trunc(Number(body.amount) || 0);
    if (amount < 10000) throw new BadRequestException('حداقل شارژ ۱۰٬۰۰۰ تومان است.');
    if (amount > 20000000) throw new BadRequestException('سقف شارژ ۲۰ میلیون تومان است.');
    const trackingCode = 'C' + randomBytes(8).toString('hex');
    await this.prisma.payment.create({
      data: {
        userId: req.user.id,
        amount,
        kind: 'wallet',
        status: 'pending',
        provider: 'sandbox',
        trackingCode,
        idempotencyKey: `charge-${req.user.id}-${trackingCode}`,
      },
    });
    return { trackingCode, amount, sandbox: true };
  }

  @Get('payments/me')
  payments(@Req() req: any) {
    return this.prisma.payment.findMany({ where: { userId: req.user.id }, orderBy: { id: 'desc' }, take: 50 });
  }

  @Roles('admin') @Post('admin/wallet/adjust')
  async adjust(@Req() req: any, @Body() body: any) {
    const userId = Number(body.userId);
    const amount = Math.trunc(Number(body.amount) || 0);
    const note = String(body.note || 'تعدیل مدیر');
    if (!userId || !amount) throw new BadRequestException('userId و amount لازم است.');
    const key = `adj-${userId}-${Date.now()}`;
    await this.prisma.$transaction(async (tx) => {
      await tx.wallet.upsert({
        where: { userId },
        create: { userId, balance: Math.max(0, amount) },
        update: { balance: { increment: amount } },
      });
      await tx.walletTransaction.create({
        data: { userId, amount, kind: 'adjust', note, idempotencyKey: key },
      });
    });
    await audit(this.prisma, req.user.id, 'wallet.adjust', 'user', String(userId), note);
    return { ok: true };
  }
}

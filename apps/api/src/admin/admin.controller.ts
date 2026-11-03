import { Body, Controller, Get, Param, Post, Query, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { JwtGuard, Roles } from '../common/jwt.guard';
import { audit } from '../common/audit';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtGuard)
@Roles('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('dashboard')
  async dashboard() {
    const [users, events, paidReservations, articles, payments] = await Promise.all([
      this.prisma.user.count({ where: { role: 'user' } }),
      this.prisma.event.count({ where: { status: { in: ['open', 'full'] } } }),
      this.prisma.reservation.count({ where: { paymentStatus: { in: ['paid', 'partially_paid'] } } }),
      this.prisma.article.count(),
      this.prisma.payment.aggregate({ where: { status: 'paid' }, _sum: { amount: true } }),
    ]);
    return { users, events, paidReservations, articles, revenue: payments._sum.amount || 0 };
  }

  @Get('users')
  users(@Query('q') q?: string) {
    const where: any = {};
    if (q) where.OR = [{ username: { contains: q, mode: 'insensitive' } }, { displayName: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }];
    return this.prisma.user.findMany({
      where,
      select: { id: true, username: true, email: true, displayName: true, gender: true, role: true, godGameAllowed: true, status: true, membershipOrigin: true, avatar: true, createdAt: true },
      orderBy: { id: 'asc' },
      take: 200,
    });
  }

  @Post('users/:id')
  async patchUser(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const data: any = {};
    if (body.role === 'user' || body.role === 'admin') data.role = body.role;
    if (typeof body.godGameAllowed === 'boolean') data.godGameAllowed = body.godGameAllowed;
    if (typeof body.host === 'boolean') data.godGameAllowed = body.host;
    if (body.status === 'active' || body.status === 'suspended') data.status = body.status;
    if (body.origin === 'ROKAD' || body.origin === 'EXTERNAL') data.membershipOrigin = body.origin;
    if (body.membershipOrigin === 'ROKAD' || body.membershipOrigin === 'EXTERNAL') data.membershipOrigin = body.membershipOrigin;
    if (body.displayName) data.displayName = body.displayName;
    if (body.gender === 'boy' || body.gender === 'girl') data.gender = body.gender;
    const u = await this.prisma.user.update({ where: { id: Number(id) }, data });
    await audit(this.prisma, req.user.id, 'user.patch', 'user', id, JSON.stringify(data));
    return { id: u.id, role: u.role, godGameAllowed: u.godGameAllowed, status: u.status, membershipOrigin: u.membershipOrigin };
  }

  @Get('reservations')
  reservations(@Query('status') status?: string) {
    return this.prisma.reservation.findMany({
      where: status ? { status: status as any } : {},
      include: { user: { select: { username: true, displayName: true } }, event: true },
      orderBy: { id: 'desc' },
      take: 100,
    });
  }

  @Post('reservations/:id')
  async patchRes(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const data: any = {};
    if (body.status) data.status = body.status;
    if (body.paymentStatus) data.paymentStatus = body.paymentStatus;
    const r = await this.prisma.reservation.update({ where: { id: Number(id) }, data });
    await audit(this.prisma, req.user.id, 'reservation.patch', 'reservation', id, JSON.stringify(body));
    return r;
  }

  @Get('payments')
  payments() {
    return this.prisma.payment.findMany({ orderBy: { id: 'desc' }, take: 100, include: { user: { select: { username: true } } } });
  }

  @Get('audit')
  auditLog() {
    return this.prisma.auditLog.findMany({ orderBy: { id: 'desc' }, take: 80, include: { actor: { select: { username: true } } } });
  }

  @Post('users')
  async createUser(@Req() req: any, @Body() body: any) {
    if (!body.username || !body.email || !body.password) throw new BadRequestException('username, email, password');
    const u = await this.prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: bcrypt.hashSync(body.password, 12),
        displayName: body.displayName || body.username,
        role: body.role === 'admin' ? 'admin' : 'user',
        gender: body.gender === 'girl' ? 'girl' : 'boy',
        membershipOrigin: body.origin === 'EXTERNAL' ? 'EXTERNAL' : 'ROKAD',
        godGameAllowed: !!body.godGameAllowed,
        wallet: { create: { balance: 0 } },
      },
    });
    await audit(this.prisma, req.user.id, 'user.create', 'user', String(u.id), '');
    return { id: u.id, username: u.username };
  }
}

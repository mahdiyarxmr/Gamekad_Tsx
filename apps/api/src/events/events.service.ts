import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { audit } from '../common/audit';

const ACTIVE_RES = ['pending', 'confirmed'] as const;

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  list(q: { cat?: string; audience?: string; status?: string }) {
    const where: any = { status: { in: ['open', 'full'] } };
    if (q.status) where.status = q.status;
    if (q.audience) where.audience = q.audience;
    if (q.cat) where.category = { slug: q.cat };
    return this.prisma.event.findMany({
      where,
      include: { category: true },
      orderBy: { startsAt: 'asc' },
    });
  }

  async one(id: number) {
    const e = await this.prisma.event.findUnique({ where: { id }, include: { category: true } });
    if (!e) throw new NotFoundException('رویداد پیدا نشد.');
    return { ...e, left: Math.max(0, e.capacity - e.reservedCount) };
  }

  payable(e: { discountPrice: number; onlineAmount: number; price: number; payType: string }, seats: number) {
    const unit = e.discountPrice || e.onlineAmount || e.price;
    if (e.payType === 'deposit') return (e.onlineAmount || Math.ceil(e.price * 0.3)) * seats;
    if (e.payType === 'venue') return 0;
    return unit * seats;
  }

  async reserve(user: any, eventId: number, seats = 1) {
    seats = Math.max(1, Math.min(4, Number(seats) || 1));
    const result = await this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new NotFoundException('رویداد پیدا نشد.');
      if (!['open'].includes(event.status)) throw new BadRequestException('رزرو این رویداد بسته است.');
      if (event.audience === 'boys' && user.gender === 'girl') throw new ForbiddenException('این میز پسرانه است.');
      if (event.audience === 'girls' && user.gender === 'boy') throw new ForbiddenException('این میز دخترانه است.');
      const existing = await tx.reservation.findFirst({
        where: { userId: user.id, eventId, status: { in: [...ACTIVE_RES] } },
      });
      if (existing) throw new BadRequestException('برای این رویداد رزرو فعال داری.');
      const bump = await tx.event.updateMany({
        where: { id: eventId, reservedCount: { lte: event.capacity - seats }, status: 'open' },
        data: { reservedCount: { increment: seats } },
      });
      if (bump.count !== 1) throw new BadRequestException('ظرفیت تکمیل است.');
      const amount = this.payable(event, seats);
      const resv = await tx.reservation.create({
        data: {
          userId: user.id,
          eventId,
          seats,
          amount,
          status: amount === 0 ? 'confirmed' : 'pending',
          paymentStatus: amount === 0 ? 'venue_due' : 'pending',
          holdUntil: amount === 0 ? null : new Date(Date.now() + 15 * 60 * 1000),
        },
      });
      const full = await tx.event.findUnique({ where: { id: eventId } });
      if (full && full.reservedCount >= full.capacity) {
        await tx.event.update({ where: { id: eventId }, data: { status: 'full' } });
      }
      return { resv, event, amount };
    });
    return result;
  }

  async payReservation(user: any, reservationId: number, method: 'wallet' | 'gateway') {
    const resv = await this.prisma.reservation.findUnique({ where: { id: reservationId }, include: { event: true } });
    if (!resv || resv.userId !== user.id) throw new NotFoundException('رزرو پیدا نشد.');
    if (resv.paymentStatus === 'paid' || resv.paymentStatus === 'venue_due' || resv.paymentStatus === 'partially_paid') {
      return { ok: true, already: true };
    }
    const amount = resv.amount;
    if (amount <= 0) {
      await this.prisma.reservation.update({
        where: { id: resv.id },
        data: { status: 'confirmed', paymentStatus: 'venue_due' },
      });
      return { ok: true, paid: 'venue' };
    }
    if (method === 'wallet') {
      return this.prisma.$transaction(async (tx) => {
        const w = await tx.wallet.findUnique({ where: { userId: user.id } });
        if (!w || w.balance < amount) throw new BadRequestException('موجودی کیف کافی نیست.');
        const key = `pay-res-${resv.id}`;
        const dup = await tx.walletTransaction.findUnique({ where: { idempotencyKey: key } });
        if (dup) return { ok: true, paid: 'wallet', already: true };
        await tx.wallet.update({ where: { userId: user.id }, data: { balance: { decrement: amount } } });
        await tx.walletTransaction.create({
          data: { userId: user.id, amount: -amount, kind: 'reserve', note: `رزرو ${resv.event.title}`, idempotencyKey: key },
        });
        await tx.reservation.update({
          where: { id: resv.id },
          data: { status: 'confirmed', paymentStatus: 'paid' },
        });
        await tx.payment.create({
          data: {
            userId: user.id,
            reservationId: resv.id,
            amount,
            kind: 'reservation',
            status: 'paid',
            provider: 'wallet',
            trackingCode: 'W' + randomBytes(6).toString('hex'),
            idempotencyKey: key,
          },
        });
        return { ok: true, paid: 'wallet' };
      });
    }
    const trackingCode = 'S' + randomBytes(8).toString('hex');
    const pay = await this.prisma.payment.create({
      data: {
        userId: user.id,
        reservationId: resv.id,
        amount,
        kind: 'reservation',
        status: 'pending',
        provider: 'sandbox',
        trackingCode,
        idempotencyKey: `gw-res-${resv.id}-${Date.now()}`,
      },
    });
    return { ok: true, paid: 'gateway', trackingCode: pay.trackingCode, amount };
  }

  async verifySandbox(trackingCode: string) {
    const pay = await this.prisma.payment.findUnique({ where: { trackingCode } });
    if (!pay) throw new NotFoundException('پرداخت پیدا نشد.');
    if (pay.status === 'paid') return { ok: true, already: true };
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { id: pay.id }, data: { status: 'paid' } });
      if (pay.kind === 'wallet') {
        const key = `wallet-in-${pay.id}`;
        const dup = await tx.walletTransaction.findUnique({ where: { idempotencyKey: key } });
        if (!dup) {
          await tx.wallet.upsert({
            where: { userId: pay.userId },
            create: { userId: pay.userId, balance: pay.amount },
            update: { balance: { increment: pay.amount } },
          });
          await tx.walletTransaction.create({
            data: { userId: pay.userId, amount: pay.amount, kind: 'charge', note: 'شارژ کیف', idempotencyKey: key },
          });
        }
      }
      if (pay.reservationId) {
        await tx.reservation.update({
          where: { id: pay.reservationId },
          data: { status: 'confirmed', paymentStatus: 'paid' },
        });
      }
    });
    return { ok: true, paid: true };
  }
}

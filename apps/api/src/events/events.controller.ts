import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtGuard, Public, Roles } from '../common/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('events')
@Controller()
@UseGuards(JwtGuard)
export class EventsController {
  constructor(private events: EventsService, private prisma: PrismaService) {}

  @Public() @Get('events')
  list(@Query('cat') cat?: string, @Query('audience') audience?: string, @Query('status') status?: string) {
    return this.events.list({ cat, audience, status });
  }

  @Public() @Get('events/:id')
  one(@Param('id') id: string) {
    return this.events.one(Number(id));
  }

  @Post('reservations')
  async reserve(@Req() req: any, @Body() body: any) {
    const { resv, amount, event } = await this.events.reserve(req.user, Number(body.eventId), Number(body.seats) || 1);
    return { reservation: resv, amount, eventTitle: event.title };
  }

  @Get('reservations/me')
  mine(@Req() req: any) {
    return this.prisma.reservation.findMany({
      where: { userId: req.user.id },
      include: { event: { include: { category: true } } },
      orderBy: { id: 'desc' },
    });
  }

  @Post('reservations/:id/pay')
  pay(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const method = body.method === 'wallet' ? 'wallet' : 'gateway';
    return this.events.payReservation(req.user, Number(id), method);
  }

  @Public() @Post('payments/sandbox/verify')
  verify(@Body() body: any) {
    return this.events.verifySandbox(String(body.trackingCode || ''));
  }

  @Roles('admin') @Get('admin/events')
  adminList() {
    return this.prisma.event.findMany({ include: { category: true }, orderBy: { startsAt: 'desc' } });
  }

  @Roles('admin') @Post('admin/events')
  create(@Body() body: any) {
    return this.prisma.event.create({
      data: {
        title: body.title,
        description: body.description || '',
        venue: body.venue || '',
        startsAt: new Date(body.startsAt),
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        capacity: Number(body.capacity) || 12,
        price: Number(body.price) || 0,
        onlineAmount: Number(body.onlineAmount) || 0,
        venueAmount: Number(body.venueAmount) || 0,
        discountPrice: Number(body.discountPrice) || 0,
        payType: body.payType || 'full',
        audience: body.audience || 'mixed',
        status: body.status || 'open',
        venueNote: body.venueNote || '',
        categoryId: Number(body.categoryId),
      },
    });
  }
}

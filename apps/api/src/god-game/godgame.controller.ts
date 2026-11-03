import { Body, Controller, Get, Param, Post, Req, UseGuards, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtGuard, GodGame } from '../common/jwt.guard';

@ApiTags('god-game')
@Controller('god-game')
@UseGuards(JwtGuard)
@GodGame()
export class GodGameController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@Req() req: any) {
    const where = req.user.role === 'admin' ? {} : { hostId: req.user.id };
    return this.prisma.godGameSession.findMany({ where, orderBy: { id: 'desc' }, take: 40, include: { seats: true, scenario: true } });
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const seatsIn: any[] = Array.isArray(body.seats) ? body.seats : [];
    const session = await this.prisma.godGameSession.create({
      data: {
        title: body.title || 'نشست',
        hostId: req.user.id,
        scenarioId: body.scenarioId ? Number(body.scenarioId) : null,
        status: 'lobby',
        payload: JSON.stringify(body.payload || {}),
        seats: {
          create: seatsIn.map((s, i) => ({
            no: i + 1,
            name: String(s.name || `صندلی ${i + 1}`),
            userId: s.userId ? Number(s.userId) : null,
            roleName: s.roleName || '',
            side: s.side || '',
          })),
        },
      },
      include: { seats: true },
    });
    return session;
  }

  @Get(':id')
  async one(@Req() req: any, @Param('id') id: string) {
    const s = await this.prisma.godGameSession.findUnique({ where: { id: Number(id) }, include: { seats: true, scenario: true } });
    if (!s) throw new NotFoundException();
    if (req.user.role !== 'admin' && s.hostId !== req.user.id) throw new ForbiddenException();
    return s;
  }

  @Post(':id')
  async patch(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const s = await this.prisma.godGameSession.findUnique({ where: { id: Number(id) } });
    if (!s) throw new NotFoundException();
    if (req.user.role !== 'admin' && s.hostId !== req.user.id) throw new ForbiddenException();
    return this.prisma.godGameSession.update({
      where: { id: s.id },
      data: {
        status: body.status || s.status,
        winner: body.winner ?? s.winner,
        nightNum: body.nightNum ?? s.nightNum,
        payload: body.payload ? JSON.stringify(body.payload) : s.payload,
      },
      include: { seats: true },
    });
  }

  @Post(':id/assign')
  async assign(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const s = await this.prisma.godGameSession.findUnique({ where: { id: Number(id) }, include: { seats: true } });
    if (!s) throw new NotFoundException();
    if (req.user.role !== 'admin' && s.hostId !== req.user.id) throw new ForbiddenException();
    const roles: { name: string; side: string }[] = Array.isArray(body.roles) ? body.roles : [];
    const shuffled = [...roles].sort(() => Math.random() - 0.5);
    for (let i = 0; i < s.seats.length; i++) {
      const r = shuffled[i % Math.max(1, shuffled.length)] || { name: 'شهروند', side: 'citizen' };
      await this.prisma.godGameSeat.update({ where: { id: s.seats[i].id }, data: { roleName: r.name, side: r.side } });
    }
    return this.prisma.godGameSession.findUnique({ where: { id: s.id }, include: { seats: true } });
  }
}

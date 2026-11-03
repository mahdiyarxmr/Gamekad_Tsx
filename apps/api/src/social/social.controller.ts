import { Body, Controller, Get, Param, Post, Query, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtGuard, Public, Roles } from '../common/jwt.guard';

@ApiTags('social')
@Controller()
@UseGuards(JwtGuard)
export class SocialController {
  constructor(private prisma: PrismaService) {}

  @Public() @Get('leaderboard')
  async leaderboard(@Query('cat') cat?: string, @Query('gender') gender?: string) {
    const catRow = cat ? await this.prisma.category.findUnique({ where: { slug: cat } }) : null;
    const where: any = {};
    if (catRow) where.categoryId = catRow.id;
    const rows = await this.prisma.playerStat.groupBy({
      by: ['userId'],
      where,
      _sum: { points: true, wins: true, losses: true },
    });
    rows.sort((a, b) => (b._sum.points || 0) - (a._sum.points || 0) || (b._sum.wins || 0) - (a._sum.wins || 0));
    const users = await this.prisma.user.findMany({
        where: { id: { in: rows.map((r) => r.userId) }, status: 'active', ...(gender === 'boy' || gender === 'girl' ? { gender } : {}) },
      select: { id: true, username: true, displayName: true, gender: true, avatar: true, membershipOrigin: true },
    });
    const by = Object.fromEntries(users.map((u) => [u.id, u]));
    return rows
      .filter((r) => by[r.userId])
      .map((r, i) => {
        const w = r._sum.wins || 0;
        const l = r._sum.losses || 0;
        return {
          rank: i + 1,
          ...by[r.userId],
          points: r._sum.points || 0,
          wins: w,
          losses: l,
          winRate: w + l ? Math.round((w / (w + l)) * 100) : 0,
        };
      });
  }

  @Public() @Get('players')
  async players(@Query('q') q?: string, @Query('page') page = '1', @Query('origin') origin?: string) {
    const take = 20;
    const skip = (Math.max(1, Number(page) || 1) - 1) * take;
    const where: any = { status: 'active' };
    if (origin === 'ROKAD' || origin === 'EXTERNAL') where.membershipOrigin = origin;
    if (q) {
      where.OR = [
        { displayName: { contains: q, mode: 'insensitive' } },
        { username: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: { id: true, username: true, displayName: true, avatar: true, gender: true, createdAt: true, membershipOrigin: true },
        orderBy: { displayName: 'asc' },
        take,
        skip,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page: Number(page) || 1 };
  }

  @Public() @Get('players/:username')
  async profile(@Param('username') username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        badges: { include: { badge: true } },
        stats: { include: { category: true } },
        mvpAwards: { where: { active: true } },
      },
    });
    if (!user || user.status !== 'active') throw new NotFoundException('بازیکن پیدا نشد.');
    const recent = await this.prisma.matchPlayer.findMany({
      where: { userId: user.id },
      include: { match: { include: { category: true } } },
      orderBy: { id: 'desc' },
      take: 20,
    });
    const agg = user.stats.reduce((a, s) => ({ points: a.points + s.points, wins: a.wins + s.wins, losses: a.losses + s.losses }), { points: 0, wins: 0, losses: 0 });
    const winRate = agg.wins + agg.losses ? Math.round((agg.wins / (agg.wins + agg.losses)) * 100) : 0;
    const categories = user.stats.map((s) => {
      const t = s.wins + s.losses;
      return {
        name: s.category.name,
        slug: s.category.slug,
        points: s.points,
        wins: s.wins,
        losses: s.losses,
        winRate: t ? Math.round((s.wins / t) * 100) : 0,
      };
    });
    const byRole: Record<string, { wins: number; losses: number }> = {};
    const allPlays = await this.prisma.matchPlayer.findMany({ where: { userId: user.id } });
    for (const row of allPlays) {
      if (!row.roleName) continue;
      const slot = byRole[row.roleName] || { wins: 0, losses: 0 };
      if (row.result === 'win') slot.wins += 1;
      else slot.losses += 1;
      byRole[row.roleName] = slot;
    }
    const booksSrc = await this.prisma.scenario.findMany({
      where: { published: true },
      include: { gameRoles: { where: { active: true }, orderBy: { wakeOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
    const pack = (list: { name: string; side?: string }[]) =>
      list.map((r) => {
        const a = byRole[r.name] || { wins: 0, losses: 0 };
        const t = a.wins + a.losses;
        return {
          name: r.name,
          side: r.side || '',
          wins: a.wins,
          losses: a.losses,
          winRate: t ? Math.round((a.wins / t) * 100) : 0,
        };
      });
    const roleBooks = booksSrc.map((sc) => {
      const roles = pack(sc.gameRoles);
      const tot = roles.reduce((a, r) => ({ wins: a.wins + r.wins, losses: a.losses + r.losses }), { wins: 0, losses: 0 });
      return {
        slug: sc.slug,
        name: sc.name,
        roles,
        winRate: tot.wins + tot.losses ? Math.round((tot.wins / (tot.wins + tot.losses)) * 100) : 0,
      };
    });
    const scen = booksSrc.find((s) => s.slug === 'classic') || booksSrc[0];
    const roles = roleBooks.find((b) => b.slug === scen?.slug)?.roles || pack(Object.keys(byRole).map((name) => ({ name, side: '' })));
    const roleTot = roles.reduce((a, r) => ({ wins: a.wins + r.wins, losses: a.losses + r.losses }), { wins: 0, losses: 0 });
    const { password: _pw, email: _em, phone: _ph, stats: _st, badges: ub, mvpAwards: _mv, ...safe } = user as any;
    return {
      ...safe,
      points: agg.points,
      wins: agg.wins,
      losses: agg.losses,
      winRate,
      badges: (ub || []).map((b: any) => ({
        slug: b.badge.slug,
        name: b.badge.name,
        hint: b.badge.hint,
        color: b.badge.color,
        level: b.level,
        winsToward: b.winsToward,
      })),
      categories,
      radar: categories.map((c) => ({ label: c.name, value: c.winRate })),
      roles,
      roleBooks,
      scenarioName: scen?.name || '',
      roleWinRate: roleTot.wins + roleTot.losses ? Math.round((roleTot.wins / (roleTot.wins + roleTot.losses)) * 100) : 0,
      recent: recent.map((p) => ({
        id: p.id,
        title: p.match.title,
        category: p.match.category.name,
        result: p.result,
        points: p.points,
        roleName: p.roleName,
        createdAt: p.match.createdAt,
      })),
    };
  }

  @Public() @Get('mvp')
  mvp() {
    return this.prisma.mvpAward.findMany({
      where: { active: true },
      include: { user: { select: { username: true, displayName: true, avatar: true, membershipOrigin: true } }, category: true },
      orderBy: { id: 'desc' },
      take: 8,
    });
  }

  @Public() @Get('badges')
  badges() {
    return this.prisma.badge.findMany({ orderBy: { id: 'asc' } });
  }

  @Roles('admin') @Post('admin/badges')
  createBadge(@Body() body: any) {
    return this.prisma.badge.create({
      data: { name: body.name, slug: body.slug || String(body.name).replace(/\s+/g, '-'), hint: body.hint || '', color: body.color || '#0f4c41' },
    });
  }

  @Roles('admin') @Post('admin/users/badge')
  grant(@Body() body: any) {
    return this.prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: Number(body.userId), badgeId: Number(body.badgeId) } },
      update: {},
      create: { userId: Number(body.userId), badgeId: Number(body.badgeId) },
    });
  }

  @Roles('admin') @Post('admin/mvp')
  setMvp(@Body() body: any) {
    return this.prisma.mvpAward.create({
      data: { userId: Number(body.userId), title: body.title || 'MVP', period: body.period || '', categoryId: body.categoryId ? Number(body.categoryId) : null },
    });
  }

  @Roles('admin') @Get('admin/matches')
  matches() {
    return this.prisma.match.findMany({
      include: {
        category: true,
        players: { include: { user: { select: { displayName: true, username: true, membershipOrigin: true, avatar: true } } } },
      },
      orderBy: { id: 'desc' },
      take: 40,
    });
  }

  @Roles('admin') @Post('admin/matches')
  async match(@Req() req: any, @Body() body: any) {
    const seats: any[] = Array.isArray(body.seats) ? body.seats : [];
    const categoryId = Number(body.categoryId);
    const winner = body.winner || 'citizen';
    const match = await this.prisma.match.create({
      data: { categoryId, scenarioId: body.scenarioId ? Number(body.scenarioId) : null, title: body.title || 'میز', winner, scored: true, hostId: req.user.id },
    });
    for (const s of seats) {
      const uid = Number(s.userId);
      if (!uid) continue;
      const result = s.result === 'win' ? 'win' : 'loss';
      const points = Math.max(0, Number(s.points) || 0);
      await this.prisma.matchPlayer.create({ data: { matchId: match.id, userId: uid, result, points } });
      await this.prisma.playerStat.upsert({
        where: { userId_categoryId: { userId: uid, categoryId } },
        create: { userId: uid, categoryId, points, wins: result === 'win' ? 1 : 0, losses: result === 'loss' ? 1 : 0 },
        update: { points: { increment: points }, wins: { increment: result === 'win' ? 1 : 0 }, losses: { increment: result === 'loss' ? 1 : 0 } },
      });
    }
    return { ok: true, id: match.id };
  }
}

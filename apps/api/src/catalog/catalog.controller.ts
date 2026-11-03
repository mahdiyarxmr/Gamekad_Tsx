import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtGuard, Public, Roles } from '../common/jwt.guard';

@ApiTags('catalog')
@Controller()
@UseGuards(JwtGuard)
export class CatalogController {
  constructor(private prisma: PrismaService) {}

  @Public() @Get('categories')
  categories(@Query('kind') kind?: string) {
    const where: any = { active: true };
    if (kind === 'TABLE' || kind === 'ELECTRONIC') where.kind = kind;
    return this.prisma.category.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }

  @Public() @Get('categories/:slug')
  async category(@Param('slug') slug: string) {
    const c = await this.prisma.category.findUnique({ where: { slug }, include: { scenarios: { where: { published: true } } } });
    if (!c) throw new NotFoundException('دسته پیدا نشد.');
    return c;
  }

  @Public() @Get('electronic-games')
  eGames() {
    return this.prisma.electronicGame.findMany({ where: { active: true }, include: { category: true }, orderBy: { sortOrder: 'asc' } });
  }

  @Public() @Get('scenarios')
  scenarios(@Query('category') slug?: string) {
    return this.prisma.scenario.findMany({
      where: { published: true, ...(slug ? { category: { slug } } : {}) },
      include: { gameRoles: { where: { active: true }, orderBy: { wakeOrder: 'asc' } }, category: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  @Public() @Get('scenarios/:slug')
  async scenario(@Param('slug') slug: string) {
    const s = await this.prisma.scenario.findUnique({
      where: { slug },
      include: { gameRoles: { where: { active: true }, orderBy: { wakeOrder: 'asc' } }, category: true },
    });
    if (!s || !s.published) throw new NotFoundException('سناریو پیدا نشد.');
    return s;
  }

  @Public() @Get('game-roles')
  roles(@Query('scenario') slug?: string) {
    return this.prisma.gameRole.findMany({
      where: { active: true, ...(slug ? { scenario: { slug } } : {}) },
      include: { scenario: { select: { name: true, slug: true } } },
      orderBy: { wakeOrder: 'asc' },
    });
  }

  @Roles('admin') @Post('admin/categories')
  createCat(@Body() body: any) {
    if (!body.name || !body.slug) throw new BadRequestException('نام و شناسه لازم است.');
    return this.prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || '',
        image: body.image || '',
        kind: body.kind === 'ELECTRONIC' ? 'ELECTRONIC' : 'TABLE',
        hasRoles: !!body.hasRoles,
        sortOrder: Number(body.sortOrder) || 0,
      },
    });
  }

  @Roles('admin') @Put('admin/categories/:id')
  updateCat(@Param('id') id: string, @Body() body: any) {
    return this.prisma.category.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        description: body.description,
        image: body.image,
        kind: body.kind,
        hasRoles: body.hasRoles,
        sortOrder: body.sortOrder,
        active: body.active,
      },
    });
  }

  @Roles('admin') @Post('admin/electronic-games')
  createEg(@Body() body: any) {
    return this.prisma.electronicGame.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description || '',
        cover: body.cover || '',
        platform: body.platform || '',
        categoryId: body.categoryId ? Number(body.categoryId) : null,
        playersNote: body.playersNote || '',
        sortOrder: Number(body.sortOrder) || 0,
      },
    });
  }

  @Roles('admin') @Post('admin/scenarios')
  createScen(@Body() body: any) {
    return this.prisma.scenario.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || '',
        howto: body.howto || '',
        cover: body.cover || '',
        winConditions: body.winConditions || '',
        dayNight: body.dayNight || '',
        minPlayers: Number(body.minPlayers) || 4,
        maxPlayers: Number(body.maxPlayers) || 24,
        categoryId: Number(body.categoryId),
      },
    });
  }

  @Roles('admin') @Post('admin/game-roles')
  createRole(@Body() body: any) {
    return this.prisma.gameRole.create({
      data: {
        name: body.name,
        description: body.description || '',
        side: body.side || 'citizen',
        symbol: body.symbol || '',
        color: body.color || '',
        nightWake: !!body.nightWake,
        wakeOrder: Number(body.wakeOrder) || 0,
        scenarioId: Number(body.scenarioId),
      },
    });
  }
}

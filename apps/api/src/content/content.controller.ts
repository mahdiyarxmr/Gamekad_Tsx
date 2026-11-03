import { Body, Controller, Get, Param, Post, Query, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtGuard, Public, Roles } from '../common/jwt.guard';

@ApiTags('content')
@Controller()
@UseGuards(JwtGuard)
export class ContentController {
  constructor(private prisma: PrismaService) {}

  private list(kind?: string) {
    return this.prisma.article.findMany({
      where: { published: true, ...(kind ? { kind } : {}) },
      include: { author: { select: { displayName: true, username: true, membershipOrigin: true, avatar: true } }, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Public() @Get('articles')
  articles(@Query('kind') kind?: string) {
    return this.list(kind);
  }

  @Public() @Get('articles/:slug')
  async article(@Param('slug') slug: string) {
    const p = await this.prisma.article.findUnique({
      where: { slug },
      include: { author: { select: { displayName: true, username: true, membershipOrigin: true, avatar: true } }, category: true },
    });
    if (!p || !p.published) throw new NotFoundException('مطلب پیدا نشد.');
    return p;
  }

  @Roles('admin') @Get('admin/articles')
  adminList() {
    return this.prisma.article.findMany({ orderBy: { id: 'desc' } });
  }

  @Roles('admin') @Post('admin/articles')
  create(@Req() req: any, @Body() body: any) {
    return this.prisma.article.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt || '',
        body: String(body.body || '').replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ''),
        cover: body.cover || '',
        kind: body.kind || 'guide',
        published: !!body.published,
        authorId: req.user.id,
        categoryId: body.categoryId ? Number(body.categoryId) : null,
      },
    });
  }
}

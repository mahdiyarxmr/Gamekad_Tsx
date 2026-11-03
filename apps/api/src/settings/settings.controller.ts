import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtGuard, Public, Roles } from '../common/jwt.guard';

const DEFAULT_SECTIONS = [
  { key: 'hero', title: 'سرصفحه', sortOrder: 1 },
  { key: 'spotlight', title: 'رویداد ویژه', sortOrder: 2 },
  { key: 'events', title: 'میزهای پیش رو', sortOrder: 3 },
  { key: 'categories', title: 'بازی‌ها', sortOrder: 4 },
  { key: 'guide', title: 'آموزش سناریو', sortOrder: 5 },
  { key: 'leaderboard', title: 'لیدربورد', sortOrder: 6 },
  { key: 'mvp', title: 'منتخبان', sortOrder: 7 },
  { key: 'matches', title: 'بازی‌های اخیر', sortOrder: 8 },
  { key: 'articles', title: 'آموزش', sortOrder: 9 },
  { key: 'about', title: 'درباره', sortOrder: 10 },
];

@ApiTags('settings')
@Controller()
@UseGuards(JwtGuard)
export class SettingsController {
  constructor(private prisma: PrismaService) {}

  @Public() @Get('settings')
  async get() {
    const rows = await this.prisma.siteSetting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  @Roles('admin') @Post('settings')
  async set(@Body() body: Record<string, string>) {
    for (const [key, value] of Object.entries(body || {})) {
      if (key.toLowerCase().includes('secret') || key.toLowerCase().includes('password')) continue;
      await this.prisma.siteSetting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } });
    }
    return this.get();
  }

  @Public() @Get('homepage')
  async homepage() {
    let rows = await this.prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } });
    if (!rows.length) {
      await this.prisma.homepageSection.createMany({ data: DEFAULT_SECTIONS.map((s) => ({ ...s, enabled: true })) });
      rows = await this.prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } });
    }
    return rows;
  }

  @Roles('admin') @Put('admin/homepage')
  async saveHome(@Body() body: { sections: { key: string; enabled: boolean; sortOrder: number }[] }) {
    const allowed = new Set(DEFAULT_SECTIONS.map((s) => s.key));
    const list = Array.isArray(body.sections) ? body.sections : [];
    const seen = new Set<string>();
    for (const s of list) {
      if (!allowed.has(s.key) || seen.has(s.key)) continue;
      seen.add(s.key);
      await this.prisma.homepageSection.upsert({
        where: { key: s.key },
        update: { enabled: !!s.enabled, sortOrder: Number(s.sortOrder) || 0 },
        create: { key: s.key, title: DEFAULT_SECTIONS.find((d) => d.key === s.key)!.title, enabled: !!s.enabled, sortOrder: Number(s.sortOrder) || 0 },
      });
    }
    return this.homepage();
  }

  @Roles('admin') @Post('admin/homepage/reset')
  async reset() {
    await this.prisma.homepageSection.deleteMany();
    return this.homepage();
  }
}

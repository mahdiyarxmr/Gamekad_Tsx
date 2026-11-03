import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { meUser } from '../common/audit';

const attempts = new Map<string, { n: number; t: number }>();

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private checkBrute(key: string) {
    const now = Date.now();
    const row = attempts.get(key);
    if (row && now - row.t < 15 * 60 * 1000 && row.n >= 8) {
      throw new UnauthorizedException('کمی صبر کن و دوباره تلاش کن.');
    }
  }
  private hit(key: string, ok: boolean) {
    if (ok) {
      attempts.delete(key);
      return;
    }
    const row = attempts.get(key) || { n: 0, t: Date.now() };
    attempts.set(key, { n: row.n + 1, t: Date.now() });
  }

  private access(user: { id: number; username: string; role: string }) {
    return this.jwt.sign({ sub: user.id, username: user.username, role: user.role, typ: 'access' }, { expiresIn: '20m' });
  }

  private async refreshTok(userId: number) {
    const raw = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(raw).digest('hex');
    const expiresAt = new Date(Date.now() + 14 * 86400000);
    await this.prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
    return raw;
  }

  async register(body: any) {
    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const confirm = String(body.confirm || '');
    const displayName = String(body.displayName || username).trim();
    const gender = String(body.gender || '');
    if (username.length < 3) throw new BadRequestException('نام کاربری کوتاه است.');
    if (!email.includes('@')) throw new BadRequestException('ایمیل نامعتبر است.');
    if (password.length < 8) throw new BadRequestException('رمز حداقل ۸ کار است.');
    if (password !== confirm) throw new BadRequestException('تکرار رمز یکی نیست.');
    if (gender !== 'boy' && gender !== 'girl') throw new BadRequestException('جنسیت را انتخاب کن: پسر یا دختر.');
    if (await this.prisma.user.findUnique({ where: { username } })) throw new BadRequestException('نام کاربری گرفته شده.');
    if (await this.prisma.user.findUnique({ where: { email } })) throw new BadRequestException('این ایمیل ثبت شده.');
    const avatar = `/img/presets/p${1 + Math.floor(Math.random() * 12)}.jpg`;
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        phone: String(body.phone || ''),
        password: bcrypt.hashSync(password, 12),
        displayName,
        gender,
        avatar,
        role: 'user',
        wallet: { create: { balance: 0 } },
      },
    });
    const accessToken = this.access(user);
    const refreshToken = await this.refreshTok(user.id);
    return { accessToken, refreshToken, user: meUser(user) };
  }

  async login(body: any) {
    const login = String(body.username || body.email || '').trim();
    const password = String(body.password || '');
    this.checkBrute(login);
    if (!login || !password) throw new BadRequestException('ورود ناقص است.');
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ username: login }, { email: login.toLowerCase() }] },
    });
    if (!user || user.status !== 'active' || !bcrypt.compareSync(password, user.password)) {
      this.hit(login, false);
      throw new UnauthorizedException('ورود نامعتبر است.');
    }
    this.hit(login, true);
    const accessToken = this.access(user);
    const refreshToken = await this.refreshTok(user.id);
    return { accessToken, refreshToken, user: meUser(user) };
  }

  async refresh(raw: string) {
    if (!raw) throw new UnauthorizedException('نشست نامعتبر.');
    const tokenHash = createHash('sha256').update(raw).digest('hex');
    const row = await this.prisma.refreshToken.findFirst({ where: { tokenHash } });
    if (!row || row.expiresAt < new Date()) throw new UnauthorizedException('نشست نامعتبر.');
    await this.prisma.refreshToken.delete({ where: { id: row.id } });
    const user = await this.prisma.user.findUnique({ where: { id: row.userId } });
    if (!user || user.status !== 'active') throw new UnauthorizedException('وارد شو.');
    return { accessToken: this.access(user), refreshToken: await this.refreshTok(user.id), user: meUser(user) };
  }

  async logout(raw: string) {
    if (!raw) return { ok: true };
    const tokenHash = createHash('sha256').update(raw).digest('hex');
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
    return { ok: true };
  }

  async me(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { wallet: true, badges: { include: { badge: true } } },
    });
    if (!user) throw new UnauthorizedException();
    return meUser(user);
  }

  async updateMe(id: number, body: any) {
    const data: Record<string, string> = {};
    if (body.displayName !== undefined) {
      const n = String(body.displayName || '').trim();
      if (n.length < 2) throw new BadRequestException('نام نمایشی حداقل ۲ حرف است.');
      data.displayName = n.slice(0, 40);
    }
    if (body.bio !== undefined) data.bio = String(body.bio || '').slice(0, 280);
    if (body.gender !== undefined) {
      if (body.gender !== 'boy' && body.gender !== 'girl') throw new BadRequestException('جنسیت را انتخاب کن: پسر یا دختر.');
      data.gender = body.gender;
    }
    if (body.avatar !== undefined && body.avatar !== '') {
      const a = String(body.avatar);
      const preset = /^\/img\/presets\/p([1-9]|1[0-2])\.jpg$/.test(a);
      const uploaded = /^\/uploads\/avatars\/\d+\.jpg$/.test(a.split('?')[0]);
      if (!preset && !uploaded) throw new BadRequestException('این عکس پروفایل مجاز نیست.');
      data.avatar = a.split('?')[0];
    }
    if (!Object.keys(data).length) throw new BadRequestException('چیزی برای ذخیره نبود.');
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { wallet: true, badges: { include: { badge: true } } },
    });
    return meUser(user);
  }

  async uploadAvatar(id: number, image: string) {
    const m = String(image || '').match(/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/i);
    if (!m) throw new BadRequestException('فقط عکس JPEG یا PNG بفرست.');
    const buf = Buffer.from(m[2].replace(/\s/g, ''), 'base64');
    if (buf.length < 800) throw new BadRequestException('عکس خالی است.');
    if (buf.length > 900_000) throw new BadRequestException('عکس بزرگ است. تا حدود یک مگابایت کافی است.');
    const dir = join(process.cwd(), '../web/public/uploads/avatars');
    mkdirSync(dir, { recursive: true });
    const rel = `/uploads/avatars/${id}.jpg`;
    writeFileSync(join(dir, `${id}.jpg`), buf);
    const user = await this.prisma.user.update({
      where: { id },
      data: { avatar: rel },
      include: { wallet: true, badges: { include: { badge: true } } },
    });
    return meUser(user);
  }
}

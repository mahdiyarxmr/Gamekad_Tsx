import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const GOD_KEY = 'godGame';
export const GodGame = () => SetMetadata(GOD_KEY, true);

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [ctx.getHandler(), ctx.getClass()]);
    const req = ctx.switchToHttp().getRequest();
    const raw = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!raw) {
      if (isPublic) return true;
      throw new UnauthorizedException('وارد شو.');
    }
    try {
      const payload = this.jwt.verify(raw) as { sub: number; typ?: string };
      if (payload.typ === 'refresh') throw new Error('bad');
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.status !== 'active') throw new UnauthorizedException('وارد شو.');
      const { password, ...safe } = user;
      req.user = safe;
    } catch {
      if (isPublic) return true;
      throw new UnauthorizedException('نشست منقضی شد.');
    }
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (roles?.length && !roles.includes(req.user.role)) {
      throw new ForbiddenException('اجازه نداری.');
    }
    const needGod = this.reflector.getAllAndOverride<boolean>(GOD_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (needGod && req.user.role !== 'admin' && !req.user.godGameAllowed) {
      throw new ForbiddenException('اجازهٔ خدای بازی نداری.');
    }
    return true;
  }
}

import { PrismaService } from '../prisma/prisma.service';

export async function audit(
  prisma: PrismaService,
  actorId: number | null,
  action: string,
  entity: string,
  entityId: string,
  meta = '',
) {
  await prisma.auditLog.create({
    data: { actorId: actorId || undefined, action, entity, entityId, meta: meta.slice(0, 2000) },
  });
}

export function publicUser(u: any) {
  if (!u) return null;
  const { password, email, phone, ...rest } = u;
  return rest;
}

export function meUser(u: any) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

export const identity = (u: any) =>
  u
    ? {
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatar: u.avatar || '',
        gender: u.gender || '',
        membershipOrigin: u.membershipOrigin,
      }
    : null;

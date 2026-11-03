import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export type IdentityUser = {
  username?: string;
  displayName: string;
  avatar?: string;
  membershipOrigin?: string;
};

export default function PlayerIdentity({
  user,
  to,
  meta,
  size = 'md',
}: {
  user: IdentityUser;
  to?: string;
  meta?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const mark = user.membershipOrigin === 'ROKAD';
  const av = size === 'sm' ? 28 : size === 'lg' ? 40 : 36;
  const inner = (
    <span className="inline-flex items-center gap-2 min-w-0 max-w-full">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt=""
          className="rounded-full object-cover shrink-0 bg-surface-muted"
          width={av}
          height={av}
          style={{ width: av, height: av }}
        />
      ) : (
        <span
          className="rounded-full shrink-0 bg-surface-muted inline-block"
          style={{ width: av, height: av }}
          aria-hidden
        />
      )}
      <span className="inline-flex items-center gap-1 min-w-0">
        <span className="font-bold truncate text-[13px] sm:text-sm">{user.displayName}</span>
        {mark && <BrandLogo variant="membership-mark" alt="عضو رکاد" />}
      </span>
      {meta && <span className="text-ink-muted text-[11px] shrink-0">{meta}</span>}
    </span>
  );
  if (to) {
    return (
      <Link to={to} className="hover:text-brand-dark min-w-0" title={mark ? 'عضو رکاد' : undefined}>
        {inner}
      </Link>
    );
  }
  return (
    <span title={mark ? 'عضو رکاد' : undefined} className="min-w-0">
      {inner}
    </span>
  );
}

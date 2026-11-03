import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, CalendarDays, House, Trophy, UserRound } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import PlayerIdentity from '../components/PlayerIdentity';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../lib/auth';

const links = [
  { to: '/', t: 'خانه' },
  { to: '/events', t: 'رویدادها' },
  { to: '/games', t: 'بازی‌ها' },
  { to: '/guide', t: 'آموزش' },
  { to: '/players', t: 'بازیکنان' },
  { to: '/leaderboard', t: 'لیدربورد' },
];

export default function PublicLayout() {
  const { user, logout, isAdmin, canGod } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  if (loc.pathname.startsWith('/admin')) return <Outlet />;
  const tabs = [
    { to: '/events', t: 'رویداد', icon: CalendarDays, home: false },
    { to: '/guide', t: 'آموزش', icon: BookOpen, home: false },
    { to: '/', t: 'خانه', icon: House, home: true },
    { to: '/leaderboard', t: 'برد', icon: Trophy, home: false },
    { to: user ? '/account' : '/login', t: user ? 'من' : 'ورود', icon: UserRound, home: false },
  ];
  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-6xl px-3 h-14 flex items-center gap-2">
          <NavLink to="/" className="shrink-0 flex items-center gap-2" aria-label="رکاد">
            <BrandLogo variant="emblem" className="h-9 w-9 rounded-full object-cover" />
            <span className="font-black hidden sm:inline">رکاد</span>
          </NavLink>
          <nav className="hidden md:flex gap-0.5 mr-2 text-sm font-semibold">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full min-h-11 inline-flex items-center ${isActive ? 'bg-night text-canvas' : 'text-ink-muted hover:bg-surface-muted'}`
                }
              >
                {l.t}
              </NavLink>
            ))}
            {canGod && <NavLink to="/host/god-game" className="px-3 py-2 rounded-full text-brand-dark min-h-11 inline-flex items-center">میزبان</NavLink>}
            {isAdmin && <NavLink to="/admin" className="px-3 py-2 rounded-full text-orange min-h-11 inline-flex items-center">مدیریت</NavLink>}
          </nav>
          <div className="mr-auto flex items-center gap-1">
            <ThemeToggle />
            {user ? (
              <>
                <NavLink to="/account" className="hidden md:flex">
                  <PlayerIdentity user={user} size="sm" />
                </NavLink>
                <button className="text-sm text-ink-muted px-2 min-h-11" onClick={() => { logout(); nav('/'); }}>خروج</button>
              </>
            ) : (
              <NavLink to="/login" className="btn btn-brand text-sm py-1.5 rounded-full">ورود</NavLink>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>
      <footer className="hidden md:block border-t border-line py-10 text-sm text-ink-muted">
        <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <BrandLogo variant="emblem" className="h-10 w-10 rounded-full" />
            <div>
              <p className="font-black text-ink">رکاد</p>
              <p>باشگاه بازی و رویداد</p>
            </div>
          </div>
          <p>منطقه زمانی آسیا/تهران · مبلغ‌ها به تومان</p>
          <p>کیف پول داخل حساب است.</p>
        </div>
      </footer>
      <nav className="tabbar md:hidden" aria-label="منوی گوشی">
        {tabs.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.home} className={({ isActive }) => `${isActive ? 'active' : ''} ${l.home ? 'tab-home' : ''}`}>
            {({ isActive }) =>
              l.home ? (
                <>
                  <span className="fab"><House size={22} strokeWidth={2.4} /></span>
                  <span className="mt-1">خانه</span>
                </>
              ) : (
                <>
                  <l.icon size={18} strokeWidth={isActive ? 2.6 : 2} />
                  <span>{l.t}</span>
                </>
              )
            }
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

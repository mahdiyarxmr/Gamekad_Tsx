import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays, Trophy, UserRound, Wallet, House } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function Shell() {
  const { user, logout, isAdmin, canGod } = useAuth();
  const nav = useNavigate();
  const links = [
    { to: '/', t: 'خانه' },
    { to: '/events', t: 'رویدادها' },
    { to: '/leaderboard', t: 'جدول' },
    { to: '/players', t: 'بازیکن‌ها' },
    { to: '/learn', t: 'آموزش' },
    ...(canGod ? [{ to: '/god-game', t: 'میزبان' }] : []),
    ...(isAdmin ? [{ to: '/admin', t: 'مدیریت' }] : []),
  ];
  const mobile = [
    { to: '/', t: 'خانه', icon: House },
    { to: '/events', t: 'رویداد', icon: CalendarDays },
    { to: '/leaderboard', t: 'جدول', icon: Trophy },
    { to: '/wallet', t: 'کیف', icon: Wallet },
    { to: user ? '/me' : '/login', t: user ? 'من' : 'ورود', icon: UserRound },
  ];
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-6xl px-3 h-14 flex items-center gap-3">
          <NavLink to="/" className="font-black text-pine shrink-0">اتاق بازی</NavLink>
          <nav className="hidden md:flex gap-1 mr-auto text-sm overflow-x-auto">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `px-3 py-1.5 rounded-full ${isActive ? 'bg-pine text-paper' : 'text-ink/70 hover:bg-sand'}`}>
                {l.t}
              </NavLink>
            ))}
          </nav>
          <div className="mr-auto md:mr-0">
            {user ? (
              <button className="text-xs" onClick={() => { logout(); nav('/'); }}>خروج</button>
            ) : (
              <NavLink to="/login" className="btn btn-pine text-sm py-1.5">ورود</NavLink>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <footer className="hidden md:block border-t border-line py-8 text-sm text-ink/60">
        <div className="mx-auto max-w-6xl px-4 flex justify-between">
          <p>اتاق بازی · رویداد و رزرو</p>
          <p>منطقه زمانی آسیا/تهران</p>
        </div>
      </footer>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-paper border-t border-line grid grid-cols-5 text-[11px] text-center pb-[env(safe-area-inset-bottom)]">
        {mobile.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `py-2 ${isActive ? 'text-clay' : 'text-ink/50'}`}>
            <l.icon size={18} className="mx-auto" />
            {l.t}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

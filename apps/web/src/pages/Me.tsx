import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { faDay } from '../lib/fmt';

export default function Me() {
  const { username } = useParams();
  const { user, loading } = useAuth();
  const who = username || user?.username || '';
  const q = useQuery({
    queryKey: ['pub', who],
    queryFn: () => api('/players/' + encodeURIComponent(who)),
    enabled: !!who,
  });
  const mine = useQuery({
    queryKey: ['res-me'],
    queryFn: () => api('/reservations/me'),
    enabled: !username && !!user,
  });
  if (!username && loading) return <p className="p-10 text-center">…</p>;
  if (!username && !user) {
    return (
      <div className="p-16 text-center">
        <p className="mb-4">برای پروفایل وارد شو.</p>
        <Link to="/login" className="btn btn-pine">ورود</Link>
      </div>
    );
  }
  const p = q.data;
  if (!p) return <p className="p-10 text-center">{q.isError ? (q.error as Error).message : '…'}</p>;
  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-3xl font-black">{p.displayName}</h1>
      <p className="text-ink/50 text-sm mt-1">@{p.username} · عضویت {faDay(p.createdAt)}</p>
      <div className="grid grid-cols-3 gap-2 mt-6">
        <Stat t="امتیاز" v={p.points} />
        <Stat t="برد" v={p.wins} />
        <Stat t="نرخ برد" v={(p.winRate || 0) + '٪'} />
      </div>
      {!!p.badges?.length && (
        <div className="mt-6 flex flex-wrap gap-2">
          {p.badges.map((b: any) => (
            <span key={b.badge.slug} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: b.badge.color + '22', color: b.badge.color }}>
              {b.badge.name}
            </span>
          ))}
        </div>
      )}
      <h2 className="mt-8 font-black">بازی‌های اخیر</h2>
      <ul className="mt-2 space-y-2">
        {(p.recent || []).map((m: any) => (
          <li key={m.id} className="card p-3 flex justify-between">
            <span>{m.title}</span>
            <span className="text-pine font-bold">+{m.points}</span>
          </li>
        ))}
        {!p.recent?.length && <p className="text-ink/50 text-sm">هنوز ثبت نشده.</p>}
      </ul>
      {!!mine.data && (
        <>
          <h2 className="mt-8 font-black">رزروهای من</h2>
          <ul className="mt-2 space-y-2">
            {mine.data.map((r: any) => (
              <li key={r.id} className="card p-3">
                <p className="font-bold">{r.event?.title}</p>
                <p className="text-xs text-ink/50">{r.paymentStatus} · {r.status}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
function Stat({ t, v }: { t: string; v: any }) {
  return (
    <div className="card p-3 text-center">
      <p className="text-[11px] text-ink/50">{t}</p>
      <p className="font-black text-lg">{v}</p>
    </div>
  );
}

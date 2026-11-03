import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NavLink, Navigate, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import BrandLogo from '../components/BrandLogo';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { faDay, toman } from '../lib/fmt';

const GROUPS = [
  { t: 'میزبانی', items: [{ to: '/admin', t: 'داشبورد', end: true }, { to: '/admin/layout', t: 'چینش خانه' }] },
  { t: 'رویدادها', items: [{ to: '/admin/events', t: 'نشست‌ها' }, { to: '/admin/reservations', t: 'رزرو و پرداخت' }] },
  { t: 'بازی‌ها', items: [{ to: '/admin/games', t: 'الکترونیک' }, { to: '/admin/categories', t: 'دسته‌ها و نقش‌ها' }] },
  {
    t: 'خدای بازی',
    items: [
      { to: '/host/god-game', t: 'میز شب' },
      { to: '/admin/matches', t: 'بازی‌های اخیر' },
      { to: '/admin/badges', t: 'مدال‌ها' },
      { to: '/admin/scores', t: 'امتیاز' },
    ],
  },
  { t: 'محتوا', items: [{ to: '/admin/learn', t: 'آموزش نوشته' }] },
  { t: 'افراد', items: [{ to: '/admin/users', t: 'کاربران' }] },
  { t: 'تنظیمات', items: [{ to: '/admin/settings', t: 'تنظیمات رکاد' }] },
];

const TITLES: Record<string, string> = {
  dashboard: 'داشبورد',
  layout: 'چینش صفحهٔ اصلی',
  events: 'نشست‌های بازی',
  reservations: 'رزرو و پرداخت',
  games: 'بازی‌های الکترونیک',
  categories: 'دسته‌ها و نقش‌ها',
  matches: 'بازی‌های اخیر',
  badges: 'مدال‌ها',
  scores: 'امتیاز و لیدربورد',
  learn: 'آموزش نوشته',
  users: 'کاربران',
  settings: 'تنظیمات رکاد',
};

function payFa(s: string) {
  return ({ pending: 'در انتظار', paid: 'پرداخت‌شده', confirmed: 'تأیید', cancelled: 'لغو', refunded: 'بازگشت', failed: 'ناموفق' } as any)[s] || s;
}

export default function Admin() {
  const { user, loading, isAdmin, canGod } = useAuth();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const sub = useMemo(() => {
    const p = loc.pathname.replace(/^\/admin\/?/, '');
    return p.split('/')[0] || 'dashboard';
  }, [loc.pathname]);

  if (loading) return <p className="p-10 text-center text-ink-muted">در حال بارگذاری…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin && !canGod) {
    return (
      <div className="p-16 text-center">
        <p className="font-black text-xl">این صفحه برای میزبان است.</p>
      </div>
    );
  }

  const groups = isAdmin ? GROUPS : [GROUPS[3]];
  const currentGroup = groups.find((g) => g.items.some((it) => it.to === loc.pathname || (it.to === '/admin' && sub === 'dashboard')))?.t;
  const [openG, setOpenG] = useState(currentGroup || groups[0]?.t);

  return (
    <div className={`admin-shell ${open ? 'nav-open' : ''}`}>
      <button type="button" className="admin-scrim" aria-label="بستن منو" onClick={() => setOpen(false)} />
      <aside className="admin-aside">
        <NavLink to="/" className="admin-brand" onClick={() => setOpen(false)}>
          <BrandLogo variant="emblem" className="h-10 w-10 rounded-full object-cover" />
          <span>
            <b className="en">GAMEKAD</b>
            <small>{isAdmin ? 'پنل میزبان' : 'خدای بازی'}</small>
          </span>
        </NavLink>
        {groups.map((g) => {
          const isOpen = openG === g.t;
          return (
            <div key={g.t} className={`aside-g${isOpen ? ' is-open' : ''}`}>
              <button type="button" className="aside-g-h" aria-expanded={isOpen} onClick={() => setOpenG(isOpen ? '' : g.t)}>
                <span>{g.t}</span>
                <i className="aside-caret" aria-hidden />
              </button>
              <div className="aside-g-b">
                {g.items.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={(it as any).end}
                    className={({ isActive }) => (isActive ? 'is-active' : '')}
                    onClick={() => setOpen(false)}
                  >
                    {it.t}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
        <NavLink to="/" className="admin-foot" onClick={() => setOpen(false)}>مشاهده سایت</NavLink>
      </aside>
      <div className="admin-main">
        <header className="admin-top">
          <button type="button" className="admin-burger" aria-label="منوی مدیریت" onClick={() => setOpen((v) => !v)}>
            <span />
            <span />
            <span />
          </button>
          <h1>{TITLES[sub] || 'پنل'}</h1>
          <span className="admin-who">{user.displayName}</span>
        </header>
        {sub === 'dashboard' && <Dash />}
        {sub === 'layout' && <HomeLayout />}
        {sub === 'events' && <EventsPane />}
        {sub === 'reservations' && <ResPane />}
        {sub === 'games' && <GamesPane />}
        {sub === 'categories' && <CatsPane />}
        {sub === 'matches' && <MatchesPane />}
        {sub === 'badges' && <BadgesPane />}
        {sub === 'scores' && <ScoresPane />}
        {sub === 'learn' && <LearnPane />}
        {sub === 'users' && <UsersPane />}
        {sub === 'settings' && <SettingsPane />}
      </div>
    </div>
  );
}

function Dash() {
  const q = useQuery({ queryKey: ['ad'], queryFn: () => api('/admin/dashboard') });
  const res = useQuery({ queryKey: ['ad-res'], queryFn: () => api('/admin/reservations') });
  const d = q.data || {};
  return (
    <>
      <div className="admin-kpis">
        <div className="kpi"><span>بازیکنان</span><b>{d.users ?? '—'}</b></div>
        <div className="kpi"><span>نشست پیش‌رو</span><b>{d.events ?? '—'}</b></div>
        <div className="kpi"><span>رزرو پرداخت‌شده</span><b>{d.paidReservations ?? '—'}</b></div>
        <div className="kpi"><span>آموزش</span><b>{d.articles ?? '—'}</b></div>
        <div className="kpi kpi-wide"><span>مجموع پیش‌پرداخت موفق</span><b>{toman(d.revenue || 0)}</b></div>
      </div>
      <div className="card overflow-hidden">
        <h3 className="px-4 pt-4 font-black">آخرین رزروها</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>بازیکن</th><th>نشست</th><th>پرداخت</th><th>حضور</th></tr></thead>
            <tbody>
              {(res.data || []).slice(0, 8).map((r: any) => (
                <tr key={r.id}>
                  <td>{r.user?.displayName}</td>
                  <td>{r.event?.title}</td>
                  <td>{payFa(r.paymentStatus)}</td>
                  <td>{r.status === 'confirmed' ? 'حاضر' : r.status === 'cancelled' ? 'غایب' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function HomeLayout() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['home'], queryFn: () => api('/homepage') });
  const [rows, setRows] = useState<any[] | null>(null);
  const list = rows || q.data || [];
  const save = useMutation({
    mutationFn: () => api('/admin/homepage', { method: 'PUT', body: JSON.stringify({ sections: list.map((s: any, i: number) => ({ key: s.key, enabled: s.enabled, sortOrder: i + 1 })) }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['home'] }); setRows(null); },
  });
  function move(i: number, dir: number) {
    const next = [...list];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
  }
  return (
    <>
      <p className="admin-lead">مثل بلوک‌های صفحه: بالا و پایین ببر، چشم را خاموش کن تا بخش از خانه برداشته شود.</p>
      <ol className="layout-list">
        {list.map((s: any, i: number) => (
          <li key={s.key} className="layout-item">
            <span className="layout-handle" aria-hidden>⋮⋮</span>
            <label className="layout-on">
              <input type="checkbox" checked={!!s.enabled} onChange={() => setRows(list.map((x: any, k: number) => k === i ? { ...x, enabled: !x.enabled } : x))} />
              <span>{s.title}</span>
            </label>
            <span className="layout-id">{s.key}</span>
            <span className="layout-move">
              <button type="button" className="btn btn-sm" onClick={() => move(i, -1)}>بالا</button>
              <button type="button" className="btn btn-sm" onClick={() => move(i, 1)}>پایین</button>
            </span>
          </li>
        ))}
      </ol>
      <button type="button" className="btn btn-brand mt-4" disabled={save.isPending} onClick={() => save.mutate()}>ذخیره چینش</button>
    </>
  );
}

function EventsPane() {
  const qc = useQueryClient();
  const cats = useQuery({ queryKey: ['cats'], queryFn: () => api('/categories') });
  const list = useQuery({ queryKey: ['ad-ev'], queryFn: () => api('/admin/events') });
  const [tab, setTab] = useState<'list' | 'add'>('list');
  const [form, setForm] = useState({ title: '', description: '', venue: 'سالن اصلی گیم‌کاد', startsAt: '', endsAt: '', capacity: '12', price: '', categoryId: '', audience: 'boys', payType: 'full', status: 'open', venueNote: '' });
  const save = useMutation({
    mutationFn: () => api('/admin/events', { method: 'POST', body: JSON.stringify({ ...form, capacity: Number(form.capacity), price: Number(form.price) || 0, categoryId: Number(form.categoryId), startsAt: form.startsAt, endsAt: form.endsAt || undefined }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ad-ev'] }); setTab('list'); },
  });
  return (
    <>
      <div className="admin-tabs">
        <button type="button" className={`admin-tab${tab === 'add' ? ' is-on' : ''}`} onClick={() => setTab('add')}>نشست جدید</button>
        <button type="button" className={`admin-tab${tab === 'list' ? ' is-on' : ''}`} onClick={() => setTab('list')}>فهرست</button>
      </div>
      {tab === 'add' && (
        <form className="card p-5 space-y-3" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <label className="block"><span className="field-lab">دسته</span>
            <select className="w-full card px-3 py-2" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
              <option value="">انتخاب دسته</option>
              {(cats.data || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block"><span className="field-lab">عنوان</span><input className="w-full card px-3 py-2" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="شب مافیا کلاسیک" /></label>
          <label className="block"><span className="field-lab">توضیح</span><textarea className="w-full card px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block"><span className="field-lab">شروع</span><input type="datetime-local" className="w-full card px-3 py-2" required value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} /></label>
            <label className="block"><span className="field-lab">پایان</span><input type="datetime-local" className="w-full card px-3 py-2" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} /></label>
            <label className="block"><span className="field-lab">مکان</span><input className="w-full card px-3 py-2" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></label>
            <label className="block"><span className="field-lab">ظرفیت</span><input type="number" className="w-full card px-3 py-2" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></label>
            <label className="block"><span className="field-lab">قیمت (تومان)</span><input type="number" className="w-full card px-3 py-2" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="مثلاً ۱۰۰۰۰۰" /></label>
            <label className="block"><span className="field-lab">مخاطب</span>
              <select className="w-full card px-3 py-2" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                <option value="boys">پسران</option>
                <option value="girls">دختران</option>
                <option value="mixed">مختلط</option>
              </select>
            </label>
          </div>
          <label className="block"><span className="field-lab">چطور پول بگیرد؟</span>
            <select className="w-full card px-3 py-2" value={form.payType} onChange={(e) => setForm({ ...form, payType: e.target.value })}>
              <option value="full">کل مبلغ آنلاین</option>
              <option value="deposit">بخشی آنلاین، بقیه در محل</option>
              <option value="venue">پول فقط در محل</option>
            </select>
          </label>
          <button disabled={save.isPending} className="btn btn-brand">{save.isPending ? 'در حال ذخیره…' : 'ذخیره نشست'}</button>
          {save.isError && <p className="text-danger text-sm">{(save.error as Error).message}</p>}
        </form>
      )}
      {tab === 'list' && (
        <div className="card overflow-hidden">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>عنوان</th><th>دسته</th><th>شروع</th><th>ظرفیت</th><th>قیمت</th><th>وضعیت</th></tr></thead>
              <tbody>
                {(list.data || []).map((e: any) => (
                  <tr key={e.id}>
                    <td>{e.title}</td>
                    <td>{e.category?.name}</td>
                    <td>{faDay(e.startsAt)}</td>
                    <td>{e.reservedCount}/{e.capacity}</td>
                    <td>{toman(e.price)}</td>
                    <td>{e.status === 'open' ? 'پیش‌رو' : e.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function ResPane() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['ad-res'], queryFn: () => api('/admin/reservations') });
  return (
    <div className="card overflow-hidden">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>بازیکن</th><th>نشست</th><th>پرداخت</th><th>وضعیت</th><th></th></tr></thead>
          <tbody>
            {(q.data || []).map((r: any) => (
              <tr key={r.id}>
                <td>{r.user?.displayName}<br /><span className="text-xs text-ink-muted">@{r.user?.username}</span></td>
                <td>{r.event?.title}</td>
                <td>{payFa(r.paymentStatus)}</td>
                <td>{r.status}</td>
                <td>
                  <button type="button" className="btn btn-sm" onClick={() => api(`/admin/reservations/${r.id}`, { method: 'POST', body: JSON.stringify({ status: 'confirmed' }) }).then(() => qc.invalidateQueries({ queryKey: ['ad-res'] }))}>حضور</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GamesPane() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['eg'], queryFn: () => api('/electronic-games') });
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('PS5');
  const save = useMutation({
    mutationFn: () => api('/admin/electronic-games', { method: 'POST', body: JSON.stringify({ title, slug: title, platform, description: '' }) }),
    onSuccess: () => { setTitle(''); qc.invalidateQueries({ queryKey: ['eg'] }); },
  });
  return (
    <>
      <form className="card p-5 space-y-3 mb-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <label className="block"><span className="field-lab">عنوان بازی</span><input className="w-full card px-3 py-2" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="فیفا" /></label>
        <label className="block"><span className="field-lab">پلتفرم</span><input className="w-full card px-3 py-2" value={platform} onChange={(e) => setPlatform(e.target.value)} /></label>
        <button className="btn btn-brand" disabled={save.isPending}>افزودن</button>
      </form>
      <ul className="space-y-2">
        {(q.data || []).map((g: any) => (
          <li key={g.id} className="card p-3 flex justify-between gap-3">
            <b>{g.title}</b>
            <span className="text-sm text-ink-muted">{g.platform}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function CatsPane() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['cats'], queryFn: () => api('/categories') });
  const sc = useQuery({ queryKey: ['scen'], queryFn: () => api('/scenarios') });
  const [name, setName] = useState('');
  const save = useMutation({
    mutationFn: () => api('/admin/categories', { method: 'POST', body: JSON.stringify({ name, slug: name, kind: 'table', description: '' }) }),
    onSuccess: () => { setName(''); qc.invalidateQueries({ queryKey: ['cats'] }); },
  });
  return (
    <>
      <form className="card p-5 space-y-3 mb-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <label className="block"><span className="field-lab">نام دسته</span><input className="w-full card px-3 py-2" required value={name} onChange={(e) => setName(e.target.value)} /></label>
        <button className="btn btn-brand">افزودن دسته</button>
      </form>
      <h3 className="font-black mb-2">دسته‌ها</h3>
      <ul className="space-y-2 mb-6">
        {(q.data || []).map((c: any) => <li key={c.id} className="card p-3">{c.name}<span className="text-xs text-ink-muted mr-2">{c.kind}</span></li>)}
      </ul>
      <h3 className="font-black mb-2">سناریوها</h3>
      <ul className="space-y-2">
        {(sc.data || []).map((s: any) => <li key={s.id} className="card p-3">{s.name}</li>)}
      </ul>
    </>
  );
}

function MatchesPane() {
  const q = useQuery({ queryKey: ['ad-m'], queryFn: () => api('/admin/matches') });
  return (
    <div className="card overflow-hidden">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>عنوان</th><th>دسته</th><th>تاریخ</th><th>بازیکنان</th></tr></thead>
          <tbody>
            {(q.data || []).map((m: any) => (
              <tr key={m.id}>
                <td>{m.title}</td>
                <td>{m.category?.name}</td>
                <td>{m.playedAt ? faDay(m.playedAt) : '—'}</td>
                <td>{(m.players || []).map((p: any) => p.user?.displayName).join('، ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!q.data?.length && <p className="p-4 text-ink-muted text-sm">هنوز بازی ثبت‌شده‌ای نیست.</p>}
    </div>
  );
}

function BadgesPane() {
  const qc = useQueryClient();
  const b = useQuery({ queryKey: ['badges'], queryFn: () => api('/badges') });
  const users = useQuery({ queryKey: ['ad-u'], queryFn: () => api('/admin/users') });
  const [userId, setUserId] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const grant = useMutation({
    mutationFn: () => api('/admin/badges', { method: 'POST', body: JSON.stringify({ userId: Number(userId), badgeId: Number(badgeId) }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ad-u'] }),
  });
  return (
    <>
      <form className="card p-5 space-y-3 mb-4" onSubmit={(e) => { e.preventDefault(); grant.mutate(); }}>
        <label className="block"><span className="field-lab">بازیکن</span>
          <select className="w-full card px-3 py-2" value={userId} onChange={(e) => setUserId(e.target.value)} required>
            <option value="">انتخاب</option>
            {(users.data || []).map((u: any) => <option key={u.id} value={u.id}>{u.displayName} @{u.username}</option>)}
          </select>
        </label>
        <label className="block"><span className="field-lab">مدال</span>
          <select className="w-full card px-3 py-2" value={badgeId} onChange={(e) => setBadgeId(e.target.value)} required>
            <option value="">انتخاب</option>
            {(b.data || []).map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </label>
        <button className="btn btn-brand" disabled={grant.isPending}>اعطای مدال</button>
      </form>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {(b.data || []).map((x: any) => (
          <li key={x.id} className="card p-3 text-center text-sm font-bold">{x.name}</li>
        ))}
      </ul>
    </>
  );
}

function ScoresPane() {
  const q = useQuery({ queryKey: ['lb-ad'], queryFn: () => api('/leaderboard') });
  const rows = q.data?.rows || q.data || [];
  return (
    <div className="card overflow-hidden">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>#</th><th>بازیکن</th><th>امتیاز</th></tr></thead>
          <tbody>
            {(Array.isArray(rows) ? rows : []).slice(0, 40).map((r: any, i: number) => (
              <tr key={r.username || i}>
                <td>{r.rank || i + 1}</td>
                <td>{r.displayName || r.user?.displayName}</td>
                <td>{r.points ?? r.score ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LearnPane() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['ad-art'], queryFn: () => api('/admin/articles') });
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const save = useMutation({
    mutationFn: () => api('/admin/articles', { method: 'POST', body: JSON.stringify({ title, slug: title, excerpt: body.slice(0, 140), body, published: true, kind: 'guide' }) }),
    onSuccess: () => { setTitle(''); setBody(''); qc.invalidateQueries({ queryKey: ['ad-art'] }); },
  });
  return (
    <>
      <form className="card p-5 space-y-3 mb-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <label className="block"><span className="field-lab">عنوان</span><input className="w-full card px-3 py-2" required value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="block"><span className="field-lab">متن</span><textarea className="w-full card px-3 py-2 min-h-32" required value={body} onChange={(e) => setBody(e.target.value)} /></label>
        <button className="btn btn-brand" disabled={save.isPending}>انتشار</button>
      </form>
      <ul className="space-y-2">
        {(q.data || []).map((a: any) => (
          <li key={a.id} className="card p-3">
            <b>{a.title}</b>
            <p className="text-xs text-ink-muted mt-1">{a.published ? 'منتشر شده' : 'پیش‌نویس'}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function UsersPane() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const users = useQuery({ queryKey: ['ad-u', q], queryFn: () => api(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`) });
  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '', gender: 'boy', origin: 'ROKAD' });
  const create = useMutation({
    mutationFn: () => api('/admin/users', { method: 'POST', body: JSON.stringify(form) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ad-u'] }); setForm({ displayName: '', username: '', email: '', password: '', gender: 'boy', origin: 'ROKAD' }); },
  });
  async function patch(id: number, body: any) {
    await api(`/admin/users/${id}`, { method: 'POST', body: JSON.stringify(body) });
    qc.invalidateQueries({ queryKey: ['ad-u'] });
  }
  async function wallet(id: number, delta: number) {
    await api('/admin/wallet/adjust', { method: 'POST', body: JSON.stringify({ userId: id, amount: delta }) });
    qc.invalidateQueries({ queryKey: ['ad-u'] });
  }
  return (
    <>
      <form className="card p-5 space-y-3 mb-4" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
        <h3 className="font-black">کاربر جدید</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block"><span className="field-lab">نام نمایشی</span><input className="w-full card px-3 py-2" required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} /></label>
          <label className="block"><span className="field-lab">نام کاربری</span><input className="w-full card px-3 py-2" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
          <label className="block"><span className="field-lab">ایمیل</span><input type="email" className="w-full card px-3 py-2" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="block"><span className="field-lab">رمز عبور</span><input type="password" className="w-full card px-3 py-2" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <label className="block"><span className="field-lab">جنسیت</span>
            <select className="w-full card px-3 py-2" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="boy">پسر</option>
              <option value="girl">دختر</option>
            </select>
          </label>
          <label className="block"><span className="field-lab">عضویت</span>
            <select className="w-full card px-3 py-2" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })}>
              <option value="ROKAD">رکاد</option>
              <option value="EXTERNAL">خارجی</option>
            </select>
          </label>
        </div>
        <button className="btn btn-brand" disabled={create.isPending}>ساخت حساب</button>
        {create.isError && <p className="text-danger text-sm">{(create.error as Error).message}</p>}
      </form>
      <input className="w-full card px-3 py-2 mb-3" placeholder="جستجوی نام یا نام کاربری" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="space-y-3">
        {(users.data || []).map((u: any) => (
          <UserRow key={u.id} u={u} onPatch={patch} onWallet={wallet} />
        ))}
      </div>
    </>
  );
}

function UserRow({ u, onPatch, onWallet }: { u: any; onPatch: (id: number, b: any) => void; onWallet: (id: number, d: number) => void }) {
  const [delta, setDelta] = useState('');
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        {u.avatar ? <img src={u.avatar} alt="" className="w-11 h-11 rounded-full object-cover" /> : <span className="w-11 h-11 rounded-full bg-night/10" />}
        <div className="min-w-0">
          <p className="font-black truncate">{u.displayName}</p>
          <p className="text-xs text-ink-muted" dir="ltr">@{u.username}</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        <select className="card px-2 py-2 text-sm" defaultValue={u.membershipOrigin} onChange={(e) => onPatch(u.id, { origin: e.target.value, membershipOrigin: e.target.value })}>
          <option value="ROKAD">رکاد</option>
          <option value="EXTERNAL">خارجی</option>
        </select>
        <select className="card px-2 py-2 text-sm" defaultValue={u.gender || ''} onChange={(e) => onPatch(u.id, { gender: e.target.value })}>
          <option value="">جنسیت</option>
          <option value="boy">پسر</option>
          <option value="girl">دختر</option>
        </select>
        <select className="card px-2 py-2 text-sm" defaultValue={u.godGameAllowed ? '1' : '0'} onChange={(e) => onPatch(u.id, { host: e.target.value === '1' })}>
          <option value="0">بدون میز</option>
          <option value="1">خدای بازی</option>
        </select>
        <div className="flex gap-1">
          <input className="card px-2 py-2 text-sm flex-1" placeholder="+/− تومان" value={delta} onChange={(e) => setDelta(e.target.value)} />
          <button type="button" className="btn btn-sm" onClick={() => { const n = Number(delta); if (n) { onWallet(u.id, n); setDelta(''); } }}>کیف</button>
        </div>
      </div>
    </div>
  );
}

function SettingsPane() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['set'], queryFn: () => api('/settings') });
  const [form, setForm] = useState<any>(null);
  const s = form || q.data || {};
  const save = useMutation({
    mutationFn: () => api('/settings', { method: 'POST', body: JSON.stringify({
      cafe_address: s.cafe_address || s.address || '',
      cafe_phone: s.cafe_phone || s.phone || '',
      cafe_hours: s.cafe_hours || s.hours || '',
      about: s.about || '',
      site_name: s.site_name || 'رکاد',
    }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['set'] }); setForm(null); },
  });
  function set(k: string, v: string) {
    setForm({ ...s, [k]: v });
  }
  return (
    <form className="card p-5 space-y-3" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <label className="block"><span className="field-lab">آدرس کافه</span><input className="w-full card px-3 py-2" value={s.cafe_address || s.address || ''} onChange={(e) => set('cafe_address', e.target.value)} /></label>
      <label className="block"><span className="field-lab">تلفن</span><input className="w-full card px-3 py-2" dir="ltr" value={s.cafe_phone || s.phone || ''} onChange={(e) => set('cafe_phone', e.target.value)} /></label>
      <label className="block"><span className="field-lab">ساعت کار</span><input className="w-full card px-3 py-2" value={s.cafe_hours || s.hours || ''} onChange={(e) => set('cafe_hours', e.target.value)} /></label>
      <label className="block"><span className="field-lab">درباره رکاد</span><textarea className="w-full card px-3 py-2 min-h-32" value={s.about || ''} onChange={(e) => set('about', e.target.value)} /></label>
      <button className="btn btn-brand" disabled={save.isPending}>{save.isPending ? 'در حال ذخیره…' : 'ذخیره تنظیمات'}</button>
    </form>
  );
}

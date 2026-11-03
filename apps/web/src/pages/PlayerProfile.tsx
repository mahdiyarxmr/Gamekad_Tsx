import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import BrandLogo from '../components/BrandLogo';
import SpiderChart from '../components/SpiderChart';
import { api } from '../lib/api';
import { faDay } from '../lib/fmt';

const ICONS: Record<string, string> = {
  mvp: '★',
  clutch: '⚡',
  host: '♠',
  fair: '✦',
  wolf: '🐺',
  detective: '🔍',
  speech: '🎤',
  survivor: '🛡',
  shield: '🕊',
  jester: '🎭',
  veteran: '🏛',
  spark: '✨',
  duo: '🤝',
  night: '🌙',
  gold: '★',
};

type Pane = 'score' | 'medal' | 'radar' | 'roles';

const genderFa = (g: string) => (g === 'boy' ? 'پسر' : g === 'girl' ? 'دختر' : '');

export default function PlayerProfile() {
  const { username } = useParams();
  const [pane, setPane] = useState<Pane>('score');
  const [medal, setMedal] = useState<string | null>(null);
  const [bookSlug, setBookSlug] = useState('');
  const q = useQuery({
    queryKey: ['pub', username],
    queryFn: () => api('/players/' + encodeURIComponent(username || '')),
    enabled: !!username,
  });
  const p = q.data;
  const selected = useMemo(
    () => (p?.badges || []).find((b: any) => b.slug === medal),
    [p, medal],
  );

  if (q.isLoading) return <p className="p-10 text-center text-ink-muted">در حال بارگذاری…</p>;
  if (!p) return <p className="p-10 text-center text-danger">{q.isError ? (q.error as Error).message : 'پیدا نشد.'}</p>;

  const rokad = p.membershipOrigin === 'ROKAD';
  const g = genderFa(p.gender);
  const tabs: { id: Pane; t: string }[] = [
    { id: 'score', t: 'امتیاز' },
    { id: 'medal', t: 'مدال' },
    { id: 'radar', t: 'نمودار' },
    { id: 'roles', t: 'نقش' },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <header className="flex flex-col items-center text-center">
        {p.avatar ? (
          <img src={p.avatar} alt="" className="avatar-frame" width={128} height={128} />
        ) : (
          <span className="avatar-frame" aria-hidden />
        )}
        <h1 className="mt-4 text-2xl font-black inline-flex items-center justify-center gap-1.5">
          {p.displayName}
          {rokad && <BrandLogo variant="membership-mark" className="rokad-mark-lg" alt="عضو رکاد" />}
        </h1>
        <p className="text-ink-muted text-sm mt-1">
          @{p.username}
          {g ? ` · ${g}` : ''}
          {rokad ? ' · رکاد' : ''}
          {p.createdAt ? ` · ${faDay(p.createdAt)}` : ''}
        </p>
        {p.bio && <p className="mt-3 text-sm leading-7 max-w-sm">{p.bio}</p>}
      </header>

      <nav className="profile-seg mt-6" role="tablist" aria-label="بخش‌های پروفایل">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={pane === t.id}
            className={`profile-seg-btn ${pane === t.id ? 'is-on' : ''}`}
            onClick={() => setPane(t.id)}
          >
            {t.t}
          </button>
        ))}
      </nav>

      {pane === 'score' && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Stat t="امتیاز" v={p.points} />
            <Stat t="برد" v={p.wins} />
            <Stat t="نرخ برد" v={`${p.winRate || 0}٪`} />
          </div>
          {!!(p.categories || []).length ? (
            <div className="grid gap-2">
              {p.categories.map((c: any) => (
                <div key={c.slug} className="card p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black">{c.name}</p>
                    <p className="text-xs text-ink-muted mt-1">
                      {c.wins} برد · {c.losses} باخت · {c.winRate}٪
                    </p>
                  </div>
                  <p className="font-black tabular-nums text-brand-dark">{c.points}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ink-muted text-sm">هنوز امتیازی روی لیدربورد ندارد.</p>
          )}
          <RecentGames rows={p.recent || []} />
        </div>
      )}

      {pane === 'medal' && (
        <div className="mt-4">
          {!(p.badges || []).length ? (
            <p className="text-ink-muted text-sm">هنوز مدالی روی این پروفایل نیست.</p>
          ) : (
            <>
              <div className="medal-rack">
                {p.badges.map((b: any) => (
                  <button
                    key={b.slug}
                    type="button"
                    className="medal-hit"
                    onClick={() => setMedal(b.slug === medal ? null : b.slug)}
                    aria-pressed={medal === b.slug}
                  >
                    <span className="medal-coin" style={{ borderColor: b.color, background: `${b.color}22` }}>
                      {ICONS[b.slug] || '★'}
                    </span>
                    <span className="medal-hit-name">{b.name}</span>
                  </button>
                ))}
              </div>
              {selected && (
                <div className="card p-4 mt-4 text-center">
                  <p className="font-black">{selected.name}</p>
                  <p className="text-sm text-ink-muted mt-1">{selected.hint}</p>
                  <p className="text-xs mt-2">سطح {selected.level}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {pane === 'radar' && (
        <div className="mt-4">
          <p className="text-sm text-ink-muted mb-3">نرخ برد بین بازی‌ها. نقش مافیا در تب «نقش» است.</p>
          <SpiderChart items={p.radar || []} caption="نرخ برد بازی (٪)" />
        </div>
      )}

      {pane === 'roles' && (
        <RolesPane p={p} bookSlug={bookSlug} setBookSlug={setBookSlug} />
      )}
    </div>
  );
}

function RecentGames({ rows }: { rows: any[] }) {
  const [more, setMore] = useState(false);
  const list = more ? rows : rows.slice(0, 5);
  return (
    <>
      <h2 className="font-extrabold pt-2">آخرین میزها</h2>
      <ul className="space-y-2">
        {list.map((m: any) => (
          <li key={m.id} className="card p-3 flex justify-between items-center gap-2">
            <span>
              <span className="font-bold">{m.category}</span>
              {m.roleName ? <span className="text-ink-muted text-sm"> · {m.roleName}</span> : null}
            </span>
            <span className={`text-sm font-bold ${m.result === 'win' ? 'text-success' : 'text-danger'}`}>
              {m.result === 'win' ? 'برد' : 'باخت'}
              {m.points ? ` · +${m.points}` : ''}
            </span>
          </li>
        ))}
        {!rows.length && <p className="text-ink-muted text-sm">هنوز نتیجه‌ای برای این بازیکن ثبت نشده است.</p>}
      </ul>
      {rows.length > 5 && (
        <button type="button" className="btn btn-ghost btn-sm w-full mt-2" onClick={() => setMore((v) => !v)}>
          {more ? 'کمتر' : `بیشتر ببین (${rows.length - 5} تای دیگر)`}
        </button>
      )}
    </>
  );
}

function RolesPane({ p, bookSlug, setBookSlug }: { p: any; bookSlug: string; setBookSlug: (s: string) => void }) {
  const books = p.roleBooks?.length
    ? p.roleBooks
    : [{ slug: 'classic', name: p.scenarioName || 'کلاسیک', roles: p.roles || [], winRate: p.roleWinRate || 0 }];
  const book = books.find((b: any) => b.slug === bookSlug) || books[0];
  const roles = book?.roles || [];
  const played = roles.some((r: any) => r.wins + r.losses > 0);
  return (
    <div className="mt-4 space-y-3">
      {books.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {books.map((b: any) => (
            <button
              key={b.slug}
              type="button"
              className={`btn btn-sm ${book?.slug === b.slug ? 'btn-night' : 'btn-ghost'}`}
              onClick={() => setBookSlug(b.slug)}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}
      <p className="text-sm font-bold">سناریو {book?.name} · برد {book?.winRate || 0}٪</p>
      {played ? (
        <>
          <SpiderChart items={roles.map((r: any) => ({ label: r.name, value: r.winRate }))} caption="نرخ برد نقش (٪)" />
          <ul className="space-y-2">
            {roles.map((r: any) => (
              <li key={r.name} className="card p-3 flex justify-between text-sm gap-2">
                <span className="font-bold">{r.name}</span>
                <span className="text-ink-muted tabular-nums shrink-0">
                  {r.wins} برد · {r.losses} باخت · {r.winRate}٪
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-ink-muted text-sm">برای این سناریو هنوز نقش ثبت نشده است.</p>
      )}
    </div>
  );
}

function Stat({ t, v }: { t: string; v: any }) {
  return (
    <div className="card p-3 text-center">
      <p className="text-[11px] text-ink-muted">{t}</p>
      <p className="font-extrabold text-lg tabular-nums">{v}</p>
    </div>
  );
}

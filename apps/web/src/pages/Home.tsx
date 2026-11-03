import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import PlayerIdentity from '../components/PlayerIdentity';
import { api } from '../lib/api';
import { audienceFa, faDate, toman } from '../lib/fmt';

export default function Home() {
  const sections = useQuery({ queryKey: ['home-sec'], queryFn: () => api('/homepage') });
  const cats = useQuery({ queryKey: ['cats'], queryFn: () => api('/categories') });
  const events = useQuery({ queryKey: ['events'], queryFn: () => api('/events') });
  const mvp = useQuery({ queryKey: ['mvp'], queryFn: () => api('/mvp') });
  const lb = useQuery({ queryKey: ['lb-home'], queryFn: () => api('/leaderboard') });
  const articles = useQuery({ queryKey: ['articles'], queryFn: () => api('/articles') });
  const scenarios = useQuery({ queryKey: ['scen'], queryFn: () => api('/scenarios') });
  const settings = useQuery({ queryKey: ['set'], queryFn: () => api('/settings') });
  const s = settings.data || {};
  const enabled = new Set((sections.data || []).filter((x: any) => x.enabled).map((x: any) => x.key));
  const show = (k: string) => !sections.data?.length || enabled.has(k);
  const list = events.data || [];
  const spotlight = list[0];
  const accents = ['sticker-navy', 'sticker-teal', 'sticker-magenta', 'sticker-orange'];
  const gameCats = [...(cats.data || [])].sort((a: any, b: any) => {
    const ae = a.kind === 'ELECTRONIC' ? 1 : 0;
    const be = b.kind === 'ELECTRONIC' ? 1 : 0;
    return ae - be || (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  return (
    <div>
      {show('hero') && (
        <section className="relative overflow-hidden bg-night text-white">
          <img
            src="/assets/generated/hero-night.jpg"
            alt=""
            className="cover hero-media w-full opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#16352f]/95 via-[#16352f]/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-8 pt-16">
            <p className="text-brand font-bold text-sm">{s.tagline || 'باشگاه بازی و رویداد'}</p>
            <h1 className="display-hero mt-2 max-w-xl">بازی فقط شروع ماجراست</h1>
            <p className="mt-3 text-[15px] md:text-lg text-white/85 max-w-md leading-7">
              رویدادهای پیش رو را ببین، جای خودت را رزرو کن و نتیجه را در پروفایل دنبال کن.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/events" className="btn btn-brand">میزهای پیش رو</Link>
              <Link to="/games" className="btn bg-white/15 text-white border border-white/20">بازی‌ها</Link>
            </div>
          </div>
        </section>
      )}

      {show('spotlight') && spotlight && (
        <section className="bg-mint py-10 md:py-12">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-sm text-brand-dark font-bold">نزدیک‌ترین میز</p>
            <Link to={`/events/${spotlight.id}`} className="spotlight-card mt-4">
              <img src={spotlight.cover || '/assets/generated/cat-tabletop.jpg'} alt="" />
              <div className="spotlight-copy">
                <p className="text-xs font-bold">{spotlight.category?.name} · {audienceFa(spotlight.audience)}</p>
                <h2 className="text-2xl font-black mt-1">{spotlight.title}</h2>
                <p className="mt-2 font-semibold">{faDate(spotlight.startsAt)}</p>
                <p className="mt-1 font-semibold">{spotlight.venue}</p>
                <p className="mt-4 font-black">{toman(spotlight.discountPrice || spotlight.price)} · {spotlight.capacity - spotlight.reservedCount} صندلی خالی</p>
              </div>
            </Link>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12 space-y-12">
        {show('events') && (
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="section-title">میزهای پیش رو</h2>
                <p className="text-ink-muted text-sm mt-2">برای بازی بعدی جا بگیر.</p>
              </div>
              <Link to="/events" className="text-brand-dark text-sm font-bold">همه رویدادها</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {list.slice(0, 4).map((e: any, i: number) => (
                <Link key={e.id} to={`/events/${e.id}`} className={`sticker ${accents[i % accents.length]} p-5`}>
                  <p className="text-xs font-bold" style={{ color: 'var(--sticker-accent)' }}>{e.category?.name} · {audienceFa(e.audience)}</p>
                  <p className="font-black text-lg mt-1">{e.title}</p>
                  <p className="text-sm text-ink-muted mt-1">{faDate(e.startsAt)}</p>
                </Link>
              ))}
              {!list.length && <p className="text-ink-muted">فعلاً رویدادی برای رزرو باز نیست. برنامه میزهای بعدی را همین‌جا اعلام می‌کنیم.</p>}
            </div>
          </section>
        )}
      </div>

      {show('categories') && (
        <section className="bg-lavender py-10 md:py-12">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="section-title mb-6">بازی‌ها</h2>
            <div className="games-pack">
              {gameCats.map((c: any, i: number) => (
                <Link key={c.id} to={c.kind === 'ELECTRONIC' ? '/games/electronic' : '/games'} className={`sticker ${accents[i % accents.length]} overflow-hidden`}>
                  {c.image && <img src={c.image} alt="" className="cover aspect-[16/10]" />}
                  <div className="p-4">
                    <p className="text-xs text-ink-muted">{c.kind === 'ELECTRONIC' ? 'الکترونیک' : 'رومیزی'}</p>
                    <p className="font-black mt-1">{c.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12 space-y-12">
        {show('guide') && !!(scenarios.data || []).length && (
          <section>
            <div className="flex justify-between mb-6">
              <h2 className="section-title">راهنمای سناریو</h2>
              <Link to="/guide" className="text-sm text-brand-dark font-bold">همه</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {(scenarios.data || []).slice(0, 2).map((sc: any) => (
                <Link key={sc.id} to={`/guide/scenarios/${sc.slug}`} className="sticker sticker-navy overflow-hidden">
                  {sc.cover && <img src={sc.cover} alt="" className="h-36 w-full object-cover" />}
                  <div className="p-5">
                    <p className="font-black">{sc.name}</p>
                    <p className="text-sm text-ink-muted mt-1 line-clamp-2">{sc.howto}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {show('leaderboard') && !!(lb.data || []).length && (
          <section className="bg-mint -mx-4 px-4 py-10 rounded-[2rem]">
            <div className="flex justify-between mb-6">
              <h2 className="section-title">جدول امتیاز</h2>
              <Link to="/leaderboard" className="text-sm text-brand-dark font-bold">جدول کامل</Link>
            </div>
            <ol className="space-y-2">
              {(lb.data || []).slice(0, 5).map((r: any) => (
                <li key={r.id} className="card lb-row">
                  <span className="w-7 text-sm font-black text-brand-dark tabular-nums">{r.rank}</span>
                  <PlayerIdentity user={r} to={`/players/${r.username}`} size="sm" />
                  <span className="mr-auto text-sm tabular-nums font-bold">{r.points}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {show('mvp') && !!(mvp.data || []).length && (
          <section>
            <h2 className="section-title mb-6">منتخب دوره</h2>
            <div className="flex gap-4 overflow-auto pb-2">
              {mvp.data.map((m: any) => (
                <div key={m.id} className="sticker sticker-magenta p-4 min-w-52">
                  <p className="text-xs font-bold text-magenta">{m.title}</p>
                  <div className="mt-2">
                    <PlayerIdentity user={m.user} to={`/players/${m.user.username}`} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {show('articles') && !!(articles.data || []).length && (
          <section>
            <div className="flex justify-between mb-6">
              <h2 className="section-title">آموزش</h2>
              <Link to="/learn" className="text-sm text-brand-dark font-bold">مطالب</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {articles.data.slice(0, 2).map((p: any) => (
                <Link key={p.id} to={`/learn/${p.slug}`} className="sticker sticker-orange overflow-hidden">
                  {p.cover && <img src={p.cover} alt="" className="h-36 w-full object-cover" />}
                  <div className="p-5">
                    <p className="font-black">{p.title}</p>
                    <p className="text-sm text-ink-muted mt-1">{p.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {show('about') && (
        <section className="bg-night text-white py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="section-title">درباره {s.name || 'رکاد'}</h2>
            <p className="mt-4 leading-8 text-white/85 max-w-2xl font-semibold">{s.about}</p>
            <p className="mt-4 text-sm">{s.address}</p>
            <p className="text-sm mt-1" dir="ltr">{s.phone}</p>
            <p className="text-sm mt-1">{s.hours}</p>
          </div>
        </section>
      )}
    </div>
  );
}

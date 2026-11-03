import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import RoleCard from '../components/RoleCard';
import { api } from '../lib/api';

function blocks(text: string) {
  return (text || '')
    .split(/\n\n+/)
    .map((c) => c.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
      const headed = lines[0] && !lines[0].startsWith('•');
      return {
        title: headed ? lines[0] : '',
        paras: (headed ? lines.slice(1) : lines).filter((l) => !l.startsWith('•')),
        steps: (headed ? lines.slice(1) : lines).filter((l) => l.startsWith('•')).map((l) => l.replace(/^•\s*/, '')),
      };
    });
}

export default function Guide({ roles = false }: { roles?: boolean }) {
  const { slug } = useParams();
  const list = useQuery({ queryKey: ['scen'], queryFn: () => api('/scenarios') });
  const one = useQuery({ queryKey: ['scen', slug], queryFn: () => api('/scenarios/' + slug), enabled: !!slug });
  const allRoles = useQuery({ queryKey: ['roles'], queryFn: () => api('/game-roles'), enabled: roles });
  if (slug && one.data) {
    const s = one.data;
    return (
      <article className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/guide" className="text-sm text-brand-dark">بازگشت به راهنما</Link>
        {s.cover && <img src={s.cover} alt="" className="rounded-2xl w-full h-56 object-cover mt-4" />}
        <p className="text-xs font-bold text-brand-dark mt-5">{s.category?.name}</p>
        <h1 className="text-3xl font-extrabold mt-1">{s.name}</h1>
        <p className="text-sm text-ink-muted mt-1">{s.minPlayers} تا {s.maxPlayers} نفر · {(s.gameRoles || []).length} نقش</p>
        {s.description && <p className="mt-3 leading-7 font-semibold">{s.description}</p>}

        <h2 className="font-extrabold mt-8">چطور این میز جلو می‌رود</h2>
        <div className="mt-3 space-y-3">
          {blocks(s.howto).map((b, i) => (
            <section key={i} className="card p-4">
              {b.title && <h3 className="font-black mb-2">{b.title}</h3>}
              {b.paras.map((p, j) => (
                <p key={j} className="text-sm leading-7 text-ink-muted">{p}</p>
              ))}
              {!!b.steps.length && (
                <ol className="mt-2 space-y-2">
                  {b.steps.map((step, j) => (
                    <li key={j} className="flex gap-3 text-sm leading-7">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-brand text-[#16352f] text-xs font-black flex items-center justify-center mt-0.5">
                        {j + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ))}
        </div>

        {s.winConditions && (
          <>
            <h2 className="font-extrabold mt-8">چه کسی می‌برد</h2>
            <div className="card p-4 mt-3 bg-mint">
              <p className="leading-8 whitespace-pre-line">{s.winConditions}</p>
            </div>
          </>
        )}
        {s.dayNight && (
          <>
            <h2 className="font-extrabold mt-8">روز و شب</h2>
            <div className="card p-4 mt-3">
              <p className="leading-8 whitespace-pre-line">{s.dayNight}</p>
            </div>
          </>
        )}

        <h2 className="font-extrabold mt-8">نقش‌ها</h2>
        <p className="text-sm text-ink-muted mt-1 mb-3">کارت را بزن تا برگردد و توضیح نقش را بخوانی.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(s.gameRoles || []).map((r: any) => (
            <RoleCard
              key={r.id}
              name={r.name}
              side={r.side}
              symbol={r.symbol}
              color={r.color}
              description={r.description}
              nightWake={r.nightWake}
            />
          ))}
        </div>
      </article>
    );
  }
  if (roles) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link to="/guide" className="text-sm text-brand-dark">بازگشت به راهنما</Link>
        <h1 className="text-3xl font-extrabold mt-2">نقش‌ها</h1>
        <p className="text-ink-muted mt-2 text-sm">روی کارت بزن تا پشتش توضیح نقش بیاید.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          {(allRoles.data || []).map((r: any) => (
            <RoleCard
              key={r.id}
              name={r.name}
              side={r.side}
              symbol={r.symbol}
              color={r.color}
              description={r.description}
              nightWake={r.nightWake}
              scenario={r.scenario?.name}
            />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">راهنمای بازی</h1>
      <p className="text-ink-muted mt-2">قبل از میز سناریو را بخوان. نقش زندهٔ نشست میزبان اینجا نیست.</p>
      <p className="mt-3"><Link to="/guide/roles" className="text-brand-dark text-sm font-bold">همه نقش‌ها، کارت‌به‌کارت</Link></p>
      <div className="grid md:grid-cols-2 gap-3 mt-8">
        {(list.data || []).map((s: any) => (
          <Link key={s.id} to={`/guide/scenarios/${s.slug}`} className="card overflow-hidden">
            {s.cover && <img src={s.cover} alt="" className="h-40 w-full object-cover" />}
            <div className="p-5">
              <p className="text-xs text-brand-dark">{s.category?.name} · {s.minPlayers}–{s.maxPlayers} نفر</p>
              <h2 className="font-extrabold text-xl mt-1">{s.name}</h2>
              <p className="text-sm text-ink-muted mt-2 line-clamp-2">{s.description || s.howto}</p>
              <p className="text-xs font-bold text-brand-dark mt-3">{(s.gameRoles || []).length} نقش · بزن و بخوان</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

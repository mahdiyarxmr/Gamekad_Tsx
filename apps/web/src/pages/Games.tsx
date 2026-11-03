import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Games({ electronic = false }: { electronic?: boolean }) {
  const cats = useQuery({ queryKey: ['cats'], queryFn: () => api('/categories') });
  const eGames = useQuery({ queryKey: ['eg'], queryFn: () => api('/electronic-games'), enabled: electronic });
  if (electronic) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <p className="text-sm"><Link to="/games" className="text-brand-dark">بازی‌ها</Link></p>
        <h1 className="text-3xl font-extrabold mt-2">بازی‌های الکترونیک</h1>
        <p className="text-ink-muted mt-2">عنوان‌ها از کاتالوگ سالن است؛ تصویر کاور بازی رسمی نیست.</p>
        <div className="grid md:grid-cols-2 gap-3 mt-8">
          {(eGames.data || []).map((g: any) => (
            <article key={g.id} className="card overflow-hidden">
              {g.cover && <img src={g.cover} alt="" className="h-40 w-full object-cover" />}
              <div className="p-5">
                <p className="text-xs text-ink-muted">{g.platform}</p>
                <h2 className="font-extrabold text-xl">{g.title}</h2>
                <p className="text-sm mt-2 text-ink-muted">{g.description}</p>
                {g.playersNote && <p className="text-sm mt-2">{g.playersNote}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }
  const packed = [...(cats.data || [])].sort((a: any, b: any) => {
    const ae = a.kind === 'ELECTRONIC' ? 1 : 0;
    const be = b.kind === 'ELECTRONIC' ? 1 : 0;
    return ae - be || (a.sortOrder || 0) - (b.sortOrder || 0);
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">بازی‌ها</h1>
      <p className="text-ink-muted mt-2 text-sm">رومیزی و کنسول سالن.</p>
      <div className="games-pack mt-6">
        {packed.map((c: any) => (
          <Link key={c.id} to={c.kind === 'ELECTRONIC' ? '/games/electronic' : `/events?cat=${c.slug}`} className="sticker sticker-teal overflow-hidden">
            {c.image && <img src={c.image} alt="" className="cover aspect-[16/10]" />}
            <div className="p-4">
              <p className="text-xs text-ink-muted">{c.kind === 'ELECTRONIC' ? 'الکترونیک' : 'رومیزی'}</p>
              <p className="font-extrabold mt-1">{c.name}</p>
              <p className="text-sm text-ink-muted mt-1 line-clamp-2">{c.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

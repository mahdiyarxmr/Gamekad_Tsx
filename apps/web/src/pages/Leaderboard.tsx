import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PlayerIdentity from '../components/PlayerIdentity';
import { api } from '../lib/api';

export default function Leaderboard() {
  const { categorySlug } = useParams();
  const cats = useQuery({ queryKey: ['cats'], queryFn: () => api('/categories') });
  const [cat, setCat] = useState(categorySlug || '');
  const [gender, setGender] = useState('');
  const rows = useQuery({
    queryKey: ['lb', cat, gender],
    queryFn: () => api('/leaderboard?' + new URLSearchParams({ ...(cat ? { cat } : {}), ...(gender ? { gender } : {}) })),
  });
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold">لیدربورد</h1>
      <p className="text-ink-muted mt-2 text-sm">مرتب‌سازی: امتیاز، بعد برد.</p>
      <div className="flex flex-wrap gap-2 mt-4 mb-3">
        <button onClick={() => setCat('')} className={`btn btn-sm ${!cat ? 'btn-night' : 'btn-ghost'}`}>همه دسته‌ها</button>
        {(cats.data || []).map((c: any) => (
          <button key={c.slug} onClick={() => setCat(c.slug)} className={`btn btn-sm ${cat === c.slug ? 'btn-night' : 'btn-ghost'}`}>{c.name}</button>
        ))}
      </div>
      <div className="flex gap-2 mb-5">
        {['', 'boy', 'girl'].map((g) => (
          <button key={g} onClick={() => setGender(g)} className={`btn btn-sm ${gender === g ? 'btn-brand' : 'btn-ghost'}`}>
            {g === '' ? 'همه' : g === 'boy' ? 'پسر' : 'دختر'}
          </button>
        ))}
      </div>
      <ol className="space-y-2">
        {(rows.data || []).map((r: any) => (
          <li key={r.id} className="card lb-row">
            <span className="w-7 text-sm font-extrabold text-brand-dark tabular-nums shrink-0">{r.rank}</span>
            <PlayerIdentity user={r} to={`/players/${r.username}`} size="sm" />
            <span className="mr-auto text-xs sm:text-sm tabular-nums font-bold shrink-0">
              {r.points} · {r.winRate}٪
            </span>
          </li>
        ))}
        {!rows.data?.length && !rows.isLoading && <p className="text-ink-muted">هنوز امتیازی ثبت نشده است.</p>}
      </ol>
    </div>
  );
}

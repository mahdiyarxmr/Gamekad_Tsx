import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import PlayerIdentity from '../components/PlayerIdentity';
import { api } from '../lib/api';

export default function Players() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [origin, setOrigin] = useState('');
  const list = useQuery({
    queryKey: ['players', q, page, origin],
    queryFn: () =>
      api(
        '/players?' +
          new URLSearchParams({ q, page: String(page), ...(origin ? { origin } : {}) }),
      ),
  });
  const data = list.data || { items: [], total: 0, page: 1 };
  const items = data.items || [];
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">بازیکنان</h1>
      <p className="text-ink-muted mt-2">جستجو با نام نمایشی یا نام کاربری.</p>
      <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="جستجو" className="card w-full px-4 py-3 mt-4" />
      <div className="flex gap-2 mt-3">
        {['', 'ROKAD', 'EXTERNAL'].map((o) => (
          <button key={o} onClick={() => setOrigin(o)} className={`btn btn-sm ${origin === o ? 'btn-night' : 'btn-ghost'}`}>
            {o === '' ? 'همه' : o === 'ROKAD' ? 'عضو رکاد' : 'خارج از رکاد'}
          </button>
        ))}
      </div>
      <ul className="mt-6 space-y-2">
        {items.map((p: any) => (
          <li key={p.id} className="card lb-row">
            <PlayerIdentity user={p} to={`/players/${p.username}`} size="sm" meta={'@' + p.username} />
          </li>
        ))}
        {!items.length && !list.isLoading && <p className="text-ink-muted">بازیکنی با این مشخصات پیدا نشد. نام یا شناسه را بررسی کن.</p>}
      </ul>
      <div className="flex gap-2 mt-6">
        <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>قبل</button>
        <button className="btn btn-ghost" disabled={data.items.length < 20} onClick={() => setPage((p) => p + 1)}>بعد</button>
      </div>
    </div>
  );
}

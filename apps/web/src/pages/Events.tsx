import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { audienceFa, faDate, statusFa, toman } from '../lib/fmt';

export default function Events() {
  const [sp, setSp] = useSearchParams();
  const cat = sp.get('cat') || '';
  const audience = sp.get('audience') || '';
  const q = useQuery({
    queryKey: ['events', cat, audience],
    queryFn: () => api('/events?' + new URLSearchParams({ ...(cat ? { cat } : {}), ...(audience ? { audience } : {}) })),
  });
  function set(k: string, v: string) {
    const n = new URLSearchParams(sp);
    if (v) n.set(k, v);
    else n.delete(k);
    setSp(n);
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">رویدادها</h1>
      <p className="text-ink-muted mt-2">تاریخ، مخاطب و ظرفیت را قبل از رزرو ببین.</p>
      <div className="flex flex-wrap gap-2 mt-6 mb-8">
        {['', 'boys', 'girls', 'mixed'].map((a) => (
          <button key={a} onClick={() => set('audience', a)} className={`btn btn-sm ${audience === a ? 'btn-night' : 'btn-ghost'}`}>
            {a === '' ? 'همه مخاطب‌ها' : audienceFa(a)}
          </button>
        ))}
      </div>
      {q.isError && <p className="text-danger">{(q.error as Error).message}</p>}
      <div className="grid md:grid-cols-2 gap-6">
        {(q.data || []).map((e: any, i: number) => (
          <Link key={e.id} to={`/events/${e.id}`} className={`sticker ${i % 2 ? 'sticker-teal' : 'sticker-navy'} overflow-hidden`}>
            {e.cover && <img src={e.cover} alt="" className="h-40 w-full object-cover" />}
            <div className="p-5">
              <p className="text-xs text-brand-dark">{e.category?.name} · {audienceFa(e.audience)} · {statusFa(e.status)}</p>
              <h2 className="font-extrabold text-xl mt-1">{e.title}</h2>
              <p className="text-sm mt-2 text-ink-muted">{faDate(e.startsAt)}</p>
              <p className="text-sm mt-1">{toman(e.discountPrice || e.price)} · {Math.max(0, e.capacity - e.reservedCount)} صندلی</p>
            </div>
          </Link>
        ))}
        {!q.data?.length && !q.isLoading && <p className="text-ink-muted">فعلاً رویدادی برای رزرو باز نیست.</p>}
      </div>
    </div>
  );
}

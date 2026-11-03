import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PlayerIdentity from '../components/PlayerIdentity';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function GodGame() {
  const { canGod, user } = useAuth();
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['god'], queryFn: () => api('/god-game'), enabled: canGod });
  const scen = useQuery({ queryKey: ['scen'], queryFn: () => api('/scenarios'), enabled: canGod });
  const [open, setOpen] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [confirm, setConfirm] = useState<null | { title: string; run: () => void }>(null);
  const create = useMutation({
    mutationFn: async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const n = Math.min(24, Math.max(4, Number(fd.get('n')) || 8));
      const seats = Array.from({ length: n }, (_, i) => ({ name: `صندلی ${i + 1}` }));
      return api('/god-game', { method: 'POST', body: JSON.stringify({ title: fd.get('title'), scenarioId: Number(fd.get('scenarioId')) || undefined, seats }) });
    },
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ['god'] });
      setOpen(s);
    },
  });
  const assign = useMutation({
    mutationFn: async () => {
      const sc = (scen.data || []).find((x: any) => x.id === open.scenarioId);
      const roles = (sc?.gameRoles || []).map((r: any) => ({ name: r.name, side: r.side }));
      return api(`/god-game/${open.id}/assign`, { method: 'POST', body: JSON.stringify({ roles }) });
    },
    onSuccess: setOpen,
  });
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timer]);
  if (!canGod) {
    return (
      <div className="p-16 text-center">
        <p>میزبان فقط با مجوز مدیر.</p>
        {!user && <Link to="/login" className="btn btn-night mt-4 inline-flex">ورود به حساب</Link>}
      </div>
    );
  }
  if (open) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <button className="text-sm min-h-11" onClick={() => setOpen(null)}>بازگشت به فهرست</button>
        <h1 className="text-2xl font-extrabold mt-2">{open.title}</h1>
        <div className="card p-4 mt-4 text-center bg-night text-canvas">
          <p className="text-xs opacity-70">زمان‌سنج نمایشی — منبع حقیقت فاز در سرور است</p>
          <p className="text-4xl font-extrabold tabular-nums mt-1">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</p>
          <div className="flex gap-2 justify-center mt-3">
            <button className="btn btn-brand" onClick={() => setTimer(180)}>۳ دقیقه</button>
            <button className="btn bg-white/10 text-canvas" onClick={() => setTimer(0)}>توقف</button>
          </div>
        </div>
        <button onClick={() => setConfirm({ title: 'نقش‌ها تصادفی پخش شود؟', run: () => assign.mutate() })} className="btn btn-night w-full mt-4">
          پخش تصادفی نقش
        </button>
        <ul className="mt-6 space-y-2">
          {(open.seats || []).map((s: any) => (
            <li key={s.id} className={`card p-3 flex justify-between items-center ${s.dead ? 'opacity-50' : ''}`}>
              <span className="font-bold">{s.no}. {s.name}</span>
              <span className="text-sm text-brand-dark">{s.dead ? 'مرده' : s.roleName || '—'}</span>
            </li>
          ))}
        </ul>
        {confirm && (
          <div className="fixed inset-0 bg-night/50 flex items-end sm:items-center justify-center p-4 z-50">
            <div className="card p-5 w-full max-w-sm">
              <p className="font-bold">{confirm.title}</p>
              <div className="flex gap-2 mt-4">
                <button className="btn btn-danger flex-1" onClick={() => { confirm.run(); setConfirm(null); }}>تأیید</button>
                <button className="btn btn-ghost flex-1" onClick={() => setConfirm(null)}>انصراف</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">میزبان جلسه</h1>
      <p className="text-ink-muted mt-2">صندلی، نقش و نتیجه روی سرور می‌ماند.</p>
      <form onSubmit={(e) => create.mutate(e)} className="card p-5 mt-6 space-y-3">
        <label className="text-sm">عنوان<input name="title" defaultValue="نشست امشب" className="w-full card px-3 py-2 mt-1" /></label>
        <label className="text-sm">سناریو
          <select name="scenarioId" className="w-full card px-3 py-2 mt-1">
            {(scen.data || []).map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">تعداد صندلی (۴ تا ۲۴)
          <input name="n" type="number" min={4} max={24} defaultValue={8} className="w-full card px-3 py-2 mt-1" />
        </label>
        <button className="btn btn-brand w-full">ساخت نشست</button>
      </form>
      <ul className="mt-8 space-y-2">
        {(list.data || []).map((s: any) => (
          <li key={s.id}>
            <button onClick={() => setOpen(s)} className="card p-4 w-full text-right min-h-11">{s.title}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

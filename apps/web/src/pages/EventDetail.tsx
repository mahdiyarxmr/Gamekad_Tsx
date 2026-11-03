import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { audienceFa, faDate, toman } from '../lib/fmt';
import { useState } from 'react';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [note, setNote] = useState('');
  const q = useQuery({ queryKey: ['event', id], queryFn: () => api('/events/' + id) });
  const mut = useMutation({
    mutationFn: async () => {
      if (!user) {
        nav('/login');
        throw new Error('برای رزرو وارد حساب شو.');
      }
      const r = await api('/reservations', { method: 'POST', body: JSON.stringify({ eventId: Number(id), seats: 1 }) });
      const wallet = user.wallet?.balance ?? 0;
      if (r.amount > 0 && wallet >= r.amount) {
        await api(`/reservations/${r.reservation.id}/pay`, { method: 'POST', body: JSON.stringify({ method: 'wallet' }) });
        return { paid: 'wallet' };
      }
      if (r.amount > 0) {
        const g = await api(`/reservations/${r.reservation.id}/pay`, { method: 'POST', body: JSON.stringify({ method: 'gateway' }) });
        await api('/payments/sandbox/verify', { method: 'POST', body: JSON.stringify({ trackingCode: g.trackingCode }) });
        return { paid: 'gateway' };
      }
      return { paid: 'venue' };
    },
    onSuccess: (d) => {
      setNote(
        d.paid === 'wallet'
          ? 'پرداخت از کیف پول در سرور تأیید شد.'
          : d.paid === 'gateway'
            ? 'پرداخت سندباکس در سرور تأیید شد.'
            : 'رزرو با پرداخت در محل ثبت شد.',
      );
      qc.invalidateQueries({ queryKey: ['event', id] });
    },
    onError: (e: any) => setNote(e.message),
  });
  const e = q.data;
  if (q.isLoading) return <p className="p-10 text-center text-ink-muted">در حال بارگذاری…</p>;
  if (!e) return <p className="p-10 text-center text-danger">رویداد پیدا نشد.</p>;
  const left = e.left ?? e.capacity - e.reservedCount;
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {e.cover && <img src={e.cover} alt="" className="rounded-2xl w-full h-56 object-cover mb-6" />}
      <p className="text-brand-dark text-sm">{e.category?.name} · {audienceFa(e.audience)}</p>
      <h1 className="text-3xl font-extrabold mt-1">{e.title}</h1>
      <p className="mt-3 text-ink-muted">{faDate(e.startsAt)}</p>
      <p className="mt-1">{e.venue}</p>
      {e.description && <p className="mt-4 leading-8">{e.description}</p>}
      <div className="card p-5 mt-6">
        <p>ظرفیت باقی‌مانده: {left}</p>
        <p className="font-extrabold text-2xl mt-2">{toman(e.discountPrice || e.price)}</p>
        <p className="text-sm text-ink-muted mt-1">
          پرداخت: {e.payType === 'venue' ? 'در محل' : e.payType === 'deposit' ? 'پیش‌پرداخت آنلاین' : 'کامل آنلاین'}
        </p>
        <p className="text-xs text-ink-muted mt-2">اگر موجودی کیف کافی باشد فقط از کیف کم می‌شود؛ وگرنه فقط درگاه.</p>
        {note && <p className="mt-3 text-sm">{note}</p>}
        <button disabled={mut.isPending || e.status !== 'open' || left <= 0} onClick={() => mut.mutate()} className="btn btn-brand w-full mt-4">
          {mut.isPending ? 'در حال ثبت…' : 'رزرو این میز'}
        </button>
      </div>
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toman } from '../lib/fmt';
import { useState } from 'react';

const QUICK = [50000, 100000, 200000, 500000];

function digits(s: string) {
  const fa: Record<string, string> = { '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9' };
  return Number(s.replace(/[۰-۹]/g, (d) => fa[d] || d).replace(/[^\d]/g, '')) || 0;
}

export default function WalletPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [msg, setMsg] = useState('');
  const [amount, setAmount] = useState('100000');
  const q = useQuery({ queryKey: ['wallet'], queryFn: () => api('/wallet'), enabled: !!user });
  const n = digits(amount);
  const charge = useMutation({
    mutationFn: async () => {
      if (n < 10000) throw new Error('حداقل شارژ ۱۰٬۰۰۰ تومان است.');
      const c = await api('/wallet/charge', { method: 'POST', body: JSON.stringify({ amount: n }) });
      await api('/payments/sandbox/verify', { method: 'POST', body: JSON.stringify({ trackingCode: c.trackingCode }) });
      return c.amount as number;
    },
    onSuccess: (paid) => {
      setMsg(`شارژ ${toman(paid)} در سرور تأیید شد.`);
      qc.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (e: any) => setMsg(e.message),
  });
  if (!user) {
    return (
      <div className="p-16 text-center">
        <p className="mb-4">برای کیف پول وارد شو.</p>
        <Link to="/login" className="btn btn-night">ورود به حساب</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <p className="text-sm"><Link to="/account" className="text-brand-dark">حساب من</Link></p>
      <h1 className="text-3xl font-extrabold mt-2">کیف پول</h1>
      <div className="card p-8 text-center mt-6">
        <p className="text-sm text-ink-muted">موجودی</p>
        <p className="text-4xl font-extrabold mt-2 tabular-nums">{toman(q.data?.balance || 0)}</p>
      </div>
      <div className="card p-5 mt-4">
        <p className="field-lab">مبلغ شارژ (تومان)</p>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="numeric"
          placeholder="مثلاً ۱۵۰۰۰۰"
          className="w-full card px-4 py-3"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK.map((v) => (
            <button
              key={v}
              type="button"
              className={`btn btn-sm ${n === v ? 'btn-night' : 'btn-ghost'}`}
              onClick={() => setAmount(String(v))}
            >
              {v.toLocaleString('fa-IR')}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-muted mt-3">
          مبلغ را خودت بگذار. اگر میز رزرو کنی و موجودی کافی باشد همان مبلغ از کیف کم می‌شود؛ وگرنه همان مبلغ از درگاه می‌رود — دو روش با هم نیست.
        </p>
        {msg && <p className="mt-3 text-sm">{msg}</p>}
        <button
          disabled={charge.isPending || n < 10000}
          onClick={() => charge.mutate()}
          className="btn btn-brand w-full mt-4"
        >
          {charge.isPending ? 'در حال شارژ…' : `شارژ ${n ? toman(n) : ''}`}
        </button>
      </div>
      <ul className="mt-8 space-y-2">
        {(q.data?.transactions || []).map((t: any) => (
          <li key={t.id} className="card p-3 flex justify-between text-sm gap-2">
            <span>{t.note || t.kind}</span>
            <span className={`tabular-nums shrink-0 ${t.amount < 0 ? 'text-danger' : 'text-success'}`}>
              {t.amount.toLocaleString('fa-IR')}
            </span>
          </li>
        ))}
        {!q.data?.transactions?.length && <p className="text-ink-muted text-sm">تراکنشی ثبت نشده است.</p>}
      </ul>
    </div>
  );
}

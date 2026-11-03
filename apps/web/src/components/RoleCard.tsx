import { useState } from 'react';

const sideFa = (s: string) => (s === 'mafia' ? 'مافیا' : s === 'independent' ? 'مستقل' : 'شهر');

export default function RoleCard({
  name,
  side,
  symbol,
  color,
  description,
  nightWake,
  scenario,
}: {
  name: string;
  side?: string;
  symbol?: string;
  color?: string;
  description?: string;
  nightWake?: boolean;
  scenario?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      className={`flip-card ${open ? 'is-flipped' : ''}`}
      onClick={() => setOpen((v) => !v)}
      aria-pressed={open}
      aria-label={open ? `برگشت از توضیح ${name}` : `توضیح نقش ${name}`}
    >
      <span className="flip-inner">
        <span className="flip-face flip-front card" style={{ borderColor: color || undefined }}>
          {scenario && <span className="text-[11px] text-ink-muted">{scenario}</span>}
          <span className="text-4xl leading-none mt-1" aria-hidden>
            {symbol || '★'}
          </span>
          <span className="font-black text-lg mt-2">{name}</span>
          <span className="text-xs text-ink-muted mt-1">
            {sideFa(side || 'citizen')}
            {nightWake ? ' · بیدار شب' : ''}
          </span>
          <span className="text-[11px] text-brand-dark font-bold mt-3">بزن، پشت کارت را ببین</span>
        </span>
        <span className="flip-face flip-back card">
          <span className="font-black">{name}</span>
          <span className="text-xs text-ink-muted mt-1 mb-2">
            {sideFa(side || 'citizen')}
            {nightWake ? ' · بیدار شب' : ''}
          </span>
          <span className="text-sm leading-7 text-right">{description || 'توضیحی ثبت نشده.'}</span>
          <span className="text-[11px] text-brand-dark font-bold mt-auto pt-3">بزن برای برگشت</span>
        </span>
      </span>
    </button>
  );
}

type Item = { label: string; value: number };

export default function SpiderChart({ items, caption }: { items: Item[]; caption?: string }) {
  const ready = (items || []).filter((x) => x.label);
  if (!ready.length) {
    return <p className="text-ink-muted text-sm">هنوز داده‌ای برای نمودار نیست.</p>;
  }
  if (ready.length < 3) {
    return (
      <ul className="space-y-2">
        {ready.map((it) => (
          <li key={it.label}>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span>{it.label}</span>
              <span className="tabular-nums">{it.value}٪</span>
            </div>
            <div className="h-2 rounded-full bg-surface-muted overflow-hidden">
              <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(0, Math.min(100, it.value))}%` }} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 78;
  const n = ready.length;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const xy = (i: number, t: number) => {
    const a = angle(i);
    return [cx + r * t * Math.cos(a), cy + r * t * Math.sin(a)] as const;
  };
  const ring = (t: number) => ready.map((_, i) => xy(i, t).join(',')).join(' ');
  const data = ready.map((it, i) => xy(i, Math.max(0, Math.min(100, it.value)) / 100).join(',')).join(' ');
  const labR = n > 8 ? 46 : 44;

  return (
    <div className="card p-3 sm:p-4">
      {caption && <p className="text-sm text-ink-muted mb-2 text-center">{caption}</p>}
      <div className="spider">
        <svg viewBox={`0 0 ${size} ${size}`} className="spider-svg" role="img" aria-label={caption || 'نمودار عنکبوتی'}>
          {[0.25, 0.5, 0.75, 1].map((t) => (
            <polygon key={t} points={ring(t)} fill="none" stroke="currentColor" strokeOpacity={0.16} />
          ))}
          {ready.map((_, i) => {
            const [x, y] = xy(i, 1);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" strokeOpacity={0.18} />;
          })}
          <polygon points={data} fill="#58bdaf" fillOpacity={0.28} stroke="#2f7d72" strokeWidth={2} />
          {ready.map((it, i) => {
            const [x, y] = xy(i, Math.max(0, Math.min(100, it.value)) / 100);
            return <circle key={it.label} cx={x} cy={y} r={3.2} fill="#16352f" />;
          })}
        </svg>
        {ready.map((it, i) => {
          const a = angle(i);
          const left = 50 + labR * Math.cos(a);
          const top = 50 + labR * Math.sin(a);
          return (
            <span key={it.label} className="spider-lab" style={{ left: `${left}%`, top: `${top}%` }}>
              {it.label}
              <small>{it.value}٪</small>
            </span>
          );
        })}
      </div>
    </div>
  );
}

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';

export default function ThemeToggle() {
  const { pref, cycle } = useTheme();
  const label = pref === 'light' ? 'روز' : pref === 'dark' ? 'شب' : 'سیستم';
  const Icon = pref === 'light' ? Sun : pref === 'dark' ? Moon : Monitor;
  return (
    <button
      type="button"
      onClick={cycle}
      className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full bg-surface-muted text-ink"
      aria-label={`تم: ${label}. برای تغییر بزن.`}
      title={label}
    >
      <Icon size={18} strokeWidth={2.4} />
    </button>
  );
}

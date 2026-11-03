import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemePref = 'light' | 'dark' | 'system';

function resolved(pref: ThemePref) {
  if (pref === 'light') return 'light';
  if (pref === 'dark') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(pref: ThemePref) {
  const mode = resolved(pref);
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', mode === 'dark' ? '#111321' : '#21295a');
}

const C = createContext<{ pref: ThemePref; mode: 'light' | 'dark'; setPref: (p: ThemePref) => void; cycle: () => void }>(null as any);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(() => {
    try {
      return (localStorage.getItem('rokad-theme') as ThemePref) || 'system';
    } catch {
      return 'system';
    }
  });
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    try {
      return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    apply(pref);
    setMode(resolved(pref));
    try {
      localStorage.setItem('rokad-theme', pref);
    } catch {
      /* ignore */
    }
    if (pref !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => {
      apply('system');
      setMode(resolved('system'));
    };
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [pref]);

  function cycle() {
    setPrefState((p) => (p === 'light' ? 'dark' : p === 'dark' ? 'system' : 'light'));
  }

  return <C.Provider value={{ pref, mode, setPref: setPrefState, cycle }}>{children}</C.Provider>;
}

export const useTheme = () => useContext(C);

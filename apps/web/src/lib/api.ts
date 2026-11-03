const ACCESS = 'gk-access';
const REFRESH = 'gk-refresh';
const REMEMBER = 'gk-remember';

function persistStore() {
  try {
    if (localStorage.getItem(REMEMBER) === '0') return sessionStorage;
  } catch {
    /* ignore */
  }
  return localStorage;
}

export function setTokens(a: string, r?: string, remember?: boolean) {
  if (remember !== undefined) {
    localStorage.setItem(REMEMBER, remember ? '1' : '0');
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    sessionStorage.removeItem(ACCESS);
    sessionStorage.removeItem(REFRESH);
  }
  const s = persistStore();
  if (a) s.setItem(ACCESS, a);
  else {
    localStorage.removeItem(ACCESS);
    sessionStorage.removeItem(ACCESS);
  }
  if (r !== undefined) {
    if (r) s.setItem(REFRESH, r);
    else {
      localStorage.removeItem(REFRESH);
      sessionStorage.removeItem(REFRESH);
    }
  }
}
export function getAccess() {
  return sessionStorage.getItem(ACCESS) || localStorage.getItem(ACCESS) || '';
}
export function getRefresh() {
  return sessionStorage.getItem(REFRESH) || localStorage.getItem(REFRESH) || '';
}

function msgOf(data: any, fb: string) {
  const m = data?.message ?? data?.error;
  if (Array.isArray(m)) return m.join(' ');
  if (typeof m === 'string' && m.trim()) return m;
  return fb;
}

export async function api(path: string, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers);
  if (opts.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const tok = getAccess();
  if (tok) headers.set('Authorization', `Bearer ${tok}`);
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, { ...opts, headers });
  } catch {
    throw new Error('سرور در دسترس نیست.');
  }
  if (res.status === 401 && getRefresh() && path !== '/auth/refresh') {
    const ok = await tryRefresh();
    if (ok) return api(path, opts);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(msgOf(data, 'خطا'));
  return data;
}

async function tryRefresh() {
  const r = getRefresh();
  if (!r) return false;
  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: r }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setTokens('', '');
      return false;
    }
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export type User = {
  id: number;
  username: string;
  displayName: string;
  email?: string;
  gender: string;
  role: string;
  godGameAllowed?: boolean;
  membershipOrigin?: 'ROKAD' | 'EXTERNAL';
  avatar: string;
  bio?: string;
  status?: string;
  wallet?: { balance: number };
};

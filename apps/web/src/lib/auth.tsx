import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, getAccess, getRefresh, setTokens, type User } from './api';

type Ctx = {
  user: User | null;
  loading: boolean;
  login: (u: User, access: string, refresh: string, remember?: boolean) => void;
  logout: () => void;
  refresh: () => Promise<void>;
  isAdmin: boolean;
  canGod: boolean;
};

const C = createContext<Ctx>(null as any);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  async function refresh() {
    if (!getAccess()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setUser(await api('/auth/me'));
    } catch {
      setTokens('', '');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  return (
    <C.Provider
      value={{
        user,
        loading,
        login: (u, a, r, remember = true) => {
          setTokens(a, r, remember);
          setUser(u);
        },
        logout: () => {
          const rt = getRefresh();
          api('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: rt }) }).catch(() => {});
          setTokens('', '');
          setUser(null);
        },
        refresh,
        isAdmin: user?.role === 'admin',
        canGod: user?.role === 'admin' || !!user?.godGameAllowed,
      }}
    >
      {children}
    </C.Provider>
  );
}
export const useAuth = () => useContext(C);

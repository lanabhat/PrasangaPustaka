import { useState, useEffect, createContext, useContext } from 'react';
import type { User } from '../services/api';
import { getStoredUser, fetchMe, logout as doLogout } from '../services/auth';

interface AuthState {
  user: (User & { token: string }) | null;
  isAuthenticated: boolean;
  role: string | null;
  loading: boolean;
  setUser: (u: (User & { token: string }) | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  isAuthenticated: false,
  role: null,
  loading: true,
  setUser: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const useAuthState = (): AuthState => {
  const [user, setUser] = useState<(User & { token: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      fetchMe()
        .then((fresh) => setUser((prev) => prev ? { ...prev, ...fresh } : null))
        .catch(() => {
          doLogout();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    doLogout();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    role: user?.role ?? null,
    loading,
    setUser,
    logout,
  };
};

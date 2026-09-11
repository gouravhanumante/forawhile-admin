import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiClient } from '../api/client';
import { authApi, type AuthTokensResponse } from '../api/auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (result: AuthTokensResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(apiClient.isAuthenticated());

  const login = useCallback((result: AuthTokensResponse) => {
    apiClient.setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    const tokens = apiClient.getTokens();
    apiClient.setTokens(null);
    setIsAuthenticated(false);
    // Best-effort: revoke server-side too, but the UI has already signed the admin out either way.
    if (tokens) void authApi.logout(tokens.refreshToken).catch(() => undefined);
  }, []);

  const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated, login, logout]);

  // An expired session is discovered by whichever request happened to fail, so the sign-out has
  // to come from the API client rather than from any one screen.
  useEffect(() => {
    apiClient.onSessionExpired(() => setIsAuthenticated(false));
    return () => apiClient.onSessionExpired(null);
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

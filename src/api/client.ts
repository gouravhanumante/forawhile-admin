import type { ApiEnvelope } from './types';

export type AdminEnvironment = 'production' | 'staging' | 'local';

const ENVIRONMENT_KEY = 'rag_admin_environment';
const PRODUCTION_API_URL = 'https://forawhile-api-prod-4frgilbx4a-el.a.run.app/api/v1';
const STAGING_API_URL = 'https://rent-a-girlfriend-api.onrender.com/api/v1';
const LOCAL_API_URL = 'http://localhost:4000/api/v1';

function currentEnvironment(): AdminEnvironment {
  const stored = localStorage.getItem(ENVIRONMENT_KEY);
  return stored === 'staging' || stored === 'local' ? stored : 'production';
}

function baseUrl(): string {
  switch (currentEnvironment()) {
    case 'local':
      return (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? LOCAL_API_URL;
    case 'staging':
      return (import.meta.env.VITE_STAGING_API_BASE_URL as string | undefined) ?? STAGING_API_URL;
    default:
      return (import.meta.env.VITE_PRODUCTION_API_BASE_URL as string | undefined) ?? PRODUCTION_API_URL;
  }
}

function tokenKey(): string {
  return `rag_admin_tokens_${currentEnvironment()}`;
}

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function readTokens(): StoredTokens | null {
  const raw = localStorage.getItem(tokenKey());
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

function writeTokens(tokens: StoredTokens | null): void {
  if (tokens) localStorage.setItem(tokenKey(), JSON.stringify(tokens));
  else localStorage.removeItem(tokenKey());
}

// Concurrent 401s must not each fire their own refresh call, so every retry waits on the same one.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const tokens = readTokens();
  if (!tokens) return false;

  const res = await fetch(`${baseUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });
  const envelope = (await res.json()) as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
  if (!res.ok || !envelope.success || !envelope.data) {
    writeTokens(null);
    return false;
  }
  writeTokens({ accessToken: envelope.data.accessToken, refreshToken: envelope.data.refreshToken });
  return true;
}

async function request<T>(path: string, init: RequestInit = {}, allowRetry = true): Promise<T> {
  const tokens = readTokens();
  const headers = new Headers(init.headers);
  if (init.body !== undefined) headers.set('Content-Type', 'application/json');
  if (tokens) headers.set('Authorization', `Bearer ${tokens.accessToken}`);

  const res = await fetch(`${baseUrl()}${path}`, { ...init, headers, cache: 'no-store' });

  if (res.status === 401 && allowRetry && tokens) {
    refreshInFlight ??= refreshTokens().finally(() => {
      refreshInFlight = null;
    });
    const refreshed = await refreshInFlight;
    if (refreshed) return request<T>(path, init, false);
  }

  const envelope = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || !envelope.success) {
    throw new ApiError(envelope.error?.code ?? 'UNKNOWN', envelope.error?.message ?? 'Something went wrong.');
  }
  return envelope.data as T;
}

export const apiClient = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string): Promise<T> => request<T>(path, { method: 'DELETE' }),
  setTokens: writeTokens,
  getTokens: readTokens,
  isAuthenticated: (): boolean => readTokens() !== null,
  environment: (): AdminEnvironment => currentEnvironment(),
  setEnvironment: (environment: AdminEnvironment): void => localStorage.setItem(ENVIRONMENT_KEY, environment),
};

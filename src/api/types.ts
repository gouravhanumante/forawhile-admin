// Mirrors the backend's response envelope (src/core/http/response.ts): every endpoint replies
// with this shape, success or failure, so a single unwrapper in client.ts covers all of them.
export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string; details?: unknown } | null;
  meta: unknown;
}

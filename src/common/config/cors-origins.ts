const LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/** Browser origins allowed to call this API, read from CORS_ORIGINS (comma-separated). */
export function allowedOrigins(): string[] {
  return (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * `origin` is undefined for same-origin and non-browser callers (curl, server-to-server).
 * Any localhost origin is also allowed outside production.
 */
export function isAllowedOrigin(
  origin: string | undefined,
  isDev: boolean,
): boolean {
  if (!origin) return true;
  if (allowedOrigins().includes(origin)) return true;
  return isDev && LOCALHOST.test(origin);
}

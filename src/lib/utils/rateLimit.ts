/**
 * Client-side rate limiter to prevent brute-force on auth forms.
 * Uses in-memory tracking per action key.
 */

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 120_000; // 2 minutes lockout

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (entry?.lockedUntil && now < entry.lockedUntil) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.lockedUntil - now) / 1000) };
  }

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    store.set(key, { attempts: 1, firstAttempt: now, lockedUntil: null });
    return { allowed: true };
  }

  entry.attempts += 1;

  if (entry.attempts > MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    return { allowed: false, retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000) };
  }

  return { allowed: true };
}

export function resetRateLimit(key: string) {
  store.delete(key);
}

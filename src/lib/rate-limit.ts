import { createHash } from 'node:crypto';
const WINDOW_MS = 60_000;
const CLIENT_LIMIT = 12;
const GLOBAL_LIMIT = 120;
type Bucket = { count: number; expires: number };
const memory = new Map<string, Bucket>();
export type RateDecision = { allowed: boolean; retryAfter: number };
// Atomic counters shared by all production instances, in one Redis cluster slot.
export const RATE_SCRIPT = `
local a = redis.call('INCR', KEYS[1])
if a == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
local b = redis.call('INCR', KEYS[2])
if b == 1 then redis.call('PEXPIRE', KEYS[2], ARGV[1]) end
local wait = math.max(redis.call('PTTL', KEYS[1]), redis.call('PTTL', KEYS[2]))
return {a, b, wait}`;
export function localRateLimit(key: string, now = Date.now()): RateDecision {
  for (const [id, bucket] of memory) if (bucket.expires <= now) memory.delete(id);
  const counts = [key, 'global'].map(id => {
    const bucket = memory.get(id) ?? { count: 0, expires: now + WINDOW_MS };
    bucket.count += 1;
    memory.set(id, bucket);
    return bucket;
  });
  return { allowed: counts[0].count <= CLIENT_LIMIT && counts[1].count <= GLOBAL_LIMIT, retryAfter: Math.max(1, Math.ceil((Math.max(...counts.map(bucket => bucket.expires)) - now) / 1000)) };
}
export async function checkRateLimit(req: Request): Promise<RateDecision> {
  // Configure only a header the deployment proxy overwrites. Otherwise use a
  // conservative shared bucket; user-supplied forwarding headers are untrusted.
  const header = process.env.CHAT_TRUSTED_IP_HEADER;
  const identity = header ? req.headers.get(header)?.split(',')[0].trim().slice(0, 128) || 'shared' : 'shared';
  const key = createHash('sha256').update(identity).digest('hex');
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (process.env.NODE_ENV === 'production') throw new Error('Rate limiter unavailable');
    return localRateLimit(key);
  }
  if (!url.startsWith('https://')) throw new Error('Rate limiter unavailable');
  const response = await fetch(url, {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(3000),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['EVAL', RATE_SCRIPT, '2', `anato:{chat}:client:${key}`, 'anato:{chat}:global', String(WINDOW_MS)]),
  });
  if (!response.ok) throw new Error('Rate limiter unavailable');
  const { result, error } = await response.json();
  if (error || !Array.isArray(result) || result.length !== 3 || !result.every(Number.isFinite)) throw new Error('Rate limiter unavailable');
  return { allowed: result[0] <= CLIENT_LIMIT && result[1] <= GLOBAL_LIMIT, retryAfter: Math.max(1, Math.ceil(result[2] / 1000)) };
}

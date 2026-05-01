const rateLimitMap = new Map<string, number[]>();

// Clean up stale entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitMap) {
    const filtered = timestamps.filter((t) => now - t < 15 * 60 * 1000);
    if (filtered.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, filtered);
    }
  }
}, 60 * 1000);

function createLimiter(limit: number, intervalMs: number) {
  return {
    check(ip: string): { success: boolean; remaining: number } {
      const now = Date.now();
      const key = `${ip}`;
      const timestamps = (rateLimitMap.get(key) || []).filter(
        (t) => now - t < intervalMs
      );

      if (timestamps.length >= limit) {
        rateLimitMap.set(key, timestamps);
        return { success: false, remaining: 0 };
      }

      timestamps.push(now);
      rateLimitMap.set(key, timestamps);
      return { success: true, remaining: limit - timestamps.length };
    },
  };
}

// 5 requests per 15 minutes
export const contactBookingLimiter = createLimiter(5, 15 * 60 * 1000);

// 3 requests per 15 minutes
export const newsletterLimiter = createLimiter(3, 15 * 60 * 1000);

// Audit lifecycle limiters
export const auditTeaserLimiter = createLimiter(10, 60 * 1000);
export const auditUnlockLimiter = createLimiter(5, 60 * 1000);
export const auditTrackLimiter = createLimiter(30, 60 * 1000);
export const auditRequestLimiter = createLimiter(3, 60 * 1000);
export const unsubscribeLimiter = createLimiter(10, 60 * 1000);

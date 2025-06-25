type RateLimitOptions = {
  windowMs: number; // milliseconds
  maxRequests: number;
};

export class RateLimiter {
  private requests: Map<string, { count: number; windowStart: number }> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(options: RateLimitOptions) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
  }

  isAllowed(ip: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(ip);
    if (!entry || now - entry.windowStart > this.windowMs) {
      this.requests.set(ip, { count: 1, windowStart: now });
      return true;
    }
    if (entry.count < this.maxRequests) {
      entry.count++;
      return true;
    }
    return false;
  }
}

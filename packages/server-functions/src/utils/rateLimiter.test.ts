/* eslint-env jest */
import { RateLimiter } from './rateLimiter';

describe('RateLimiter', () => {
  it('should allow requests under the limit', () => {
    const limiter = new RateLimiter({ windowMs: 1000, maxRequests: 2 });
    expect(limiter.isAllowed('1.1.1.1')).toBe(true);
    expect(limiter.isAllowed('1.1.1.1')).toBe(true);
  });

  it('should block requests over the limit', () => {
    const limiter = new RateLimiter({ windowMs: 1000, maxRequests: 2 });
    limiter.isAllowed('2.2.2.2');
    limiter.isAllowed('2.2.2.2');
    expect(limiter.isAllowed('2.2.2.2')).toBe(false);
  });

  it('should reset after window', (done) => {
    const limiter = new RateLimiter({ windowMs: 100, maxRequests: 1 });
    expect(limiter.isAllowed('3.3.3.3')).toBe(true);
    expect(limiter.isAllowed('3.3.3.3')).toBe(false);
    setTimeout(() => {
      expect(limiter.isAllowed('3.3.3.3')).toBe(true);
      done();
    }, 120);
  });
});

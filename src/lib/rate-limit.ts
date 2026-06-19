export class RateLimiter {
  private tokens: Map<string, { count: number; expiresAt: number }>;
  private windowMs: number;
  private maxTokens: number;

  constructor({ windowMs, maxTokens }: { windowMs: number; maxTokens: number }) {
    this.tokens = new Map();
    this.windowMs = windowMs;
    this.maxTokens = maxTokens;
  }

  check(identifier: string): { success: boolean; limit: number; remaining: number } {
    const now = Date.now();
    const tokenData = this.tokens.get(identifier);

    if (!tokenData) {
      this.tokens.set(identifier, { count: 1, expiresAt: now + this.windowMs });
      return { success: true, limit: this.maxTokens, remaining: this.maxTokens - 1 };
    }

    if (now > tokenData.expiresAt) {
      this.tokens.set(identifier, { count: 1, expiresAt: now + this.windowMs });
      return { success: true, limit: this.maxTokens, remaining: this.maxTokens - 1 };
    }

    if (tokenData.count >= this.maxTokens) {
      return { success: false, limit: this.maxTokens, remaining: 0 };
    }

    tokenData.count += 1;
    this.tokens.set(identifier, tokenData);

    return { success: true, limit: this.maxTokens, remaining: this.maxTokens - tokenData.count };
  }
}

// Global rate limiters (in-memory for single instance, e.g. Hobby tier)
export const authRateLimit = new RateLimiter({ windowMs: 15 * 60 * 1000, maxTokens: 10 }); // 10 requests per 15 minutes
export const apiRateLimit = new RateLimiter({ windowMs: 60 * 1000, maxTokens: 60 }); // 60 requests per minute

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  queueLimit?: number;
}

interface QueuedRequest {
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private queues: Map<string, QueuedRequest[]> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  registerEndpoint(endpoint: string, config: RateLimitConfig) {
    this.configs.set(endpoint, config);
    this.requests.set(endpoint, []);
    this.queues.set(endpoint, []);
  }

  private cleanExpiredRequests(endpoint: string, windowMs: number) {
    const now = Date.now();
    const requestTimes = this.requests.get(endpoint) || [];
    const validRequests = requestTimes.filter(time => now - time < windowMs);
    this.requests.set(endpoint, validRequests);
  }

  private async processQueue(endpoint: string) {
    const config = this.configs.get(endpoint);
    if (!config) return;

    const queue = this.queues.get(endpoint) || [];
    if (queue.length === 0) return;

    this.cleanExpiredRequests(endpoint, config.windowMs);
    const requestTimes = this.requests.get(endpoint) || [];

    if (requestTimes.length < config.maxRequests) {
      const nextRequest = queue.shift();
      if (!nextRequest) return;

      requestTimes.push(Date.now());
      this.requests.set(endpoint, requestTimes);

      try {
        const result = await nextRequest.fn();
        nextRequest.resolve(result);
      } catch (error) {
        nextRequest.reject(error);
      }

      setTimeout(() => this.processQueue(endpoint), 0);
    } else {
      const oldestRequest = requestTimes[0];
      const waitTime = config.windowMs - (Date.now() - oldestRequest);
      setTimeout(() => this.processQueue(endpoint), Math.max(0, waitTime));
    }
  }

  async throttle<T>(
    endpoint: string,
    fn: () => Promise<T>,
    priority: number = 0
  ): Promise<T> {
    const config = this.configs.get(endpoint);

    if (!config) {
      console.warn(`No rate limit config for endpoint: ${endpoint}, executing immediately`);
      return fn();
    }

    this.cleanExpiredRequests(endpoint, config.windowMs);
    const requestTimes = this.requests.get(endpoint) || [];

    if (requestTimes.length < config.maxRequests) {
      requestTimes.push(Date.now());
      this.requests.set(endpoint, requestTimes);
      return fn();
    }

    const queue = this.queues.get(endpoint) || [];

    if (config.queueLimit && queue.length >= config.queueLimit) {
      throw new Error(`Rate limit queue full for endpoint: ${endpoint}`);
    }

    return new Promise<T>((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        fn: fn as () => Promise<any>,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      queue.push(queuedRequest);

      queue.sort((a, b) => {
        const aPriority = priority;
        const bPriority = priority;
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        return a.timestamp - b.timestamp;
      });

      this.queues.set(endpoint, queue);

      this.processQueue(endpoint);
    });
  }

  getRemainingRequests(endpoint: string): number {
    const config = this.configs.get(endpoint);
    if (!config) return 0;

    this.cleanExpiredRequests(endpoint, config.windowMs);
    const requestTimes = this.requests.get(endpoint) || [];
    return Math.max(0, config.maxRequests - requestTimes.length);
  }

  getQueueLength(endpoint: string): number {
    return (this.queues.get(endpoint) || []).length;
  }

  clearQueue(endpoint: string) {
    const queue = this.queues.get(endpoint) || [];
    queue.forEach(req => req.reject(new Error('Queue cleared')));
    this.queues.set(endpoint, []);
  }

  reset(endpoint?: string) {
    if (endpoint) {
      this.requests.set(endpoint, []);
      this.clearQueue(endpoint);
    } else {
      this.requests.clear();
      this.queues.forEach((_, ep) => this.clearQueue(ep));
      this.queues.clear();
    }
  }
}

export const rateLimiter = new RateLimiter();

rateLimiter.registerEndpoint('openai', {
  maxRequests: 3,
  windowMs: 1000,
  queueLimit: 10,
});

rateLimiter.registerEndpoint('sunnah-api', {
  maxRequests: 5,
  windowMs: 1000,
  queueLimit: 20,
});

rateLimiter.registerEndpoint('quran-api', {
  maxRequests: 10,
  windowMs: 1000,
  queueLimit: 50,
});

rateLimiter.registerEndpoint('supabase', {
  maxRequests: 50,
  windowMs: 1000,
  queueLimit: 100,
});

rateLimiter.registerEndpoint('edge-function', {
  maxRequests: 10,
  windowMs: 1000,
  queueLimit: 30,
});

export default rateLimiter;
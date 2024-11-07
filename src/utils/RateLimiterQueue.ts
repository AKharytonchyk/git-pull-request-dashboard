class RateLimiterQueue {
  private queue: Array<() => Promise<void>>;
  private maxRequestsPerMinute: number;
  private activeRequests: number;
  private requestTimestamps: number[];

  constructor(maxRequestsPerMinute: number) {
    this.queue = [];
    this.maxRequestsPerMinute = maxRequestsPerMinute;
    this.activeRequests = 0;
    this.requestTimestamps = [];

    setInterval(() => {
      this.cleanupOldTimestamps();
    }, 60000);
  }

  async enqueue<T>(requestFunction: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.activeRequests++;
          const result = await requestFunction();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this.requestTimestamps.push(Date.now());
          this.processQueue();
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    this.cleanupOldTimestamps();

    while (this.queue.length > 0 && this.canProcessMoreRequests()) {
      const requestFunction = this.queue.shift();
      if (requestFunction) {
        requestFunction().catch((error) => {
          console.error("Error processing request:", error);
        });
      }
    }
  }

  private canProcessMoreRequests(): boolean {
    return this.requestTimestamps.length < this.maxRequestsPerMinute;
  }

  private cleanupOldTimestamps() {
    const oneMinuteAgo = Date.now() - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
  }

  async processAll<T>(requestFunctions: Array<() => Promise<T>>): Promise<T[]> {
    const results = requestFunctions.map((requestFunction) => this.enqueue(requestFunction));
    return Promise.all(results);
  }
}

const rateLimiter = new RateLimiterQueue(
  isNaN(Number(process.env.MAX_REQUESTS_PER_MINUTE)) ? 200 : Number(process.env.MAX_REQUESTS_PER_MINUTE)
);

export default rateLimiter;

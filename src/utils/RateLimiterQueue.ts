class RateLimiterQueue {
  private queue: any[];
  private delay: number;
  private isProcessing: boolean;
  private loggingInterval: NodeJS.Timeout | null;

  constructor(maxRequestsPerMinute: number) {
    this.queue = [];
    this.delay = 60000 / maxRequestsPerMinute;
    this.isProcessing = false;

    this.loggingInterval = setInterval(() => {
      const statusMessage = this.isProcessing
        ? "Reached rate limit. Waiting to process next request."
        : "Currently processing requests.";
      console.log(`Queue size: ${this.queue.length}. Rate limit: ${maxRequestsPerMinute}. Estimated time: ${this.queue.length / maxRequestsPerMinute} minutes. ${statusMessage}`);
    }, 60000);
  }

  async enqueue<T>(requestFunction: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFunction();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    this.isProcessing = true;
    while (this.queue.length > 0) {
      console.debug(`Processing request. Queue size before: ${this.queue.length}`);
      const requestFunction = this.queue.shift();
      if (requestFunction) {
        try {
          await requestFunction();
          console.debug(`Request processed. Queue size after: ${this.queue.length}`);
        } catch (error) {
          console.error("Error processing request:", error);
        }
        await this.sleep(this.delay);
      }
    }
    this.isProcessing = false;
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async processAll<T>(requestFunctions: Array<() => Promise<T>>): Promise<T[]> {
    const results = requestFunctions.map((requestFunction) => this.enqueue(requestFunction));
    return Promise.all(results);
  }

  destroy() {
    if (this.loggingInterval) {
      clearInterval(this.loggingInterval);
      this.loggingInterval = null;
    }
  }
}

const rateLimiter = new RateLimiterQueue(
  isNaN(Number(process.env.MAX_REQUESTS_PER_MINUTE)) ? 200 : Number(process.env.MAX_REQUESTS_PER_MINUTE)
);

export default rateLimiter;

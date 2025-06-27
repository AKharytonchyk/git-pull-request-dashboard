import { envConfig } from "./environmentConfig";

class RateLimiterQueue {
  private queue: Array<() => Promise<void>>;
  private maxRequestsPerMinute: number;
  private activeRequests: number;
  private requestTimestamps: number[];
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxRequestsPerMinute: number) {
    this.queue = [];
    this.maxRequestsPerMinute = maxRequestsPerMinute;
    this.activeRequests = 0;
    this.requestTimestamps = [];

    this.cleanupInterval = setInterval(() => {
      this.cleanupOldTimestamps();
    }, 60000);
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }

  async enqueue<T>(
    requestFunction: () => Promise<T>,
    unshift = false,
    retries = 3
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const queueAction = async () => {
        let lastError: any;
        
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            this.activeRequests++;
            const result = await requestFunction();
            resolve(result);
            return;
          } catch (error: any) {
            lastError = error;
            
            // Don't retry on authentication or permission errors
            if (error.status === 401 || error.status === 403) {
              reject(error);
              return;
            }
            
            // Exponential backoff for retries
            if (attempt < retries) {
              const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          } finally {
            this.activeRequests--;
            this.requestTimestamps.push(Date.now());
          }
        }
        
        reject(lastError);
        this.processQueue();
      };

      if (unshift) {
        this.queue.unshift(queueAction);
      } else {
        this.queue.push(queueAction);
      }
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
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => timestamp > oneMinuteAgo,
    );
  }

  async processAll<T>(requestFunctions: Array<() => Promise<T>>): Promise<T[]> {
    const results = requestFunctions.map((requestFunction) =>
      this.enqueue(requestFunction),
    );
    return Promise.all(results);
  }
}

const rateLimiter = new RateLimiterQueue(envConfig.maxRequestsPerMinute);

export default rateLimiter;

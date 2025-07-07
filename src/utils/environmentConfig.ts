// Environment configuration with validation
export class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  
  private config: {
    githubApiUrl: string;
    githubAvatarUrl: string;
    githubBaseUrl: string;
    maxRequestsPerMinute: number;
    isDevelopment: boolean;
    isProduction: boolean;
  };

  private constructor() {
    this.config = this.loadAndValidateConfig();
  }

  static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private loadAndValidateConfig() {
    const env = import.meta.env;
    
    const githubApiUrl = env.VITE_GITHUB_API_URL || 'https://api.github.com';
    const githubAvatarUrl = env.VITE_GITHUB_AVATAR_URL || this.getDefaultAvatarUrl(githubApiUrl);
    const githubBaseUrl = env.VITE_GITHUB_BASE_URL || this.getDefaultBaseUrl(githubApiUrl);
    const maxRequestsPerMinute = this.parseNumber(env.VITE_MAX_REQUESTS_PER_MINUTE, 200);
    const isDevelopment = env.DEV === true;
    const isProduction = env.PROD === true;

    // Validate GitHub API URL
    try {
      new URL(githubApiUrl);
    } catch {
      throw new Error(`Invalid GitHub API URL: ${githubApiUrl}`);
    }

    // Validate avatar URL
    try {
      new URL(githubAvatarUrl);
    } catch {
      throw new Error(`Invalid GitHub Avatar URL: ${githubAvatarUrl}`);
    }

    // Validate base URL
    try {
      new URL(githubBaseUrl);
    } catch {
      throw new Error(`Invalid GitHub Base URL: ${githubBaseUrl}`);
    }

    // Validate rate limit
    if (maxRequestsPerMinute < 1 || maxRequestsPerMinute > 5000) {
      throw new Error(`Invalid max requests per minute: ${maxRequestsPerMinute}`);
    }

    return {
      githubApiUrl,
      githubAvatarUrl,
      githubBaseUrl,
      maxRequestsPerMinute,
      isDevelopment,
      isProduction,
    };
  }

  // Helper methods to derive default URLs from API URL
  private getDefaultAvatarUrl(apiUrl: string): string {
    if (apiUrl === 'https://api.github.com') {
      return 'https://avatars.githubusercontent.com';
    }
    
    // For GitHub Enterprise Server, derive from API URL
    // e.g., https://ghe.company.com/api/v3 -> https://avatars.ghe.company.com
    try {
      const url = new URL(apiUrl);
      const hostname = url.hostname;
      
      // Remove /api/v3 path and replace with avatars subdomain
      if (hostname.startsWith('ghe.') || hostname.includes('.ghe.')) {
        return `https://avatars.${hostname}`;
      } else {
        // Generic pattern for enterprise servers
        return `https://avatars.${hostname}`;
      }
    } catch {
      return 'https://avatars.githubusercontent.com';
    }
  }

  private getDefaultBaseUrl(apiUrl: string): string {
    if (apiUrl === 'https://api.github.com') {
      return 'https://github.com';
    }
    
    // For GitHub Enterprise Server, derive from API URL
    // e.g., https://ghe.company.com/api/v3 -> https://ghe.company.com
    try {
      const url = new URL(apiUrl);
      return `${url.protocol}//${url.hostname}`;
    } catch {
      return 'https://github.com';
    }
  }

  private parseNumber(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  get githubApiUrl(): string {
    return this.config.githubApiUrl;
  }

  get githubAvatarUrl(): string {
    return this.config.githubAvatarUrl;
  }

  get githubBaseUrl(): string {
    return this.config.githubBaseUrl;
  }

  get maxRequestsPerMinute(): number {
    return this.config.maxRequestsPerMinute;
  }

  get isDevelopment(): boolean {
    return this.config.isDevelopment;
  }

  get isProduction(): boolean {
    return this.config.isProduction;
  }

  // Generate dynamic Content Security Policy based on GitHub environment
  generateCSP(): string {
    const { githubApiUrl, githubAvatarUrl } = this.config;
    
    // Extract hostnames for CSP
    const apiHost = new URL(githubApiUrl).hostname;
    const avatarHost = new URL(githubAvatarUrl).hostname;
    
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src 'self' ${githubApiUrl} https://${apiHost} https://api.simplesvg.com`,
      `img-src 'self' data: ${githubAvatarUrl} https://${avatarHost} https://${apiHost} https://api.simplesvg.com`,
      `frame-ancestors 'none'`,
      `base-uri 'self'`
    ].join('; ');
  }

  // Get all GitHub-related domains for CSP
  getGitHubDomains(): {
    api: string;
    avatars: string;
    base: string;
  } {
    return {
      api: new URL(this.config.githubApiUrl).hostname,
      avatars: new URL(this.config.githubAvatarUrl).hostname,
      base: new URL(this.config.githubBaseUrl).hostname,
    };
  }

  // Method to get all config for debugging
  getAll() {
    return { ...this.config };
  }
}

export const envConfig = EnvironmentConfig.getInstance();

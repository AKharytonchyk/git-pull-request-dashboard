// Enhanced token security utilities
export class TokenManager {
  private static readonly TOKEN_KEY = 'github_token';
  private static readonly EXPIRY_KEY = 'token_expiry';
  private static readonly USER_KEY = 'github_user';
  private static readonly SESSION_DURATION = 8 * 60 * 60 * 1000; 
  private static readonly WARNING_THRESHOLD = 30 * 60 * 1000;

  static setToken(token: string): void {
    try {
      if (!token || token.length < 10) {
        throw new Error('Invalid token format');
      }

      const encodedToken = btoa(token);
      const expiryTime = Date.now() + this.SESSION_DURATION;
      
      sessionStorage.setItem(this.TOKEN_KEY, encodedToken);
      sessionStorage.setItem(this.EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.error('Failed to store token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  static setUserData(userData: any): void {
    try {
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  static getUserData(): any | null {
    try {
      const userData = sessionStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  static getToken(): string | null {
    try {
      const encodedToken = sessionStorage.getItem(this.TOKEN_KEY);
      const expiry = sessionStorage.getItem(this.EXPIRY_KEY);
      
      if (!encodedToken || !expiry) return null;
      
      if (Date.now() > parseInt(expiry)) {
        this.clearToken();
        return null;
      }
      
      return atob(encodedToken);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      this.clearToken();
      return null;
    }
  }

  static clearToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.EXPIRY_KEY);
      sessionStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  static isTokenValid(): boolean {
    return this.getToken() !== null;
  }

  static getTimeUntilExpiry(): number {
    try {
      const expiry = sessionStorage.getItem(this.EXPIRY_KEY);
      if (!expiry) return 0;
      
      return Math.max(0, parseInt(expiry) - Date.now());
    } catch {
      return 0;
    }
  }

  static shouldWarnAboutExpiry(): boolean {
    const timeLeft = this.getTimeUntilExpiry();
    return timeLeft > 0 && timeLeft <= this.WARNING_THRESHOLD;
  }
}

export const CSP_RECOMMENDATIONS = {
  contentSecurityPolicy: `
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.github.com;
    img-src 'self' data: https://avatars.githubusercontent.com;
  `
};

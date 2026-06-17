import { AuthSession, AuthenticatedUser } from "../models/Auth";

// Enhanced token security utilities
export class TokenManager {
  private static readonly TOKEN_KEY = 'github_token';
  private static readonly EXPIRY_KEY = 'token_expiry';
  private static readonly USER_KEY = 'github_user';
  private static readonly SESSION_KEY = 'github_auth_session';
  private static readonly SESSION_DURATION = 8 * 60 * 60 * 1000; 
  private static readonly WARNING_THRESHOLD = 30 * 60 * 1000;

  private static encodeToken(token: string): string {
    return btoa(token);
  }

  private static decodeToken(encodedToken: string): string {
    return atob(encodedToken);
  }

  static setSession(session: AuthSession): void {
    try {
      if (session.method !== "pat") {
        return;
      }

      const { token } = session;
      if (!token || token.length < 10) {
        throw new Error('Invalid token format');
      }

      const expiryTime = Date.now() + this.SESSION_DURATION;
      const storedSession = {
        ...session,
        token: this.encodeToken(token),
        expiresAt: expiryTime,
      };
      
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(storedSession));
      sessionStorage.setItem(this.TOKEN_KEY, storedSession.token);
      sessionStorage.setItem(this.EXPIRY_KEY, expiryTime.toString());
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(session.user));
    } catch (error) {
      console.error('Failed to store token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  static setToken(token: string): void {
    this.setSession({
      method: "pat",
      token,
      provider: {
        host: "github.com",
        apiUrl: "https://api.github.com",
        webUrl: "https://github.com",
        avatarUrl: "https://avatars.githubusercontent.com",
      },
      user: this.getUserData() ?? {
        login: "",
        avatar_url: "",
        url: "",
      },
    });
  }

  static setUserData(userData: AuthenticatedUser): void {
    try {
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  static getUserData(): AuthenticatedUser | null {
    try {
      const userData = sessionStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  static getSession(): AuthSession | null {
    try {
      const storedSession = sessionStorage.getItem(this.SESSION_KEY);
      if (!storedSession) {
        return null;
      }

      const parsed = JSON.parse(storedSession) as AuthSession & {
        expiresAt?: number;
        token?: string;
      };

      if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
        this.clearToken();
        return null;
      }

      if (parsed.method !== "pat" || !parsed.token) {
        return null;
      }

      return {
        method: "pat",
        token: this.decodeToken(parsed.token),
        provider: parsed.provider,
        user: parsed.user,
      };
    } catch (error) {
      console.error('Failed to retrieve auth session:', error);
      this.clearToken();
      return null;
    }
  }

  static getToken(): string | null {
    try {
      const session = this.getSession();
      if (session?.token) {
        return session.token;
      }

      const encodedToken = sessionStorage.getItem(this.TOKEN_KEY);
      const expiry = sessionStorage.getItem(this.EXPIRY_KEY);
      
      if (!encodedToken || !expiry) return null;
      
      if (Date.now() > parseInt(expiry)) {
        this.clearToken();
        return null;
      }
      
      return this.decodeToken(encodedToken);
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
      sessionStorage.removeItem(this.SESSION_KEY);
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

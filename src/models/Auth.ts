export type AuthMethod = "oauth" | "pat";

export interface AuthProvider {
  host: string;
  apiUrl: string;
  webUrl: string;
  avatarUrl?: string;
}

export interface AuthenticatedUser {
  login: string;
  avatar_url: string;
  url: string;
  html_url?: string;
}

export interface AuthSession {
  method: AuthMethod;
  provider: AuthProvider;
  user: AuthenticatedUser;
  token?: string;
}

export interface OAuthSessionResponse {
  authenticated: boolean;
  provider?: AuthProvider;
  user?: AuthenticatedUser;
}

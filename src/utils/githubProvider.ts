import { AuthProvider } from "../models/Auth";
import { envConfig } from "./environmentConfig";

const GITHUB_HOST = "github.com";
const GITHUB_API_URL = "https://api.github.com";
const GITHUB_AVATAR_URL = "https://avatars.githubusercontent.com";
const GITHUB_WEB_URL = "https://github.com";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function normalizeUrlInput(input: string): URL {
  const value = input.trim();
  return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
}

function normalizeHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^api\./, "");
}

export function providerFromConfiguredEnvironment(): AuthProvider {
  return {
    host: new URL(envConfig.githubBaseUrl).hostname,
    apiUrl: envConfig.githubApiUrl,
    webUrl: envConfig.githubBaseUrl,
    avatarUrl: envConfig.githubAvatarUrl,
  };
}

export function providerFromHost(input?: string): AuthProvider {
  if (!input?.trim()) {
    return providerFromConfiguredEnvironment();
  }

  const url = normalizeUrlInput(input);
  const host = normalizeHost(url.hostname);

  if (host === GITHUB_HOST) {
    return {
      host: GITHUB_HOST,
      apiUrl: GITHUB_API_URL,
      webUrl: GITHUB_WEB_URL,
      avatarUrl: GITHUB_AVATAR_URL,
    };
  }

  if (host.endsWith(".ghe.com")) {
    return {
      host,
      apiUrl: `https://api.${host}`,
      webUrl: `https://${host}`,
      avatarUrl: GITHUB_AVATAR_URL,
    };
  }

  const apiUrl = url.pathname.startsWith("/api/")
    ? trimTrailingSlash(url.toString())
    : `${url.protocol}//${url.hostname}/api/v3`;

  return {
    host,
    apiUrl,
    webUrl: `${url.protocol}//${host}`,
    avatarUrl: `https://avatars.${host}`,
  };
}

export function oauthProxyApiUrl(): string {
  return `${window.location.origin}/api/github`;
}

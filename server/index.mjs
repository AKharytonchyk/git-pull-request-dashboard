import crypto from "node:crypto";
import { createReadStream, existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(process.env.DIST_DIR ?? path.resolve(__dirname, "../dist"));
const port = Number.parseInt(process.env.PORT ?? "8080", 10);

const SESSION_COOKIE = "gprd_session";
const STATE_COOKIE = "gprd_oauth_state";
const SESSION_MAX_AGE_SECONDS = Number.parseInt(
  process.env.SESSION_MAX_AGE_SECONDS ?? "28800",
  10
);
const DEFAULT_SCOPES =
  process.env.GITHUB_OAUTH_SCOPES ?? "repo read:org user:email security_events";
const sessionSecret =
  process.env.SESSION_SECRET ?? crypto.randomBytes(32).toString("hex");

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  console.warn(
    "SESSION_SECRET is not set; OAuth sessions will be invalidated on restart."
  );
}

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webmanifest", "application/manifest+json"],
  [".webp", "image/webp"],
]);

const hopByHopHeaders = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(`${normalized}${padding}`, "base64");
}

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((cookies, cookie) => {
      const [name, ...valueParts] = cookie.split("=");
      cookies[name] = decodeURIComponent(valueParts.join("="));
      return cookies;
    }, {});
}

function serializeCookie(name, value, req, options = {}) {
  const secure =
    process.env.APP_BASE_URL?.startsWith("https://") ||
    req.headers["x-forwarded-proto"] === "https" ||
    req.socket.encrypted === true;
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options.path ?? "/"}`,
    `SameSite=${options.sameSite ?? "Lax"}`,
  ];

  if (options.httpOnly !== false) parts.push("HttpOnly");
  if (secure) parts.push("Secure");
  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  return parts.join("; ");
}

function clearCookie(name, req) {
  return serializeCookie(name, "", req, { maxAge: 0 });
}

function signingKey() {
  return crypto.createHash("sha256").update(sessionSecret).digest();
}

function hmac(value) {
  return base64UrlEncode(
    crypto.createHmac("sha256", sessionSecret).update(value).digest()
  );
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function encodeSignedPayload(payload) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encodedPayload}.${hmac(encodedPayload)}`;
}

function decodeSignedPayload(value) {
  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) {
    throw new Error("Invalid signed payload");
  }

  if (!safeEqual(hmac(encodedPayload), signature)) {
    throw new Error("Invalid signed payload signature");
  }

  return JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"));
}

function sealSession(session) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", signingKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [iv, tag, ciphertext].map(base64UrlEncode).join(".");
}

function unsealSession(value) {
  const [encodedIv, encodedTag, encodedCiphertext] = value.split(".");
  if (!encodedIv || !encodedTag || !encodedCiphertext) {
    throw new Error("Invalid session cookie");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    signingKey(),
    base64UrlDecode(encodedIv)
  );
  decipher.setAuthTag(base64UrlDecode(encodedTag));
  const decrypted = Buffer.concat([
    decipher.update(base64UrlDecode(encodedCiphertext)),
    decipher.final(),
  ]);

  const session = JSON.parse(decrypted.toString("utf8"));
  if (!session.expiresAt || Date.now() > session.expiresAt) {
    throw new Error("Session expired");
  }

  return session;
}

function hostForSession(session) {
  return session?.provider?.host;
}

function pruneSessionStore(store) {
  const sessions = Object.fromEntries(
    Object.entries(store.sessions ?? {}).filter(
      ([, session]) => session?.expiresAt && Date.now() <= session.expiresAt
    )
  );

  return { version: 2, sessions };
}

function toSessionStore(sessionOrStore) {
  if (sessionOrStore?.version === 2 && sessionOrStore.sessions) {
    return pruneSessionStore(sessionOrStore);
  }

  const host = hostForSession(sessionOrStore);
  if (!host || !sessionOrStore?.expiresAt || Date.now() > sessionOrStore.expiresAt) {
    return { version: 2, sessions: {} };
  }

  return {
    version: 2,
    sessions: {
      [host]: sessionOrStore,
    },
  };
}

function sessionStoreFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionCookie = cookies[SESSION_COOKIE];
  return sessionCookie
    ? toSessionStore(unsealSession(sessionCookie))
    : { version: 2, sessions: {} };
}

function sessionsFromStore(store) {
  return Object.values(pruneSessionStore(store).sessions).sort((a, b) => {
    if (a.provider.host === "github.com") return -1;
    if (b.provider.host === "github.com") return 1;
    return a.provider.host.localeCompare(b.provider.host);
  });
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function parseUrlInput(input) {
  return new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
}

function normalizeHost(input) {
  const url = parseUrlInput(input);
  return url.hostname.toLowerCase().replace(/^api\./, "");
}

function deriveProvider(hostInput) {
  const url = parseUrlInput(hostInput || "github.com");
  const host = normalizeHost(hostInput || "github.com");

  if (host === "github.com") {
    return {
      host,
      apiUrl: "https://api.github.com",
      authUrl: "https://github.com",
      webUrl: "https://github.com",
      scopes: DEFAULT_SCOPES,
    };
  }

  if (host.endsWith(".ghe.com")) {
    return {
      host,
      apiUrl: `https://api.${host}`,
      authUrl: `https://${host}`,
      webUrl: `https://${host}`,
      scopes: process.env.GHE_OAUTH_SCOPES ?? DEFAULT_SCOPES,
    };
  }

  const apiUrl = url.pathname.startsWith("/api/")
    ? trimTrailingSlash(url.toString())
    : `${url.protocol}//${url.hostname}/api/v3`;

  return {
    host,
    apiUrl,
    authUrl: `${url.protocol}//${url.hostname}`,
    webUrl: `${url.protocol}//${host}`,
    scopes: process.env.GHE_OAUTH_SCOPES ?? DEFAULT_SCOPES,
  };
}

function oauthAppConfig() {
  const apps = new Map();

  if (process.env.GITHUB_OAUTH_CLIENT_ID && process.env.GITHUB_OAUTH_CLIENT_SECRET) {
    apps.set("github.com", {
      clientId: process.env.GITHUB_OAUTH_CLIENT_ID,
      clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
    });
  }

  if (process.env.GHE_HOST && process.env.GHE_OAUTH_CLIENT_ID && process.env.GHE_OAUTH_CLIENT_SECRET) {
    apps.set(normalizeHost(process.env.GHE_HOST), {
      clientId: process.env.GHE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GHE_OAUTH_CLIENT_SECRET,
    });
  }

  if (process.env.GHE_OAUTH_APPS) {
    let configuredApps;
    try {
      configuredApps = JSON.parse(process.env.GHE_OAUTH_APPS);
    } catch (error) {
      console.error(
        "Failed to parse GHE_OAUTH_APPS as JSON; ignoring it. Error:",
        error.message
      );
      return apps;
    }
    Object.entries(configuredApps).forEach(([host, config]) => {
      apps.set(normalizeHost(host), {
        apiUrl: config.apiUrl ?? config.api_url,
        authUrl: config.authUrl ?? config.auth_url,
        clientId: config.clientId ?? config.client_id,
        clientSecret: config.clientSecret ?? config.client_secret,
        scopes: config.scopes,
        webUrl: config.webUrl ?? config.web_url,
      });
    });
  }

  return apps;
}

const configuredOauthApps = oauthAppConfig();

function providerFor(hostInput) {
  const derived = deriveProvider(hostInput);
  const configured = configuredOauthApps.get(derived.host) ?? {};

  return {
    ...derived,
    ...configured,
    host: derived.host,
    apiUrl: trimTrailingSlash(configured.apiUrl ?? derived.apiUrl),
    authUrl: trimTrailingSlash(configured.authUrl ?? derived.authUrl),
    webUrl: trimTrailingSlash(configured.webUrl ?? derived.webUrl),
    scopes: configured.scopes ?? derived.scopes,
  };
}

function publicOrigin(req) {
  if (process.env.APP_BASE_URL) {
    return trimTrailingSlash(process.env.APP_BASE_URL);
  }

  const proto = req.headers["x-forwarded-proto"] ?? "http";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  return `${proto}://${host}`;
}

function joinUrl(baseUrl, pathSuffix) {
  return `${trimTrailingSlash(baseUrl)}/${pathSuffix.replace(/^\/+/, "")}`;
}

function sendJson(res, status, body, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders,
  });
  res.end(JSON.stringify(body));
}

function redirect(res, location, headers = {}) {
  res.writeHead(302, {
    Location: location,
    ...headers,
  });
  res.end();
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function fetchAuthenticatedUser(provider, accessToken) {
  const response = await fetch(joinUrl(provider.apiUrl, "/user"), {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "git-pull-request-dashboard",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`GitHub user request failed: ${response.status} ${message}`);
  }

  return response.json();
}

function publicUser(user) {
  return {
    login: user.login,
    avatar_url: user.avatar_url,
    url: user.url,
    html_url: user.html_url,
  };
}

async function handleOAuthStart(req, res, url) {
  const provider = providerFor(url.searchParams.get("provider") ?? "github.com");

  if (!provider.clientId || !provider.clientSecret) {
    sendJson(res, 500, {
      error: "oauth_not_configured",
      message: `No OAuth app is configured for ${provider.host}.`,
    });
    return;
  }

  const requestedRedirect = url.searchParams.get("redirect") || "/#/";
  const redirectTo =
    requestedRedirect.startsWith("/") &&
    !requestedRedirect.startsWith("//") &&
    !requestedRedirect.startsWith("/\\")
      ? requestedRedirect
      : "/#/";
  const state = encodeSignedPayload({
    nonce: crypto.randomUUID(),
    providerHost: provider.host,
    redirectTo,
  });
  const origin = publicOrigin(req);
  const redirectUri = `${origin}/api/auth/github/callback`;
  const authorizeUrl = new URL("/login/oauth/authorize", provider.authUrl);
  authorizeUrl.searchParams.set("client_id", provider.clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", provider.scopes);
  authorizeUrl.searchParams.set("state", state);

  redirect(res, authorizeUrl.toString(), {
    "Set-Cookie": serializeCookie(STATE_COOKIE, state, req, {
      maxAge: 600,
    }),
  });
}

async function handleOAuthCallback(req, res, url) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    redirect(res, `/#/login?auth_error=${encodeURIComponent(error)}`);
    return;
  }

  if (!code || !state) {
    sendJson(res, 400, { error: "missing_oauth_callback_parameters" });
    return;
  }

  const cookies = parseCookies(req.headers.cookie);
  if (!cookies[STATE_COOKIE] || !safeEqual(cookies[STATE_COOKIE], state)) {
    sendJson(res, 400, { error: "invalid_oauth_state" });
    return;
  }

  const decodedState = decodeSignedPayload(state);
  const provider = providerFor(decodedState.providerHost);
  const origin = publicOrigin(req);
  const redirectUri = `${origin}/api/auth/github/callback`;
  const tokenUrl = new URL("/login/oauth/access_token", provider.authUrl);
  const body = new URLSearchParams({
    client_id: provider.clientId,
    client_secret: provider.clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "git-pull-request-dashboard",
    },
    body,
  });

  const tokenPayload = await tokenResponse.json();
  if (!tokenResponse.ok || tokenPayload.error || !tokenPayload.access_token) {
    sendJson(res, 502, {
      error: "oauth_token_exchange_failed",
      detail: tokenPayload.error_description ?? tokenPayload.error,
    });
    return;
  }

  const publicProvider = {
    host: provider.host,
    apiUrl: provider.apiUrl,
    webUrl: provider.webUrl,
  };
  const user = await fetchAuthenticatedUser(provider, tokenPayload.access_token);
  const session = {
    accessToken: tokenPayload.access_token,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    provider: publicProvider,
    scope: tokenPayload.scope,
    tokenType: tokenPayload.token_type ?? "bearer",
    user: publicUser(user),
  };
  const existingStore = sessionStoreFromRequest(req);
  const sessionStore = pruneSessionStore({
    version: 2,
    sessions: {
      ...existingStore.sessions,
      [provider.host]: session,
    },
  });

  redirect(res, decodedState.redirectTo || "/#/", {
    "Set-Cookie": [
      serializeCookie(SESSION_COOKIE, sealSession(sessionStore), req, {
        maxAge: SESSION_MAX_AGE_SECONDS,
      }),
      clearCookie(STATE_COOKIE, req),
    ],
  });
}

function handleSession(req, res) {
  try {
    const store = sessionStoreFromRequest(req);
    const sessions = sessionsFromStore(store);
    const publicSessions = sessions.map((session) => ({
      provider: session.provider,
      user: session.user,
      scope: session.scope,
      tokenType: session.tokenType,
    }));

    if (publicSessions.length === 0) {
      sendJson(res, 200, { authenticated: false });
      return;
    }

    sendJson(res, 200, {
      authenticated: true,
      provider: publicSessions[0].provider,
      user: publicSessions[0].user,
      sessions: publicSessions,
    });
  } catch {
    sendJson(res, 200, { authenticated: false }, {
      "Set-Cookie": clearCookie(SESSION_COOKIE, req),
    });
  }
}

function handleLogout(req, res) {
  sendJson(res, 200, { ok: true }, {
    "Set-Cookie": clearCookie(SESSION_COOKIE, req),
  });
}

async function handleGitHubProxy(req, res, url) {
  let sessions;
  try {
    sessions = sessionsFromStore(sessionStoreFromRequest(req));
  } catch {
    sendJson(res, 401, { error: "invalid_session" }, {
      "Set-Cookie": clearCookie(SESSION_COOKIE, req),
    });
    return;
  }

  if (sessions.length === 0) {
    sendJson(res, 401, { error: "not_authenticated" });
    return;
  }

  const proxyPath = url.pathname.replace(/^\/api\/github\/?/, "/") || "/";
  const pathSegments = proxyPath.replace(/^\/+/, "").split("/");
  const requestedHost = decodeURIComponent(pathSegments[0] ?? "");
  const matchingSession = sessions.find(
    (candidate) => candidate.provider.host === requestedHost
  );
  const session = matchingSession ?? sessions[0];
  const upstreamPath = matchingSession
    ? `/${pathSegments.slice(1).join("/")}`
    : proxyPath;
  const upstreamUrl = `${joinUrl(session.provider.apiUrl, upstreamPath)}${url.search}`;
  const headers = new Headers();

  Object.entries(req.headers).forEach(([name, value]) => {
    if (!value || hopByHopHeaders.has(name.toLowerCase())) return;
    if (["cookie", "host", "authorization"].includes(name.toLowerCase())) return;
    headers.set(name, Array.isArray(value) ? value.join(",") : value);
  });

  headers.set("Accept", headers.get("Accept") ?? "application/vnd.github+json");
  headers.set("Authorization", `Bearer ${session.accessToken}`);
  headers.set("User-Agent", headers.get("User-Agent") ?? "git-pull-request-dashboard");
  headers.set("X-GitHub-Api-Version", headers.get("X-GitHub-Api-Version") ?? "2022-11-28");

  const body = ["GET", "HEAD"].includes(req.method ?? "")
    ? undefined
    : await readRequestBody(req);
  const upstreamResponse = await fetch(upstreamUrl, {
    method: req.method,
    headers,
    body,
  });

  upstreamResponse.headers.forEach((value, name) => {
    const lower = name.toLowerCase();
    if (hopByHopHeaders.has(lower)) return;
    if (lower === "set-cookie" || lower === "set-cookie2") return;
    res.setHeader(name, value);
  });
  res.writeHead(upstreamResponse.status);

  if (upstreamResponse.body) {
    for await (const chunk of upstreamResponse.body) {
      res.write(chunk);
    }
  }
  res.end();
}

async function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.includes("\0")) {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  if (pathname === "/") {
    pathname = "/index.html";
  }

  let filePath = path.resolve(distDir, `.${pathname}`);
  if (!filePath.startsWith(distDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = path.resolve(distDir, "index.html");
  }

  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const extension = path.extname(filePath);
  res.setHeader("Content-Type", mimeTypes.get(extension) ?? "application/octet-stream");

  if (pathname.startsWith("/assets/")) {
    res.setHeader("Cache-Control", "public, immutable, max-age=31536000");
  }

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  createReadStream(filePath).pipe(res);
}

async function handleRequest(req, res) {
  try {
    const url = new URL(req.url ?? "/", publicOrigin(req));

    if (req.method === "GET" && url.pathname === "/api/auth/github/start") {
      await handleOAuthStart(req, res, url);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/auth/github/callback") {
      await handleOAuthCallback(req, res, url);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/auth/session") {
      handleSession(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/logout") {
      handleLogout(req, res);
      return;
    }

    if (url.pathname === "/api/github" || url.pathname.startsWith("/api/github/")) {
      await handleGitHubProxy(req, res, url);
      return;
    }

    if (["GET", "HEAD"].includes(req.method ?? "")) {
      await serveStatic(req, res, url);
      return;
    }

    sendJson(res, 405, { error: "method_not_allowed" });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "internal_server_error" });
  }
}

createServer(handleRequest).listen(port, () => {
  console.log(`git-pull-request-dashboard listening on :${port}`);
  readFile(path.resolve(distDir, "index.html")).catch(() => {
    console.warn(`No built SPA found in ${distDir}. Run npm run build first.`);
  });
});

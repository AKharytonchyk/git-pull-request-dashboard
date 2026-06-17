import React from "react";
import "./App.css";
import { GitService } from "./service/gitService";
import {
  AppBar,
  Box,
  CssBaseline,
  ThemeProvider,
  Toolbar,
} from "@mui/material";
import { SettingsDrawer } from "./SettingsDrawer";
import { AuthHeader } from "./components/AuthHeader";
import { UnAuthHeader } from "./components/UnAuthHeader";
import { Outlet, useNavigate } from "react-router";
import { ConfigContext } from "./context/ConfigContext";
import { darkTheme, lightTheme } from "./theme";
import { TokenManager } from "./utils/tokenManager";
import { usePersistentState, validators } from "./hooks/usePersistentState";
import { ToastNotification } from "./components/ToastNotification";
import { ErrorBoundary } from "./components/ErrorBoundary";
import {
  oauthProxyApiUrl,
  providerFromConfiguredEnvironment,
  providerFromHost,
} from "./utils/githubProvider";
import {
  AuthSession,
  AuthenticatedUser,
  OAuthSessionResponse,
} from "./models/Auth";

const patLoginEnabled = import.meta.env.VITE_ENABLE_PAT_LOGIN !== "false";

function App() {
  const [authSessions, setAuthSessions] = React.useState<AuthSession[]>([]);
  const [openSettings, setOpenSettings] = React.useState<boolean>(false);
  const [authLoading, setAuthLoading] = React.useState<boolean>(true);
  
  // Use persistent state hook for better state management
  const [isDarkMode, setIsDarkMode] = usePersistentState('DARK_MODE', {
    defaultValue: false,
    validator: validators.isDarkMode,
    storageType: 'localStorage'
  });

  const [repositorySettings, setRepositorySettings] = usePersistentState('REPOSITORY_CONFIG', {
    defaultValue: {} as Record<string, boolean>,
    validator: validators.repositorySettings,
    storageType: 'localStorage'
  });

  // Toast notification state
  const [toast, setToast] = React.useState<{
    open: boolean;
    message: string;
    severity: 'error' | 'warning' | 'info' | 'success';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const navigate = useNavigate();
  const clients = React.useMemo(
    () =>
      authSessions.map((session) => ({
        account: session,
        client: new GitService(
          session.method === "oauth"
            ? oauthProxyApiUrl(session.provider.host)
            : session.provider.apiUrl,
          session.method === "pat" ? session.token : undefined,
          session.provider.webUrl
        ),
      })),
    [authSessions]
  );
  const octokit = clients[0]?.client ?? null;
  const user = authSessions[0]?.user;
  const provider = authSessions[0]?.provider;

  const showToast = React.useCallback((message: string, severity: 'error' | 'warning' | 'info' | 'success' = 'info') => {
    setToast({ open: true, message, severity });
  }, []);

  const setAuthenticatedSessions = React.useCallback((sessions: AuthSession[]) => {
    const sessionsByHost = new Map<string, AuthSession>();
    sessions.forEach((session) => {
      sessionsByHost.set(session.provider.host, session);
    });
    setAuthSessions(
      Array.from(sessionsByHost.values()).sort((a, b) => {
        if (a.provider.host === "github.com") return -1;
        if (b.provider.host === "github.com") return 1;
        return a.provider.host.localeCompare(b.provider.host);
      })
    );
  }, []);

  const upsertAuthenticatedSession = React.useCallback((session: AuthSession) => {
    setAuthSessions((previous) => {
      const sessionsByHost = new Map(
        previous.map((existing) => [existing.provider.host, existing])
      );
      sessionsByHost.set(session.provider.host, session);
      return Array.from(sessionsByHost.values()).sort((a, b) => {
        if (a.provider.host === "github.com") return -1;
        if (b.provider.host === "github.com") return 1;
        return a.provider.host.localeCompare(b.provider.host);
      });
    });
  }, []);

  const getClientForProvider = React.useCallback(
    (providerHost?: string) => {
      if (!providerHost) return octokit;
      return (
        clients.find((entry) => entry.account.provider.host === providerHost)
          ?.client ?? null
      );
    },
    [clients, octokit]
  );

  const onPatLogin = React.useCallback((token: string, providerHost?: string) => {
    if (!token) {
      showToast("Enter a GitHub token first.", "warning");
      return;
    }

    const provider = providerHost?.trim()
      ? providerFromHost(providerHost)
      : providerFromConfiguredEnvironment();

    const octoKit = new GitService(
      provider.apiUrl,
      token,
      provider.webUrl
    );
      octoKit.testAuthentication().then((user) => {
        if (user.status !== 200) {
          showToast("Invalid token. Please check your GitHub token.", "error");
          return;
        }

        const session: AuthSession = {
          method: "pat",
          token,
          provider,
          user: user.data as AuthenticatedUser,
        };

        upsertAuthenticatedSession(session);
        TokenManager.setSession(session);
        navigate("/");
        showToast(`Successfully logged in to ${provider.host}!`, "success");
      }).catch((error) => {
        console.error("Authentication failed:", error);
        showToast("Authentication failed. Please try again.", "error");
      });
  }, [navigate, showToast, upsertAuthenticatedSession]);

  const onOAuthLogin = React.useCallback((providerHost?: string) => {
    const provider = providerFromHost(providerHost || "github.com");
    const loginUrl = new URL("/api/auth/github/start", window.location.origin);
    loginUrl.searchParams.set("provider", provider.host);
    window.location.assign(loginUrl.toString());
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function hydrateAuth() {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json() as OAuthSessionResponse;
          if (data.authenticated) {
            const sessions =
              data.sessions?.map((session) => ({
                method: "oauth" as const,
                provider: session.provider,
                user: session.user,
              })) ??
              (data.user && data.provider
                ? [
                    {
                      method: "oauth" as const,
                      provider: data.provider,
                      user: data.user,
                    },
                  ]
                : []);

            if (!cancelled) {
              setAuthenticatedSessions(sessions);
              TokenManager.clearToken();
              setAuthLoading(false);
            }
            return;
          }
        }
      } catch {
        // Static/dev deployments may not have the OAuth server enabled.
      }

      const storedSessions = TokenManager.getSessions();
      if (!cancelled && storedSessions.length > 0) {
        setAuthenticatedSessions(storedSessions);
      }

      if (!cancelled) {
        setAuthLoading(false);
      }
    }

    hydrateAuth();

    return () => {
      cancelled = true;
    };
  }, [setAuthenticatedSessions]);

  const logOut = React.useCallback(() => {
    if (authSessions.some((session) => session.method === "oauth")) {
      fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).catch((error) => {
        console.warn("OAuth logout request failed:", error);
      });
    }

    TokenManager.clearToken();
    setAuthSessions([]);
    navigate("/login");
    showToast("Logged out successfully", "info");
  }, [authSessions, navigate, showToast]);

  const switchDarkMode = React.useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, [setIsDarkMode]);

  const handleRepositorySelect = React.useCallback(
    (repository: string, selected: boolean) => {
      setRepositorySettings((prev) => ({ ...prev, [repository]: selected }));
    },
    [setRepositorySettings]
  );

  const saveRawSettings = React.useCallback(
    (settings: Record<string, boolean> | undefined) => {
      if (!settings) return;
      setRepositorySettings(settings);
    },
    [setRepositorySettings]
  );

  return (
    <ErrorBoundary>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <ConfigContext.Provider
          value={{
            octokit,
            clients,
            accounts: authSessions,
            repositorySettings,
            handleRepositorySelect,
            saveRawSettings,
            getClientForProvider,
            user,
            provider,
          }}
        >
          <AppBar
            position="static"
            color="default"
            sx={{ position: "fixed", zIndex: 100 }}
          >
            <Toolbar sx={{ justifyContent: "flex-end" }}>
              {authSessions.length === 0 ? (
                <UnAuthHeader
                  loading={authLoading}
                  onOAuthLogin={onOAuthLogin}
                  onPatLogin={patLoginEnabled ? onPatLogin : undefined}
                />
              ) : (
                <AuthHeader
                  sessions={authSessions}
                  logOut={logOut}
                  setOpenSettings={setOpenSettings}
                  onThemeSwitch={switchDarkMode}
                  darkMode={isDarkMode}
                  onOAuthLogin={onOAuthLogin}
                />
              )}
            </Toolbar>
          </AppBar>
          <Box
            component={"main"}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: "4em",
            }}
          >
            <Box
              padding={2}
              width={"calc(100vw - 2em)"}
              justifyContent={"center"}
            >
              <Outlet />
            </Box>
          </Box>
          {clients.length > 0 && (
            <SettingsDrawer
              opened={openSettings}
              onClose={() => setOpenSettings(false)}
            />
          )}
          <ToastNotification
            open={toast.open}
            message={toast.message}
            severity={toast.severity}
            onClose={() => setToast(prev => ({ ...prev, open: false }))}
          />
        </ConfigContext.Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

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
  const [authSession, setAuthSession] = React.useState<AuthSession>();
  const [octokit, setOctokit] = React.useState<GitService | null>(null);
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
  const user = authSession?.user;

  const showToast = React.useCallback((message: string, severity: 'error' | 'warning' | 'info' | 'success' = 'info') => {
    setToast({ open: true, message, severity });
  }, []);

  const setAuthenticatedSession = React.useCallback((
    session: AuthSession,
    apiUrl = session.provider.apiUrl
  ) => {
    setAuthSession(session);
    setOctokit(new GitService(apiUrl, session.token, session.provider.webUrl));
  }, []);

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
          setAuthSession(undefined);
          return;
        }

        const session: AuthSession = {
          method: "pat",
          token,
          provider,
          user: user.data as AuthenticatedUser,
        };

        setAuthenticatedSession(session);
        TokenManager.setSession(session);
        navigate("/");
        showToast("Successfully logged in!", "success");
      }).catch((error) => {
        console.error("Authentication failed:", error);
        showToast("Authentication failed. Please try again.", "error");
      });
  }, [navigate, setAuthenticatedSession, showToast]);

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
          if (data.authenticated && data.user && data.provider) {
            if (!cancelled) {
              setAuthenticatedSession({
                method: "oauth",
                provider: data.provider,
                user: data.user,
              }, oauthProxyApiUrl());
              TokenManager.clearToken();
              setAuthLoading(false);
            }
            return;
          }
        }
      } catch {
        // Static/dev deployments may not have the OAuth server enabled.
      }

      const storedSession = TokenManager.getSession();
      if (!cancelled && storedSession) {
        setAuthenticatedSession(storedSession);
      }

      if (!cancelled) {
        setAuthLoading(false);
      }
    }

    hydrateAuth();

    return () => {
      cancelled = true;
    };
  }, [setAuthenticatedSession]);

  const logOut = React.useCallback(() => {
    if (authSession?.method === "oauth") {
      fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).catch((error) => {
        console.warn("OAuth logout request failed:", error);
      });
    }

    TokenManager.clearToken();
    setAuthSession(undefined);
    setOctokit(null);
    navigate("/login");
    showToast("Logged out successfully", "info");
  }, [authSession?.method, navigate, showToast]);

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
            repositorySettings,
            handleRepositorySelect,
            saveRawSettings,
            user,
            provider: authSession?.provider,
          }}
        >
          <AppBar
            position="static"
            color="default"
            sx={{ position: "fixed", zIndex: 100 }}
          >
            <Toolbar sx={{ justifyContent: "flex-end" }}>
              {!user?.login ? (
                <UnAuthHeader
                  loading={authLoading}
                  onOAuthLogin={onOAuthLogin}
                  onPatLogin={patLoginEnabled ? onPatLogin : undefined}
                />
              ) : (
                <AuthHeader
                  user={user}
                  provider={authSession?.provider}
                  logOut={logOut}
                  setOpenSettings={setOpenSettings}
                  onThemeSwitch={switchDarkMode}
                  darkMode={isDarkMode}
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
          {octokit && (
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

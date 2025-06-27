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
import { envConfig } from "./utils/environmentConfig";

function App() {
  const [user, setUser] = React.useState<{
    login: string;
    avatar_url: string;
    url: string;
  }>();
  const [token, setToken] = React.useState<string>();
  const [octokit, setOctokit] = React.useState<GitService | null>(null);
  const [openSettings, setOpenSettings] = React.useState<boolean>(false);
  
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

  const showToast = React.useCallback((message: string, severity: 'error' | 'warning' | 'info' | 'success' = 'info') => {
    setToast({ open: true, message, severity });
  }, []);

  const onLogin = React.useCallback(() => {
    if (token) {
      const octoKit = new GitService(
        envConfig.githubApiUrl,
        token
      );
      octoKit.testAuthentication().then((user) => {
        if (user.status !== 200) {
          showToast("Invalid token. Please check your GitHub Personal Access Token.", "error");
          setUser(undefined);
          return;
        }

        setOctokit(octoKit);
        setUser(user.data);
        TokenManager.setToken(token);
        TokenManager.setUserData(user.data);
        navigate("/");
        showToast("Successfully logged in!", "success");
      }).catch((error) => {
        console.error("Authentication failed:", error);
        showToast("Authentication failed. Please try again.", "error");
      });
    }
  }, [token, navigate, showToast]);

  React.useEffect(() => {
    const storedToken = TokenManager.getToken();
    const storedUser = TokenManager.getUserData();
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setOctokit(
        new GitService(
          envConfig.githubApiUrl,
          storedToken
        )
      );
    }
  }, []);

  const logOut = React.useCallback(() => {
    TokenManager.clearToken();
    setUser(undefined);
    setOctokit(null);
    navigate("/login");
    showToast("Logged out successfully", "info");
  }, [navigate, showToast]);

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
          }}
        >
          <AppBar
            position="static"
            color="default"
            sx={{ position: "fixed", zIndex: 100 }}
          >
            <Toolbar sx={{ justifyContent: "flex-end" }}>
              {!user?.login ? (
                <UnAuthHeader setToken={setToken} onLogin={onLogin} />
              ) : (
                <AuthHeader
                  user={user}
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

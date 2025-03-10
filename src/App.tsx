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

function App() {
  const [user, setUser] = React.useState<{
    login: string;
    avatar_url: string;
    url: string;
  }>();
  const [token, setToken] = React.useState<string>();
  const [octokit, setOctokit] = React.useState<GitService | null>(null);
  const [openSettings, setOpenSettings] = React.useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(false);
  const navigate = useNavigate();

  const onLogin = React.useCallback(() => {
    if (token) {
      const octoKit = new GitService(
        (import.meta as any).env.VITE_GITHUB_API_URL ||
          "https://api.github.com",
        token
      );
      octoKit.testAuthentication().then((user) => {
        if (user.status !== 200) {
          alert("Invalid token");

          setUser(undefined);
          return;
        }

        setOctokit(octoKit);
        setUser(user.data);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user.data));
        navigate("/");
      });
    }
  }, [token, navigate]);

  React.useEffect(() => {
    setToken(localStorage.getItem("token") ?? undefined);
    setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    if (localStorage.getItem("token")) {
      setOctokit(
        new GitService(
          (import.meta as any).env.VITE_GITHUB_API_URL ||
            "https://api.github.com",
          localStorage.getItem("token") || ""
        )
      );
    }

    setIsDarkMode(localStorage.getItem("DARK_MODE") === "true");
  }, []);

  const logOut = React.useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(undefined);
    setOctokit(null);
    navigate("/login");
  }, [navigate]);

  const switchDarkMode = React.useCallback(() => {
    setIsDarkMode((prev) => !prev);
    localStorage.setItem("DARK_MODE", (!isDarkMode).toString());
  }, [isDarkMode]);

  const [repositorySettings, setRepositorySettings] = React.useState<
    Record<string, boolean>
  >({});
  const handleRepositorySelect = React.useCallback(
    (repository: string, selected: boolean) => {
      setRepositorySettings((prev) => {
        const newState = { ...prev, [repository]: selected };
        localStorage.setItem("REPOSITORY_CONFIG", JSON.stringify(newState));

        return newState;
      });
    },
    []
  );

  const saveRawSettings = React.useCallback(
    (settings: Record<string, boolean> | undefined) => {
      if (!settings) return;

      setRepositorySettings(settings);
      localStorage.setItem("REPOSITORY_CONFIG", JSON.stringify(settings));
    },
    []
  );

  React.useEffect(() => {
    const repositoryConfig = JSON.parse(
      localStorage.getItem("REPOSITORY_CONFIG") ?? "{}"
    );
    setRepositorySettings(repositoryConfig);
  }, []);

  return (
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
      </ConfigContext.Provider>
    </ThemeProvider>
  );
}

export default App;

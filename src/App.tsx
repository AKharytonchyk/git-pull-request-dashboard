import React from "react";
import "./App.css";
import { GitService } from "./service/gitService";
import { AppBar, Box, Toolbar } from "@mui/material";
import { SettingsDrawer } from "./SettingsDrawer";
import { Dashboard } from "./components/Dashboard";
import { AuthHeader } from "./components/AuthHeader";
import { UnAuthHeader } from "./components/UnAuthHeader";
import LandingPage from "./components/LandingPage";

export const ConfigContext = React.createContext<{
  octokit: GitService | null;
  repositorySettings: Record<string, boolean>;
  handleRepositorySelect: (repository: string, selected: boolean) => void;
}>({ octokit: null, repositorySettings: {}, handleRepositorySelect: () => {} });

function App() {
  const [user, setUser] = React.useState<{
    login: string;
    avatar_url: string;
    url: string;
  }>();
  const [token, setToken] = React.useState<string>();
  const [octokit, setOctokit] = React.useState<GitService | null>(null);
  const [openSettings, setOpenSettings] = React.useState<boolean>(false);

  const onLogin = React.useCallback(() => {
    if (token) {
      const octoKit = new GitService(
        process.env.REACT_APP_GITHUB_API_URL || "https://ghe.coxautoinc.com/api/v3",
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
      });
    }
  }, [token]);

  React.useEffect(() => {
    setToken(localStorage.getItem("token") ?? undefined);
    setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    if (localStorage.getItem("token")) {
      setOctokit(
        new GitService(
          "https://ghe.coxautoinc.com/api/v3",
          localStorage.getItem("token") || ""
        )
      );
    }
  }, []);

  const logOut = React.useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(undefined);
    setOctokit(null);
  }, []);

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

  React.useEffect(() => {
    const repositoryConfig = JSON.parse(
      localStorage.getItem("REPOSITORY_CONFIG") ?? "{}"
    );
    setRepositorySettings(repositoryConfig);
  }, []);

  return (
    <>
      <ConfigContext.Provider
        value={{ octokit, repositorySettings, handleRepositorySelect }}
      >
        <AppBar position="static" color="default" sx={{ position: "fixed" }}>
          <Toolbar sx={{ justifyContent: "flex-end" }}>
            {!user?.login ? (
              <UnAuthHeader setToken={setToken} onLogin={onLogin} />
            ) : (
              <AuthHeader
                user={user}
                logOut={logOut}
                setOpenSettings={setOpenSettings}
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
          {octokit && <Dashboard />}
          {(!octokit) && <LandingPage />}
          <Box
            component={"section"}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          ></Box>
        </Box>
        {octokit && (
          <SettingsDrawer
            opened={openSettings}
            onClose={() => setOpenSettings(false)}
          />
        )}
      </ConfigContext.Provider>
    </>
  );
}

export default App;

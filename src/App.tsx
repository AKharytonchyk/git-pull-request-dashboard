import React from "react";
import "./App.css";
import { GitService } from "./service/gitService";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  TextField,
  Toolbar,
} from "@mui/material";
import { AccountCircle, Settings } from "@mui/icons-material";
import { Organization } from "./models/Organization";
import { SettingsDrawer } from "./SettingsDrawer";

function App() {
  const [user, setUser] = React.useState<{
    login: string;
    avatar_url: string;
    url: string;
  }>();
  const [token, setToken] = React.useState<string>();
  const [octokit, setOctokit] = React.useState<GitService | null>(null);
  const [orgs, setOrgs] = React.useState<Organization[]>([]);
  const [openSettings, setOpenSettings] = React.useState<boolean>(false);

  const onLogin = React.useCallback(() => {
    if (token) {
      const octoKit = new GitService(
        "https://ghe.coxautoinc.com/api/v3",
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

  const getPulls = React.useCallback(() => {
    if (octokit) {
      octokit.getPulls("coxautoinc", "test").then((pulls) => {
        console.log(pulls);
      });
    }
  }, [octokit]);

  const logOut = React.useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(undefined);
    setOctokit(null);
  }, []);

  const UnAuthHeader = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 2,
        alignItems: "flex-end",
        justifyContent: "end",
      }}
    >
      <AccountCircle sx={{ mr: 2 }} />
      <TextField
        size="small"
        sx={{ width: "400px" }}
        label="Token"
        variant="standard"
        onChange={(e) => setToken(e.target.value)}
      />
      <Button variant="text" color="inherit" onClick={() => onLogin()}>
        Log In
      </Button>
    </Box>
  );

  const AuthHeader = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 2,
        alignItems: "center",
        justifyContent: "end",
      }}
    >
      <Avatar alt={user?.login} src={user?.avatar_url} sx={{ mr: 2 }} />
      <Chip
        label={user?.login}
        onClick={() => window.open(user?.url, "_blank")}
      />
      <Button
        variant="text"
        color="inherit"
        onClick={() => setOpenSettings(true)}
      >
        <Settings />
      </Button>
      <Button variant="text" color="inherit" onClick={() => logOut()}>
        Log Out
      </Button>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar sx={{ justifyContent: "flex-end" }}>
          {!user?.login ? <UnAuthHeader /> : <AuthHeader />}
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
        }}
      >
        <Box
          component={"section"}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1>DEBUG</h1>
        </Box>
        <Box
          component={"section"}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        ></Box>
      </Box>
      {octokit && <SettingsDrawer
        opened={openSettings}
        octokit={octokit}
        onClose={() => setOpenSettings(false)}
      />}
    </>
  );
}

export default App;

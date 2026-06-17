import {
  AddCircle,
  Biotech,
  Business,
  Dashboard,
  GitHub,
  Login,
  Settings,
} from "@mui/icons-material";
import {
  Box,
  Avatar,
  Chip,
  Button,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import React from "react";
import { useLocation, useNavigate } from "react-router";
import { PullRequestIcon } from "./icons/PullRequestIcon";
import { RepositoryIcon } from "./icons/RepositoryIcon";
import { IssuesIcon } from "./icons/IssuesIcon";
import { ThemeSwitch } from "./ThemeSwitch";
import { AuthSession } from "../models/Auth";
import { APP_VERSION } from "../version";

export type AuthHeaderProps = {
  sessions: AuthSession[];
  logOut: () => void;
  setOpenSettings: (value: boolean) => void;
  onThemeSwitch: () => void;
  darkMode: boolean;
  onOAuthLogin: (providerHost?: string) => void;
};

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  sessions,
  logOut,
  setOpenSettings,
  onThemeSwitch,
  darkMode,
  onOAuthLogin,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [checked, setChecked] = React.useState(darkMode);
  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);
  const [enterpriseHost, setEnterpriseHost] = React.useState("");

  const handleThemeSwitch = () => {
    setChecked(!checked);
    onThemeSwitch();
  };

  const closeMenu = () => setMenuAnchor(null);

  const handleOAuthLogin = (providerHost: string) => {
    closeMenu();
    onOAuthLogin(providerHost);
  };

  const hasGithubSession = sessions.some(
    (session) => session.provider.host === "github.com"
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100vw",
      }}
    >
      <BottomNavigation
        showLabels
        value={location.pathname}
        onChange={(_event, newValue) => navigate(newValue)}
      >
        <BottomNavigationAction
          label="Dashboard"
          icon={<Dashboard />}
          value="/"
          title="Dashboard"
        />
        <BottomNavigationAction
          label="My PRs"
          icon={<PullRequestIcon />}
          value="/my-pull-requests"
          title="My PRs"
        />

        <BottomNavigationAction
          label="Repositories"
          icon={<RepositoryIcon />}
          value="/repositories"
          title="Repositories"
        />
        <BottomNavigationAction
          label="Issues"
          icon={<IssuesIcon />}
          value="/issues"
          title="Issues"
        />
        <BottomNavigationAction
          label="Coverage"
          icon={<Biotech />}
          value="/coverage"
          title="Coverage"
        />
      </BottomNavigation>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          alignItems: "center",
          justifyContent: "end",
        }}
      >
        <ThemeSwitch checked={checked} onChange={handleThemeSwitch} />
        <Chip label={APP_VERSION} size="small" variant="outlined" />
        {sessions.map((session) => (
          <Chip
            key={session.provider.host}
            avatar={
              <Avatar
                alt={session.user.login}
                src={session.user.avatar_url}
              />
            }
            label={`${session.user.login} @ ${session.provider.host}`}
            variant="outlined"
            size="small"
            onClick={() =>
              window.open(
                session.user.html_url ?? session.user.url,
                "_blank"
              )
            }
          />
        ))}
        <Tooltip title="Add account">
          <IconButton
            color="inherit"
            size="small"
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <AddCircle />
          </IconButton>
        </Tooltip>
        <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
          <MenuItem
            disabled={hasGithubSession}
            onClick={() => handleOAuthLogin("github.com")}
          >
            <GitHub fontSize="small" />
            <Box component="span" sx={{ ml: 1 }}>
              GitHub.com
            </Box>
          </MenuItem>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              px: 2,
              py: 1,
              width: 320,
            }}
          >
            <Business fontSize="small" />
            <TextField
              size="small"
              variant="standard"
              label="Enterprise host"
              placeholder="your-tenant.ghe.com"
              value={enterpriseHost}
              onChange={(event) => setEnterpriseHost(event.target.value)}
              sx={{ flex: 1 }}
            />
            <Tooltip title="Log in">
              <span>
                <IconButton
                  size="small"
                  disabled={!enterpriseHost.trim()}
                  onClick={() => handleOAuthLogin(enterpriseHost)}
                >
                  <Login fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Menu>
        <Button
          variant="text"
          color="inherit"
          size="small"
          onClick={() => setOpenSettings(true)}
        >
          <Tooltip title="Settings">
            <Settings />
          </Tooltip>
        </Button>
        <Button variant="text" color="inherit" onClick={() => logOut()}>
          Log Out
        </Button>
      </Box>
    </Box>
  );
};

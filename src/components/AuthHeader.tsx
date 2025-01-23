import { Biotech, Dashboard, Settings } from "@mui/icons-material";
import { Box, Avatar, Chip, Button, Tooltip } from "@mui/material";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import React from "react";
import { useLocation, useNavigate } from "react-router";
import { PullRequestIcon } from "./icons/PullRequestIcon";
import { RepositoryIcon } from "./icons/RepositoryIcon";
import { IssuesIcon } from "./icons/IssuesIcon";
import { ThemeSwitch } from "./ThemeSwitch";

export type AuthHeaderProps = {
  user: {
    login: string;
    avatar_url: string;
    url: string;
  };
  logOut: () => void;
  setOpenSettings: (value: boolean) => void;
  onThemeSwitch: () => void;
  darkMode: boolean;
};

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  user,
  logOut,
  setOpenSettings,
  onThemeSwitch,
  darkMode,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [checked, setChecked] = React.useState(darkMode);

  const handleThemeSwitch = () => {
    setChecked(!checked);
    onThemeSwitch();
  };

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
        <Avatar alt={user?.login} src={user?.avatar_url} sx={{ mr: 2 }} />
        <Chip
          label={user?.login}
          onClick={() => window.open(user?.url, "_blank")}
        />
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

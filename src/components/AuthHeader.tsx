import { Biotech, Dashboard, Settings } from "@mui/icons-material";
import { Box, Avatar, Chip, Button, Tooltip } from "@mui/material";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type AuthHeaderProps = {
  user: {
    login: string;
    avatar_url: string;
    url: string;
  };
  logOut: () => void;
  setOpenSettings: (value: boolean) => void;
};

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  user,
  logOut,
  setOpenSettings,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100vw"}}>
      <BottomNavigation
        showLabels
        value={location.pathname}
        onChange={(_event, newValue) => navigate(newValue)}>
        <BottomNavigationAction label="Dashboard" icon={<Dashboard />} sx={{ backgroundColor: "#f5f5f5"}} value="/" title="Dashboard"/>
        <BottomNavigationAction label="Coverage" icon={<Biotech />} sx={{ backgroundColor: "#f5f5f5"}} value="/coverage" title="Coverage"/>
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

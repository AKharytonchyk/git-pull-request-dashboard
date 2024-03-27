import { Help, Settings } from "@mui/icons-material";
import { Box, Avatar, Chip, Button } from "@mui/material";

export type AuthHeaderProps = {
  user: {
    login: string;
    avatar_url: string;
    url: string;
  };
  logOut: () => void;
  setOpenSettings: (value: boolean) => void;
};

export const AuthHeader: React.FC<AuthHeaderProps> = ({user, logOut, setOpenSettings}) => {
  return (
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
        <Settings />
      </Button>
      <Button
        variant="text"
        color="inherit"
        size="small"
        >
          <Help />
      </Button>
      <Button variant="text" color="inherit" onClick={() => logOut()}>
        Log Out
      </Button>
    </Box>
  )};
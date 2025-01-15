import { AccountCircle } from "@mui/icons-material";
import { Box, TextField, Button } from "@mui/material";

export type UnAuthHeaderProps = {
  setToken: (token: string) => void;
  onLogin: () => void;
};

export const UnAuthHeader: React.FC<UnAuthHeaderProps> = ({
  setToken,
  onLogin,
}) => {
  return (
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
};

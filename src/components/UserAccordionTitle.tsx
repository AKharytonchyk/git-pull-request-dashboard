import React from "react";
import { Box, Avatar } from "@mui/material";
import { AuthSession } from "../models/Auth";

export const UserTitle: React.FC<{ account: AuthSession }> = ({ account }) => {
  const { user, provider } = account;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar alt={user?.login} src={user?.avatar_url} sx={{ mr: 2 }} />
      <div>{user?.login} @ {provider.host}</div>
    </Box>
  );
};

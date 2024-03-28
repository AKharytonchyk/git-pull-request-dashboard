import React from "react";
import { User } from "../models/User";
import { ConfigContext } from "../App";
import { Box, Avatar } from "@mui/material";


export const UserTitle: React.FC = () => {
  const [user, setUser] = React.useState<User>();
  const { octokit } = React.useContext(ConfigContext);
  
  React.useEffect(() => {
    if (!octokit) return;
    octokit.testAuthentication().then((response) => setUser(response.data));
  }, [octokit]);

  return user ? (<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <Avatar alt={user?.login} src={user?.avatar_url} sx={{ mr: 2 }} />
    <div>{user?.login}</div>
  </Box>) : <></>;
};
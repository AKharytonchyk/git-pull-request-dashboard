import React from "react";
import { User } from "../models/User";
import { ConfigContext } from "../App";
import { Box, Avatar } from "@mui/material";
import { useQuery } from "@tanstack/react-query";


export const UserTitle: React.FC = () => {
  const { octokit } = React.useContext(ConfigContext);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      if (!octokit) return;
      const response = await octokit.testAuthentication();
      return response.data as User;
    },
    enabled: !!octokit,
  });

  return user ? (<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <Avatar alt={user?.login} src={user?.avatar_url} sx={{ mr: 2 }} />
    <div>{user?.login}</div>
  </Box>) : <></>;
};

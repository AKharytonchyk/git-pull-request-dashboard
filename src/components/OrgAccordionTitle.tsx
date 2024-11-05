import { Box, Avatar } from "@mui/material";
import { Organization } from "../models/Organization";

export const OrgTitle: React.FC<{org?: Organization}> = ({org}) => {
  return org ? (<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <Avatar alt={org?.login} src={org?.avatar_url} sx={{ mr: 2 }} />
    <div>{org?.login}</div>
  </Box>) : <></>;
};

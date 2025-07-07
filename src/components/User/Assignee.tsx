import { Avatar, Tooltip } from "@mui/material";
import { User } from "../../models/User";
import { useAvatarWithFallback } from "../../utils/avatarFallback";

export type AssigneeProps = {
  assignee: User;
};

export const Assignee: React.FC<AssigneeProps> = ({ assignee }) => {
  const avatarProps = useAvatarWithFallback(assignee.avatar_url, assignee.login);
  
  return (
    <Tooltip title={assignee.login}>
      <Avatar
        alt={assignee.login}
        {...avatarProps}
        sx={{ width: 30, height: 30 }}
      />
    </Tooltip>
  );
};

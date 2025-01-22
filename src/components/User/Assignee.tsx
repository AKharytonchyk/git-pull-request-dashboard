import { Avatar, Tooltip } from "@mui/material";
import { User } from "../../models/User";

export type AssigneeProps = {
  assignee: User;
};

export const Assignee: React.FC<AssigneeProps> = ({ assignee }) => {
  return (
    <Tooltip title={assignee.login}>
      <Avatar
        alt={assignee.login}
        src={assignee.avatar_url}
        sx={{ width: 30, height: 30 }}
      />
    </Tooltip>
  );
};

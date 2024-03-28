import React from "react";
import { ConfigContext } from "../App";
import { Approvals } from "../models/Approvals";
import { Avatar, Badge, Box } from '@mui/material';

export type PullRequestsApprovalsProps = {
  owner: string;
  repo: string;
  prNumber: number;
}

export const PullRequestsApprovals: React.FC<PullRequestsApprovalsProps> = ({
  owner,
  repo,
  prNumber,
}) => {
  const { octokit } = React.useContext(ConfigContext);
  const [ approvals, setApprovals] = React.useState<Approvals[]>([]);

  React.useEffect(() => {
    if (!octokit) return;
    octokit
      .getPRApprovals(owner, repo, prNumber)
      .then((response) => setApprovals(response as Approvals[]));

    return () => {
      setApprovals([]);
    };
  }, [octokit, owner, repo, prNumber]);

  const getBadgeProps = (state: string):  {badgeContent: string, color: "success" | "error" | "warning" | "info"}  => {
    switch (state) {
      case "APPROVED":
        return {color: "success", badgeContent: "✔"};
      case "CHANGES_REQUESTED":
        return {color: "error", badgeContent: "✘"};
      case "COMMENTED":
        return {color: "warning", badgeContent: "✎"};
      default:
        return {color: "info", badgeContent: "⚪"};
    }
  }
    

  const allApprovals = React.useMemo(() => approvals?.filter((approval) => approval.state !== "DISMISSED"), [approvals]);

  const approvalAvatars = React.useMemo(() => allApprovals?.map((approval) => (
    <Badge key={approval.user.login} {...getBadgeProps(approval.state)} sx={{ height: "1em", display: "flex", alignItems: "center" }}>
      <Avatar key={approval.user.login} alt={approval.user.login} src={approval.user.avatar_url} sx={{height: "1.5em", width: "1.5em"}} />
    </Badge>
    )), [allApprovals]);

  return <>
    <Box color="text.secondary" sx={{display: "flex", gap: 1, alignItems: "center", marginRight: "auto" }}>
      Approvals: <Box sx={{ display: "flex", alignItems: "center" }}> {approvals.length ? approvalAvatars : "No reviews"} </Box>
    </Box>
  </>;
}
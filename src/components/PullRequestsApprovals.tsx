import React from "react";
import { ConfigContext } from "../App";
import { Approvals } from "../models/Approvals";
import { Avatar, Badge, Box, CircularProgress, Tooltip } from '@mui/material';
import { useOnScreen } from "../hooks/useOnScreen";
import { useQuery } from "@tanstack/react-query";

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
  const elementRef = React.useRef<HTMLDivElement>(null);
  const isIntersecting = useOnScreen(elementRef, "100px", true);

  const {isLoading, data: approvals = []} = useQuery({
    queryKey: ["approvals", owner, repo, prNumber],
    queryFn: async () => {
      if (!octokit || !isIntersecting) return;
      const response = await octokit.getPRApprovals(owner, repo, prNumber);
      return response as Approvals[];
    },
    enabled: !!octokit && isIntersecting,
  });

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
    <Tooltip key={approval.user.login} title={approval.state}>
      <Badge {...getBadgeProps(approval.state)} sx={{ height: "1em", display: "flex", alignItems: "center" }}>
        <Avatar alt={approval.user.login} src={approval.user.avatar_url} sx={{height: "1.5em", width: "1.5em"}} />
      </Badge>
    </Tooltip>
    )), [allApprovals]);

  return <>
    <Box ref={elementRef} color="text.secondary" sx={{display: "flex", gap: 1, alignItems: "center", marginRight: "auto" }}>
      Approvals: 
      {
        isLoading ? 
          <CircularProgress size={24} /> : 
          <Box sx={{ display: "flex", alignItems: "center" }}> {approvals.length ? approvalAvatars : "No reviews"} </Box>
      }  
    </Box>
  </>;
}

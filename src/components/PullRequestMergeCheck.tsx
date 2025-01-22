import React from "react";
import { useOnScreen } from "../hooks/useOnScreen";
import { ConfigContext } from "../context/ConfigContext";
import { CircularProgress, Tooltip, Typography } from "@mui/material";
import { Block, CallMerge } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";

export type PullRequestMergeCheckProps = {
  owner: string;
  repo: string;
  prNumber: number;
};

export const PullRequestMergeCheck: React.FC<PullRequestMergeCheckProps> = ({
  owner,
  repo,
  prNumber,
}) => {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const isIntersecting = useOnScreen(elementRef, "100px", true);
  const { octokit } = React.useContext(ConfigContext);

  const {
    isLoading,
    data: canBeMerged = { mergeable: false, mergeableState: "" },
  } = useQuery({
    queryKey: ["hasMergeConflict", owner, repo, prNumber],
    queryFn: async () => {
      if (!octokit || !isIntersecting) return;
      const pr = await octokit.hasMergeConflict(owner, repo, prNumber);

      return { mergeable: pr.mergeable, mergeableState: pr.mergeable_state };
    },
    enabled: !!octokit && isIntersecting,
  });

  return (
    <Typography
      ref={elementRef}
      color="text.secondary"
      sx={{ display: "flex", gap: 1, alignItems: "center" }}
    >
      Mergeable:
      {isLoading ? (
        <CircularProgress size={24} />
      ) : (
        <Tooltip
          title={
            canBeMerged.mergeableState === "clean"
              ? "Can be merged"
              : "Merging blocked"
          }
        >
          {canBeMerged.mergeableState === "" ? (
            <></>
          ) : canBeMerged.mergeable &&
            canBeMerged.mergeableState === "clean" ? (
            <CallMerge color="success" />
          ) : (
            <Block color="error" />
          )}
        </Tooltip>
      )}
    </Typography>
  );
};

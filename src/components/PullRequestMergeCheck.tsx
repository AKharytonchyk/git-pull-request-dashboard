import React from "react";
import { useOnScreen } from "../hooks/useOnScreen";
import { ConfigContext } from "../App";
import { Tooltip, Typography } from "@mui/material";
import { Block, CallMerge } from "@mui/icons-material";

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
  const [canBeMerged, setCanBeMerged] = React.useState<{
    mergeable: boolean;
    mergeableState: string;
  }>({ mergeable: false, mergeableState: "" });
  const { octokit } = React.useContext(ConfigContext);

  React.useEffect(() => {
    if (octokit && isIntersecting) {
      octokit?.hasMergeConflict(owner, repo, prNumber).then((response) => {
        setCanBeMerged({
          mergeable: response.mergeable ?? false,
          mergeableState: response.mergeable_state,
        });
      });
    }
  }, [isIntersecting, octokit, owner, repo, prNumber]);

  return (
    <Typography
      ref={elementRef}
      color="text.secondary"
      sx={{ display: "flex", gap: 1, alignItems: "center" }}
    >
      Mergeable:
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
    </Typography>
  );
};

import React from "react";
import { ConfigContext } from "../App";
import { CheckRun } from "../models/CheckRun";
import { Box, Dialog, Link, Tooltip, Typography } from "@mui/material";
import { CheckCircle, Error, ErrorOutline } from "@mui/icons-material";
import { useOnScreen } from "../hooks/useOnScreen";

export type PullRequestChecksProps = {
  owner: string;
  repo: string;
  prNumber: number;
};

export const PullRequestChecks: React.FC<PullRequestChecksProps> = ({
  owner,
  repo,
  prNumber,
}) => {
  const { octokit } = React.useContext(ConfigContext);
  const [checks, setChecks] = React.useState<CheckRun[]>();
  const [open, setOpen] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);
  const isIntersecting = useOnScreen(elementRef, "100px", true);

  React.useEffect(() => {
    if (!octokit || !isIntersecting) return;    
    octokit
      .getPRChecksStatus(owner, repo, prNumber)
      .then((response) => setChecks(response.data.check_runs));

    return () => {
      setChecks(undefined);
    };
  }, [octokit, owner, repo, prNumber, isIntersecting]);

  const allChecksPassed = React.useMemo(
    () => checks?.every((check) => check.conclusion === "success"),
    [checks]
  );

  return (
    <>
      <Typography
        ref={elementRef}
        color="text.secondary"
        onClick={() => !allChecksPassed && setOpen(true)}
        sx={{ display: "flex", gap: 1, alignItems: "center", cursor: allChecksPassed ? "default" : "pointer" }}
      >
        Checks:{" "}
        {allChecksPassed ? (
          <Tooltip title="All checks passed"><CheckCircle color="success" sx={{display: "flex", alignItems: "center"}} /></Tooltip>
        ) : (
          <Tooltip title="Something went wrong. Click for details"><Error color="error" /></Tooltip>
        )}
      </Typography>
      <Dialog open={open} onClose={() => setOpen(false)} sx={{ padding: "2em" }}>
        <Box padding={"2em"}>
        <Typography variant="h5">Checks</Typography>
        <ul>
          {checks?.map((check) => (
            <li key={check.id}>
              <Box sx={{display: "flex", gap: 1, alignItems: "center" }}>
                <Typography component="span">
                  {check.name}
                </Typography>{" "}
                {check.conclusion === "success" ? (
                  <CheckCircle color="success" />
                ) : (
                  <ErrorOutline color="error" />
                )}
                {
                  check.details_url && (
                    <Link href={check.details_url} target="_blank" rel="noopener">
                      Details
                    </Link>
                  )
                }
              </Box>
            </li>
          ))}
        </ul>
        </Box>
      </Dialog>
    </>
  );
};

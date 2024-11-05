import React from "react";
import { ConfigContext } from "../App";
import { CheckRun } from "../models/CheckRun";
import {
  Box,
  CircularProgress,
  Dialog,
  Link,
  Tooltip,
  Typography,
} from "@mui/material";
import { CheckCircle, Error, ErrorOutline } from "@mui/icons-material";
import { useOnScreen } from "../hooks/useOnScreen";
import { useQuery } from "@tanstack/react-query";

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
  const [open, setOpen] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);
  const isIntersecting = useOnScreen(elementRef, "100px", true);

  const { isLoading, data: checks = [] } = useQuery({
    queryKey: ["checks", owner, repo, prNumber],
    queryFn: async () => {
      if (!octokit || !isIntersecting) return;
      const response = await octokit.getPRChecksStatus(owner, repo, prNumber);
      return response.data.check_runs as CheckRun[];
    },
    enabled: !!octokit && isIntersecting,
  });

  const allChecksPassed = React.useMemo(
    () => checks.every((check) => check.conclusion === "success" || check.conclusion === "skipped"),
    [checks]
  );

  return (
    <>
      <Typography
        ref={elementRef}
        color="text.secondary"
        onClick={() => !allChecksPassed && setOpen(true)}
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          cursor: allChecksPassed ? "default" : "pointer",
        }}
      >
        Checks:{" "}
        {isLoading ? (
          <CircularProgress size={24} />
        ) : allChecksPassed ? (
          <Tooltip title="All checks passed">
            <CheckCircle
              color="success"
              sx={{ display: "flex", alignItems: "center" }}
            />
          </Tooltip>
        ) : (
          <Tooltip title="Something went wrong. Click for details">
            <Error color="error" />
          </Tooltip>
        )}
      </Typography>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        sx={{ padding: "2em" }}
      >
        <Box padding={"2em"}>
          <Typography variant="h5">Checks</Typography>
          <ul>
            {checks?.map((check) => (
              <li key={check.id}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography component="span">{check.name}</Typography>{" "}
                  {check.conclusion === "success" ? (
                    <CheckCircle color="success" />
                  ) : (
                    <ErrorOutline color="error" />
                  )}
                  {check.details_url && (
                    <Link
                      href={check.details_url}
                      target="_blank"
                      rel="noopener"
                    >
                      Details
                    </Link>
                  )}
                </Box>
              </li>
            ))}
          </ul>
        </Box>
      </Dialog>
    </>
  );
};

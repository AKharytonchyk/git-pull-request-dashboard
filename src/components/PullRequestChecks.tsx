import React from "react";
import { ConfigContext } from "../App";
import { CheckRun } from "../models/CheckRun";
import { Box, Dialog, Link, Modal, Typography } from "@mui/material";
import { CheckCircle, Error, ErrorOutline } from "@mui/icons-material";

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

  React.useEffect(() => {
    if (!octokit) return;
    octokit
      .getPRChecksStatus(owner, repo, prNumber)
      .then((response) => setChecks(response.data.check_runs));

    return () => {
      setChecks(undefined);
    };
  }, [octokit, owner, repo, prNumber]);

  const allChecksPassed = React.useMemo(
    () => checks?.every((check) => check.conclusion === "success"),
    [checks]
  );

  return (
    <>
      <Typography
        color="text.secondary"
        onClick={() => !allChecksPassed && setOpen(true)}
        sx={{ display: "flex", gap: 1, alignItems: "center", cursor: allChecksPassed ? "default" : "pointer" }}
      >
        Checks:{" "}
        {allChecksPassed ? (
          <CheckCircle color="success" sx={{display: "flex", alignItems: "center"}} />
        ) : (
          <Error color="error" />
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

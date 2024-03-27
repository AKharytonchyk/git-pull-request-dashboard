import React from "react";
import { ConfigContext } from "../App";
import { PullRequest } from "../models/PullRequest";
import PullRequestCard from "./PullRequestCard";
import { Box } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";

export type DashboardProps = {};

export const Dashboard: React.FC<DashboardProps> = () => {
  const { octokit, repositorySettings } = React.useContext(ConfigContext);
  const [pulls, setPulls] = React.useState<PullRequest[]>([]);
  const activeRepositories = React.useMemo(
    () =>
      Object.keys(repositorySettings).filter((key) => repositorySettings[key]),
    [repositorySettings]
  );

  React.useEffect(() => {
    console.warn("Fetching pull requests", activeRepositories);

    if (octokit && activeRepositories.length) {
      const getPulls = async () => {
        const pulls = await Promise.all(
          activeRepositories.map((repo) => octokit.getPullRequests(repo))
        );
        setPulls(pulls.flat() as any[]);
      };

      getPulls();
    }
  }, [octokit, activeRepositories]);

  return (
    // <Box
    //   component={"section"}
    //   sx={{
    //     display: "flex",
    //     flexDirection: "row",
    //     alignItems: "stretch",
    //     gap: 2,
    //     padding: 2,
    //     flexWrap: "wrap",
    //   }}
    // >
    //   {pulls.map((pull) => (
    //     <PullRequestCard key={pull.id} pr={pull} />
    //   ))}
    // </Box>
    <Grid2 container spacing={2} padding={2}>
      {pulls.map((pull) => (
        <Grid2 key={pull.id} xl={6} xs={12}>
          <PullRequestCard pr={pull} />
        </Grid2>
      ))}
    </Grid2>
  );
};

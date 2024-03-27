import React from "react";
import { ConfigContext } from "../App";
import { PullRequest } from "../models/PullRequest";
import PullRequestCard from "./PullRequestCard";
import { Box, Input } from "@mui/material";
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
    if (octokit && activeRepositories.length) {
      const getPulls = async () => {
        const pulls = await Promise.all(
          activeRepositories.flatMap((repo) => octokit.getPullRequests(repo))
        );

        setPulls(pulls.flat().sort((a, b) => a.base.repo.full_name.localeCompare(b.base.repo.full_name)) as any[]);
      };

      getPulls();
    }
  }, [octokit, activeRepositories]);

  const [filter, setFilter] = React.useState<string>("");
  const onFilterChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setFilter(event.target.value),
    []
  );

  return (
    <Box padding={2} width={"calc(100vw - 2em)"}>
      <Input placeholder="Filter" onChange={onFilterChange} sx={{ marginLeft: 'auto' }} />
      <Grid2 container spacing={2}>
        {pulls.filter(pull => pull.user.login.includes(filter) || pull.head.repo.full_name.includes(filter)).map((pull) => (
          <Grid2 key={pull.id} xl={6} xs={12}>
            <PullRequestCard pr={pull} />
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
};

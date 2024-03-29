import React from "react";
import { ConfigContext } from "../App";
import { PullRequest } from "../models/PullRequest";
import PullRequestCard from "./PullRequestCard";
import { Box } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import LandingPage from "../pages/LandingPage";
import { MultiselectFilter } from "./MultiselectFilter";
import { InputFilter } from "./InputFilter";
import { useQuery } from "@tanstack/react-query";
import { PRLoadingPage } from "../pages/PRLoadingPage";

export type DashboardProps = {};

export const Dashboard: React.FC<DashboardProps> = () => {
  const { octokit, repositorySettings } = React.useContext(ConfigContext);
  const activeRepositories = React.useMemo(
    () =>
      Object.keys(repositorySettings)
        .filter((key) => repositorySettings[key])
        .sort(),
    [repositorySettings]
  );

  const { data = [], isLoading } = useQuery({
    queryKey: ["pulls"],
    queryFn: async () => {
      if (octokit && activeRepositories.length) {
        const pulls = await Promise.all(
          activeRepositories.map((repo) => octokit.getPullRequests(repo))
        );

        return pulls.flat()
      }
    },
    enabled: octokit !== undefined && activeRepositories.length > 0,
  });

  const [filter, setFilter] = React.useState<string>("");
  const [includeLabels, setIncludeLabels] = React.useState<string[]>([]);
  const [excludeLabels, setExcludeLabels] = React.useState<string[]>([]);
  const labels: string[] = React.useMemo(
    () =>
      Array.from(
        new Set(
          data
            .filter((pull) => pull !== undefined)
            .map((pull) => pull!.labels.map(({ name }) => name))
            .flat()
        )
      ),
    [data]
  );

  const filteredPulls = React.useMemo(() => {
    return data.filter((pull) => {
      if (!pull) return false;
      if (
        includeLabels.length > 0 &&
        !pull.labels.some(({ name }) => includeLabels.includes(name))
      )
        return false;
      if (
        excludeLabels.length > 0 &&
        pull.labels.some(({ name }) => excludeLabels.includes(name))
      )
        return false;
      if (
        filter.length > 0 &&
        !pull.user?.login
          .toLocaleLowerCase()
          .includes(filter.toLocaleLowerCase()) &&
        !pull.head.repo.full_name
          .toLocaleLowerCase()
          .includes(filter.toLocaleLowerCase())
      )
        return false;

      return true;
    });
  }, [data, filter, includeLabels, excludeLabels]);

  return (
    <Box padding={2} width={"calc(100vw - 2em)"}>
      {isLoading && <PRLoadingPage />}
      {!isLoading && data.length === 0 && <LandingPage />}
            {data.length > 0 && (
        <>
          <Box>
            <InputFilter name="Filter" onChange={setFilter} size="small" />
            <MultiselectFilter
              options={labels.filter((label) => !excludeLabels.includes(label))}
              name="Include labels"
              onChange={setIncludeLabels}
            />
            <MultiselectFilter
              options={labels.filter((label) => !includeLabels.includes(label))}
              name="Exclude labels"
              onChange={setExcludeLabels}
            />
          </Box>
          <Grid2 container spacing={2}>
            {filteredPulls.map(
              (pull) =>
                pull && (
                  <Grid2 key={pull.id} xl={6} xs={12}>
                    <PullRequestCard pr={pull as unknown as PullRequest} />
                  </Grid2>
                )
            )}
          </Grid2>
        </>
      )}
    </Box>
  );
};

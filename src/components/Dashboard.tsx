import React from "react";
import { ConfigContext } from "../App";
import { PullRequest } from "../models/PullRequest";
import PullRequestCard from "./PullRequestCard";
import { Box } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import LandingPage from "./LandingPage";
import { MultiselectFilter } from "./MultiselectFilter";
import { InputFilter } from "./InputFilter";

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

        setPulls(
          pulls
            .flat()
            .sort((a, b) =>
              a.base.repo.full_name.localeCompare(b.base.repo.full_name)
            ) as any[]
        );
      };

      getPulls();
    }
  }, [octokit, activeRepositories]);

  const [filter, setFilter] = React.useState<string>("");
  const [includeLabels, setIncludeLabels] = React.useState<string[]>([]);
  const [excludeLabels, setExcludeLabels] = React.useState<string[]>([]);
  const labels: string[] = React.useMemo(
    () =>
      Array.from(
        new Set(pulls.map((pull) => pull.labels.map(({ name }) => name)).flat())
      ),
    [pulls]
  );

  const filteredPulls = React.useMemo(() => {
    return pulls.filter((pull) => {
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
        !pull.user.login
          .toLocaleLowerCase()
          .includes(filter.toLocaleLowerCase()) &&
        !pull.head.repo.full_name
          .toLocaleLowerCase()
          .includes(filter.toLocaleLowerCase())
      )
        return false;

      return true;
    });
  }, [pulls, filter, includeLabels, excludeLabels]);

  return (
    <Box padding={2} width={"calc(100vw - 2em)"}>
      {pulls.length === 0 ? (
        <LandingPage auth />
      ) : (
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
      )}
      <Grid2 container spacing={2}>
        {filteredPulls.map((pull) => (
          <Grid2 key={pull.id} xl={6} xs={12}>
            <PullRequestCard pr={pull} />
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
};

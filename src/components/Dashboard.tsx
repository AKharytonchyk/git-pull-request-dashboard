import React, { useEffect } from "react";
import { ConfigContext } from "../App";
import { PullRequest } from "../models/PullRequest";
import PullRequestCard from "./PullRequestCard";
import { Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
import LandingPage from "../pages/LandingPage";
import { MultiselectFilter } from "./MultiselectFilter";
import { InputFilter } from "./InputFilter";
import { useQueries } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import PRLoadingPage from "../pages/PRLoadingPage";

export const Dashboard: React.FC = () => {
  const { octokit, repositorySettings } = React.useContext(ConfigContext);
  const [activeRepositories, setActiveRepositories] = React.useState<string[]>(
    []
  );

  useEffect(() => {
    setActiveRepositories(
      Object.keys(repositorySettings)
        .filter((key) => repositorySettings[key])
        .sort()
    );
  }, [repositorySettings]);

  const { data, pending } = useQueries({
    queries: activeRepositories.map((repo) => ({
      queryKey: ["pulls", repo],
      queryFn: async () => {
        if (octokit) {
          return octokit.getPullRequests(repo);
        }
      },
      enabled: octokit !== undefined,
    })),
    combine: (results) => {
      return {
        data: results.map((result) => result.data ?? [] as PullRequest[]).flat(),
        pending: results.some((result) => result.isLoading),
      };
    },
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

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" />;
  }

  return (
    <Box padding={2} width={"calc(100vw - 2em)"}>
      {pending && data.length === 0 && <PRLoadingPage />}
      {!pending && data.length === 0 && <LandingPage />}
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
          <Grid container spacing={2}>
            {filteredPulls.map(
              (pull) =>
                pull && (
                  <Grid key={pull.id} size={{xl: 6, xs:12 }}>
                    <PullRequestCard pr={pull as unknown as PullRequest} />
                  </Grid>
                )
            )}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;

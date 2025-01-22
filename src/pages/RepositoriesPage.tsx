import React, { useEffect } from "react";
import { ConfigContext } from "../App";
import { useQueries } from "@tanstack/react-query";
import { PullRequest } from "../models/PullRequest";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { Typography } from "@mui/material";
import { RepositoryCard } from "../components/Repositories/RepositoryCard";

export const RepositoriesPage: React.FC = () => {
  const { octokit, repositorySettings, user } = React.useContext(ConfigContext);
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
      enabled:
        octokit !== undefined &&
        activeRepositories.length > 0 &&
        user !== undefined,
    })),
    combine: (results) => {
      return {
        data: results
          .map((result) => result.data ?? ([] as PullRequest[]))
          .flat()
          .map((pr) => ({ ...pr, created_at: new Date(pr.created_at) }))
          .reduce(
            (acc, pr) => {
              const repoName = pr.base.repo?.full_name || "Unknown";
              if (!acc[repoName]) {
                acc[repoName] = { open: 0, draft: 0, pulls: [] };
              }
              acc[repoName].pulls.push(pr as PullRequest);
              if (pr.draft) {
                acc[repoName].draft++;
              } else {
                acc[repoName].open++;
              }
              return acc;
            },
            {} as Record<
              string,
              { open: number; draft: number; pulls: PullRequest[] }
            >
          ),
        pending: results.some((result) => result.isLoading),
      };
    },
  });

  if (!user) {
    return (
      <Box padding={2} width={"calc(100vw - 2em)"}>
        <Typography component="p">
          You need to be logged in to view your pull requests
        </Typography>
      </Box>
    );
  }

  if (pending) {
    return (
      <Box padding={2} width={"calc(100vw - 2em)"}>
        <Typography component="p">Loading your pull requests...</Typography>
      </Box>
    );
  }

  return (
    <Box padding={2} width={'calc(100vw - 2em)'}>
      <Grid container spacing={2}>
        {Object.keys(data)
          .sort((a, b) => data[b].open - data[a].open)
          .map((repo) => (
            <Grid size={{ xs: 12, md: 6, lg: 4, xl: 4 }} key={repo}>
              <RepositoryCard
                name={repo}
                pulls={data[repo].pulls}
                openCount={data[repo].open}
                draftCount={data[repo].draft}
              />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

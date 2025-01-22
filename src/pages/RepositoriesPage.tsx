import React, { useEffect } from "react";
import { ConfigContext } from "../context/ConfigContext";
import { useQueries } from "@tanstack/react-query";
import { PullRequest } from "../models/PullRequest";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";

// import PullRequestCard from "../components/PullRequestCard";
import { Typography } from "@mui/material";
import { RepositoryCard } from "../components/Cards/RepositoryCard";

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
              if (acc[pr.base.repo?.full_name || "Unknown"]) {
                acc[pr.base.repo?.full_name || "Unknown"].push(
                  pr as PullRequest
                );
              } else {
                acc[pr.base.repo?.full_name || "Unknown"] = [pr as PullRequest];
              }
              return acc;
            },
            {} as Record<string, PullRequest[]>
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
    <Grid container spacing={2} sx={{ xl: 4 }}>
      {Object.keys(data).map((repo) => (
        <Grid size={{ xs: 12, lg: 6, xl: 4 }} key={repo}>
          <RepositoryCard name={repo} pulls={data[repo]} />
        </Grid>
      ))}
    </Grid>
  );
};

import React, { useEffect } from "react";
import { ConfigContext } from "../context/ConfigContext";
import { useQueries } from "@tanstack/react-query";
import { PullRequest } from "../models/PullRequest";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";

import PullRequestCard from "../components/PullRequestCard";
import { Typography } from "@mui/material";

export const MyPullRequests: React.FC = () => {
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
          .map((result) => result.data ?? [])
          .flat()
          .filter(
            (pr) =>
              pr.user?.login === user?.login ||
              (pr.assignee as any)?.login === user?.login ||
              pr.assignees?.some((a) => a.login === user?.login) ||
              pr.requested_reviewers?.some((r) => r.login === user?.login)
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

  if (pending && data.length === 0) {
    return (
      <Box padding={2} width={"calc(100vw - 2em)"}>
        <Typography component="p">Loading your pull requests...</Typography>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box padding={2} width={"calc(100vw - 2em)"}>
        <Typography component="p">
          No pull requests found for your account
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {data.map(
        (pull) =>
          pull && (
            <Grid key={pull.id} size={{ xl: 6, xs: 12 }}>
              <PullRequestCard pr={pull as unknown as PullRequest} />
            </Grid>
          )
      )}
    </Grid>
  );
};

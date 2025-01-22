import React, { useEffect } from "react";
import { ConfigContext } from "../App";
import { useQueries } from "@tanstack/react-query";
import {Box, Typography} from "@mui/material";
import Grid from "@mui/material/Grid2";
import IssueCard from "../components/IssueCard";


const IssuesPage: React.FC = () => {
  const { octokit, repositorySettings, user } = React.useContext(ConfigContext);
  const [activeRepositories, setActiveRepositories] = React.useState<string[]>([]);

  useEffect(() => {
    setActiveRepositories(
      Object.keys(repositorySettings)
        .filter((key) => repositorySettings[key])
        .sort()
    );
  }, [repositorySettings]);

  const { data, pending } = useQueries({
    queries: activeRepositories.map((repo) => ({
      queryKey: ["issues", repo],
      queryFn: async () => {
        const [owner, name] = repo.split("/");
        if(octokit) {
          return octokit.getIssues(owner, name);
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
          .filter((issue) => !issue.pull_request)
          .map((issue) => ({
            ...issue,
            repoName: issue.repository_url.split("repos/")[1],
          })),
        pending: results.some((result) => result.isLoading),
      };
    },
  });

  if (!user) {
    return (
      <Box padding={2} width={"calc(100vw - 2em)"}>
        <Typography component="p">
        You need to be logged in to view the issues.
        </Typography>
      </Box>
    );
  }

  if (pending && data.length === 0) {
    return (
      <Box padding={2} width={"calc(100vw - 2em)"}>
        <Typography component="p">Loading issues...</Typography>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box padding={2} width={"calc(100vw - 2em)"}>
        <Typography component="p">No issues found in the repositories</Typography>
      </Box>
    );
  }

  return (
<Box padding={2} width={"calc(100vw - 2em)"}>
  <Grid container spacing={2}>
    {data.map((issue) => (
      <Grid key={issue.id} size={{ xl: 6, xs: 12 }}>
        <IssueCard
          title={issue.title}
          htmlUrl={issue.html_url}
          createdAt={issue.created_at}
          labels={
            issue.labels.map((label) =>
              typeof label === "string" ? { name: label } : { name: label.name || "" }
            ) as { name: string }[]
          }
          body={issue.body ?? ''}
          repoName={issue.repoName}
          createdBy={issue?.user?.login ?? ''}
          assignedTo={issue.assignee?.login}
        />
      </Grid>
    ))}
  </Grid>
</Box>
  );
};

export default IssuesPage;
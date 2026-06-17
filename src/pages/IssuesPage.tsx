import React from "react";
import { ConfigContext } from "../context/ConfigContext";
import { useQueries } from "@tanstack/react-query";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import IssueCard from "../components/IssueCard";
import { useActiveRepositories } from "../hooks/useActiveRepositories";

const IssuesPage: React.FC = () => {
  const { clients, repositorySettings, accounts } = React.useContext(ConfigContext);
  const activeRepositories = useActiveRepositories(repositorySettings, clients);

  const { data, pending } = useQueries({
    queries: activeRepositories.map((repository) => ({
      queryKey: ["issues", repository.providerHost, repository.fullName],
      queryFn: async () => {
        const issues = await repository.client.getIssues(repository.fullName);
        return issues.map((issue) => ({
          ...issue,
          providerHost: repository.providerHost,
          repositoryKey: repository.key,
        }));
      },
      enabled:
        clients.length > 0 &&
        activeRepositories.length > 0 &&
        accounts.length > 0,
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

  if (accounts.length === 0) {
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
        <Typography component="p">
          No issues found in the repositories
        </Typography>
      </Box>
    );
  }

  return (
    <Box padding={2} width={"calc(100vw - 2em)"}>
      <Grid container spacing={2}>
        {data.map((issue) => (
          <Grid
            key={`${issue.providerHost ?? "github.com"}:${issue.id}`}
            size={{ xl: 6, xs: 12 }}
          >
            <IssueCard
              title={issue.title}
              htmlUrl={issue.html_url}
              createdAt={issue.created_at}
              labels={
                issue.labels.map((label) =>
                  typeof label === "string"
                    ? { name: label }
                    : { name: label.name || "" }
                ) as { name: string }[]
              }
              body={issue.body ?? ""}
              repoName={issue.repoName}
              createdBy={issue?.user?.login ?? ""}
              assignedTo={issue.assignee?.login}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default IssuesPage;

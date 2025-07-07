import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { ConfigContext } from "../context/ConfigContext";
import { Link, useParams } from "react-router";
import PullRequestCard from "../components/Cards/PullRequestCard";
import { IssueCard } from "../components/Cards/IssueCard";
import { Grid2, Stack, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VulnerabilityIndicator from "../components/VulnerabilityIndicator";

export const RepositoryItem: React.FC = () => {
  const { octokit } = React.useContext(ConfigContext);
  const { owner, repo } = useParams();
  const [value, setValue] = React.useState("issues");

  const fullName = useMemo(() => `${owner}/${repo}`, [owner, repo]);

  const { data: issues, isLoading: loadingIssues } = useQuery({
    queryKey: ["issues", fullName],
    queryFn: async () => {
      if (octokit) {
        return octokit.getIssues(fullName);
      }

      return [];
    },
    enabled: octokit !== undefined && fullName !== undefined,
  });

  const { data: pulls, isLoading: loadingPulls } = useQuery({
    queryKey: ["pulls", fullName],
    queryFn: async () => {
      if (octokit) {
        return octokit.getPullRequests(fullName);
      }

      return [];
    },
    enabled: octokit !== undefined && fullName !== undefined,
  });

  const handleTabChange = (_: any, newValue: string) => {
    setValue(newValue);
  };

  return (
    <div>
      <Stack direction="row" gap={1} alignItems="baseline" sx={{ mb: 2 }}>
        <Tooltip title="Back to repositories">
          <Link to="/repositories">
            <ArrowBackIcon />
          </Link>
        </Tooltip>
        <Typography variant="h4">{fullName}</Typography>
        <VulnerabilityIndicator 
          repositoryFullName={fullName} 
          compact={false}
        />
      </Stack>
      <Tabs value={value} onChange={handleTabChange}>
        <Tab
          sx={{ ml: "auto" }}
          label={`Issues ${issues?.length}`}
          value="issues"
        />
        <Tab label={"Pull Requests " + pulls?.length} value="pulls" />
      </Tabs>
      {loadingIssues && <div>Loading issues...</div>}
      {loadingPulls && <div>Loading pull requests...</div>}
      <Grid2 container spacing={2} mt={1}>
        {issues &&
          value === "issues" &&
          issues.map((issue) => (
            <Grid2 size={{ xs: 12, lg: 6 }} key={issue.number}>
              <IssueCard issue={issue} />
            </Grid2>
          ))}
        {pulls &&
          value === "pulls" &&
          pulls.map((pull) => (
            <Grid2 size={{ xs: 12, xl: 6 }} key={pull.number}>
              <PullRequestCard key={pull.number} pr={pull} />
            </Grid2>
          ))}
      </Grid2>
    </div>
  );
};

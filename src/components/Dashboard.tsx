import React, { useEffect } from "react";
import { ConfigContext } from "../App";
import { PullRequest } from "../models/PullRequest";
import PullRequestCard from "./PullRequestCard";
import {
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  Switch,
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import LandingPage from "../pages/LandingPage";
import { InputFilter } from "./InputFilter";
import { useQueries } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import PRLoadingPage from "../pages/PRLoadingPage";
import { PullRequestFilters } from "./Dashboard/PullRequestFilters";
import { FilterList } from "@mui/icons-material";

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
        data: results
          .map((result) => result.data ?? ([] as PullRequest[]))
          .flat(),
        pending: results.some((result) => result.isLoading),
      };
    },
  });

  const [filter, setFilter] = React.useState<string>("");
  const [showDrafts, setShowDrafts] = React.useState<boolean>(false);
  const [showFilters, setShowFilters] = React.useState<boolean>(false);

  const filteredPulls = React.useMemo(() => {
    return data.filter((pull) => {
      if (!pull) return false;
      if (!showDrafts && pull.draft) return false;
      if (!pull.title.toLowerCase().includes(filter.toLowerCase()))
        return false;

      return true;
    });
  }, [data, filter, showDrafts]);

  const [displayedPulls, setDisplayedPulls] = React.useState<PullRequest[]>(
    filteredPulls as PullRequest[]
  );

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
            <Box
              display="flex"
              justifyContent="start"
              width={"100%"}
              alignItems={"center"}
            >
              <InputFilter
                name="Title Search"
                onChange={setFilter}
                size="small"
              />
              <FormGroup sx={{ m: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showDrafts}
                      onChange={() => setShowDrafts(!showDrafts)}
                    />
                  }
                  label="Show Drafts"
                />
              </FormGroup>
              <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"}>
                <Button
                  variant="contained"
                  sx={{ ml: 1, marginLeft: "auto", height: 32 }}
                  size="small"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FilterList />
                </Button>
              </Tooltip>
            </Box>
            <Box display={showFilters ? "block" : "none"}>
              <PullRequestFilters
                pullRequests={filteredPulls as PullRequest[]}
                onChange={setDisplayedPulls}
              />
            </Box>
          </Box>
          <Grid container spacing={2}>
            {displayedPulls.map(
              (pull) =>
                pull && (
                  <Grid key={pull.id} size={{ xl: 6, xs: 12 }}>
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

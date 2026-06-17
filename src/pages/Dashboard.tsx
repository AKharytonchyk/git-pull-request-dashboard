import React from "react";
import { ConfigContext } from "../context/ConfigContext";
import { PullRequest } from "../models/PullRequest";
import PullRequestCard from "../components/Cards/PullRequestCard";
import {
  Box,
  Button,
  FormControl,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import LandingPage from "./LandingPage";
import { InputFilter } from "../components/InputFilter";
import { useQueries } from "@tanstack/react-query";
import PRLoadingPage from "./PRLoadingPage";
import { PullRequestFilters } from "../components/Dashboard/PullRequestFilters";
import { FilterList } from "@mui/icons-material";
import SortIconOutlined from "@mui/icons-material/Sort";
import { useActiveRepositories } from "../hooks/useActiveRepositories";

export const Dashboard: React.FC = () => {
  const { clients, repositorySettings, accounts } = React.useContext(ConfigContext);
  const activeRepositories = useActiveRepositories(repositorySettings, clients);
  const [orderByDate, setOrderByDate] = React.useState<"Repository" | "Date">(
    "Repository"
  );
  const [order, setOrder] = React.useState<"asc" | "desc">("asc");

  const { data, pending } = useQueries({
    queries: activeRepositories.map((repository) => ({
      queryKey: ["pulls", repository.providerHost, repository.fullName],
      queryFn: async () => {
        const pulls = await repository.client.getPullRequests(repository.fullName);
        return pulls.map((pull) => ({
          ...pull,
          providerHost: repository.providerHost,
          repositoryKey: repository.key,
        }));
      },
      enabled: clients.length > 0,
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
    const pullRequests = data.filter((pull) => {
      if (!pull) return false;
      if (!showDrafts && pull.draft) return false;
      if (!pull.title.toLowerCase().includes(filter.toLowerCase()))
        return false;

      return true;
    });

    pullRequests.sort((a, b) => {
      if (orderByDate === "Repository") {
        return order === "asc"
          ? a.base.repo.name.localeCompare(b.base.repo.name)
          : b.base.repo.name.localeCompare(a.base.repo.name);
      } else {
        return order === "asc"
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });

    return pullRequests;
  }, [data, filter, showDrafts, orderByDate, order]);

  const [displayedPulls, setDisplayedPulls] = React.useState<PullRequest[]>(
    filteredPulls as PullRequest[]
  );

  // If no user or octokit is available, show the login page within this route
  if (accounts.length === 0 || clients.length === 0) {
    return <LandingPage />;
  }

  return (
    <>
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
              <FormControl
                sx={{ m: 1, alignItems: "center", flexDirection: "row" }}
              >
                <Typography id="select-order-label" sx={{ pr: 2 }}>
                  Order By:
                </Typography>
                <Select
                  value={orderByDate}
                  variant="standard"
                  labelId="select-order-label"
                  label="Order By"
                  onChange={(e) => setOrderByDate(e.target.value as any)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value={"Repository"}>Repository</MenuItem>
                  <MenuItem value={"Date"}>Date</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title={order === "asc" ? "Ascending" : "Descending"}>
                <IconButton
                  size="small"
                  onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
                >
                  <SortIconOutlined
                    sx={{
                      transform: order === "asc" ? "rotate(180deg)" : "none",
                    }}
                  />
                </IconButton>
              </Tooltip>
              <FormGroup
                sx={{ m: 1, alignItems: "center", flexDirection: "row" }}
              >
                <InputLabel id="select-order-label" sx={{ pr: 2 }}>
                  Show Drafts
                </InputLabel>
                <Switch
                  checked={showDrafts}
                  onChange={() => setShowDrafts(!showDrafts)}
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
                  <Grid
                    key={`${pull.providerHost ?? "github.com"}:${pull.id}`}
                    size={{ xl: 6, xs: 12 }}
                  >
                    <PullRequestCard pr={pull as unknown as PullRequest} />
                  </Grid>
                )
            )}
          </Grid>
        </>
      )}
    </>
  );
};

export default Dashboard;

import {
  Card,
  CardContent,
  Chip,
  Box,
  Typography,
  Tooltip,
  Link,
  CircularProgress,
  Stack,
} from "@mui/material";
import { PullRequest } from "../../models/PullRequest";
import { LanguageIcon } from "../icons/LanguageIcon";
import { useMemo } from "react";
import { getColorForDaysInReview } from "../../utils/getColorsForDaysInReview";
import { DashboardCustomizeOutlined, Visibility } from "@mui/icons-material";
import React from "react";
import { ConfigContext } from "../../context/ConfigContext";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router";

export type RepositoryCardProps = {
  name: string;
  pulls: PullRequest[];
};

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ name }) => {
  const { octokit } = React.useContext(ConfigContext);

  const { data: issues, isLoading: loadingIssues } = useQuery({
    queryKey: ["issues", name],
    queryFn: async () => {
      if (octokit) {
        return octokit.getIssues(name);
      }
    },
    enabled: octokit !== undefined && name !== undefined,
  });

  const { data: pulls, isLoading: loadingPulls } = useQuery({
    queryKey: ["pulls", name],
    queryFn: async () => {
      if (octokit) {
        return octokit.getPullRequests(name);
      }
    },
    enabled: octokit !== undefined && name !== undefined,
  });

  const oldestPr = useMemo(() => {
    return pulls?.sort(
      (prA, prB) => prA.created_at.getTime() - prB.created_at.getTime()
    )[0];
  }, [pulls]);

  const badgeColor = useMemo(
    () => getColorForDaysInReview(oldestPr?.created_at),
    [oldestPr]
  );

  const date = useMemo(
    () =>
      oldestPr?.created_at
        ? Math.floor(
            (new Date().getTime() - oldestPr?.created_at?.getTime()) /
              (1000 * 3600 * 24)
          )
        : 0,
    [oldestPr]
  );

  const repo = useMemo(() => pulls?.[0].base?.repo, [pulls]);

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: 320,
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          paddingBottom: 1,
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            gap: 1,
            pb: 2,
          }}
        >
          <LanguageIcon language={repo?.language} />
          <Typography variant="h6">{repo?.full_name || "Unknown"}</Typography>
        </Box>
        <Stack direction="row" justifyContent={"space-between"}>
          <Stack direction="row" spacing={1} alignItems={"center"}>
            <Typography color="text.secondary">Max Days: </Typography>
            <Chip
              label={date}
              size="small"
              sx={{ bgcolor: badgeColor }}
              icon={loadingPulls ? <CircularProgress /> : undefined}
            />
            <Typography color="text.secondary">PRs: </Typography>
            <Chip
              label={pulls?.length || 0}
              size="small"
              color="primary"
              icon={loadingPulls ? <CircularProgress /> : undefined}
            />
            <Typography color="text.secondary">Issues: </Typography>
            <Chip
              label={issues?.length || 0}
              size="small"
              color="primary"
              sx={{ bgcolor: loadingIssues ? "grey.300" : "" }}
              icon={loadingIssues ? <CircularProgress /> : undefined}
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Link
              sx={{ height: 24, width: 24 }}
              href={repo?.html_url + "/pulls"}
              target="_blank"
              rel="noopener"
            >
              <Tooltip title="View PRs">
                <Visibility />
              </Tooltip>
            </Link>
            <RouterLink
              to={`/repositories/${repo?.full_name}`}
              style={{ height: 24, width: 24 }}
            >
              <Tooltip title="View Details">
                <DashboardCustomizeOutlined />
              </Tooltip>
            </RouterLink>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

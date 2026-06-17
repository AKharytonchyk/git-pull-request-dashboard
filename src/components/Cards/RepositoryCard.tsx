import {
  Card,
  CardContent,
  Box,
  Typography,
  Tooltip,
  Link,
  Stack,
} from "@mui/material";
import { LanguageIcon } from "../icons/LanguageIcon";
import { useMemo, useState } from "react";
import { getColorForDaysInReview } from "../../utils/getColorsForDaysInReview";
import { DashboardCustomizeOutlined, Visibility } from "@mui/icons-material";
import React from "react";
import { ConfigContext } from "../../context/ConfigContext";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router";
import { AsyncChip } from "../AsyncChip";
import { useOnScreen } from "../../hooks/useOnScreen";
import VulnerabilityIndicator from "../VulnerabilityIndicator";
import {
  parseRepositoryKey,
  repositoryRoute,
} from "../../utils/repositoryKeys";

export type RepositoryCardProps = {
  name: string;
};

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ name }) => {
  const { clients, getClientForProvider } = React.useContext(ConfigContext);
  const repository = useMemo(
    () => parseRepositoryKey(name, clients[0]?.account.provider.host),
    [clients, name]
  );
  const octokit = getClientForProvider(repository.providerHost);
  const ref = React.useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(ref);
  const [isVulnerabilityExpanded, setIsVulnerabilityExpanded] = useState(false);

  const enabled = useMemo(
    () => isOnScreen && !!octokit && repository.fullName !== undefined,
    [isOnScreen, octokit, repository.fullName]
  );

  const { data: issues, isLoading: loadingIssues } = useQuery({
    queryKey: ["issues", repository.providerHost, repository.fullName],
    queryFn: async () => {
      if (octokit) {
        return octokit.getIssues(repository.fullName);
      }
    },
    enabled: enabled,
  });

  const { data: pulls, isLoading: loadingPulls } = useQuery({
    queryKey: ["pulls", repository.providerHost, repository.fullName],
    queryFn: async () => {
      if (octokit) {
        const pulls = await octokit.getPullRequests(repository.fullName);
        return pulls.map((pull) => ({
          ...pull,
          providerHost: repository.providerHost,
          repositoryKey: repository.key,
        }));
      }
    },
    enabled: enabled,
  });

  const { data: repoData } = useQuery({
    queryKey: ["repo", repository.providerHost, repository.fullName],
    queryFn: async () => {
      if (octokit) {
        return octokit.getRepository(repository.fullName);
      }
    },
    enabled: enabled,
  });

  const oldestPr = useMemo(() => {
    return (pulls ?? [])
      .filter(({ draft }) => !draft)
      .sort(
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

  const repo = useMemo(() => pulls?.[0]?.base?.repo, [pulls]);

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: 700,
      }}
      ref={ref}
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
          <LanguageIcon language={repoData?.language} />
          <Typography variant="h6">{repository.fullName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {repository.providerHost}
          </Typography>

          <Box sx={{ marginLeft: "auto" }}>
            {repoData ? (
              <VulnerabilityIndicator
                repositoryFullName={repoData.full_name}
                providerHost={repository.providerHost}
                compact={true}
                expanded={false}
                onToggleExpanded={() =>
                  setIsVulnerabilityExpanded(!isVulnerabilityExpanded)
                }
                showExpandButton={true}
              />
            ) : null}
          </Box>
        </Box>

        {/* Expanded vulnerability details */}
        {isVulnerabilityExpanded && repoData && (
          <VulnerabilityIndicator
            repositoryFullName={repoData.full_name}
            providerHost={repository.providerHost}
            compact={false}
            expanded={true}
          />
        )}
        <Stack direction="row" justifyContent={"space-between"}>
          <Stack direction="row" alignItems={"center"}>
            <Stack
              direction="row"
              sx={{
                minWidth: 148,
                justifyContent: "space-between",
                borderRight: "1px solid",
                borderColor: "grey.300",
                paddingRight: 1,
                paddingLeft: 1,
              }}
            >
              <Typography color="text.secondary">Max Days: </Typography>
              <AsyncChip
                isLoading={loadingPulls}
                label={date}
                size="small"
                tooltip="Max days in review"
                sx={{ bgcolor: badgeColor, color: "white" }}
              />
            </Stack>
            <Stack
              direction="row"
              sx={{
                minWidth: 148,
                gap: 1,
                justifyContent: "space-between",
                borderRight: "1px solid",
                borderColor: "grey.300",
                paddingRight: 1,
                paddingLeft: 1,
              }}
            >
              <Typography color="text.secondary" sx={{ mr: "auto" }}>
                PRs:
              </Typography>
              <AsyncChip
                isLoading={loadingPulls}
                label={pulls?.filter(({ draft }) => !draft).length || 0}
                size="small"
                color="success"
                tooltip="Open PRs"
              />
            </Stack>
            <Stack
              direction="row"
              sx={{
                minWidth: 148,
                gap: 1,
                justifyContent: "space-between",
                borderRight: "1px solid",
                borderColor: "grey.300",
                paddingRight: 1,
                paddingLeft: 1,
              }}
            >
              <Typography color="text.secondary">Draft PRs: </Typography>
              <AsyncChip
                isLoading={loadingPulls}
                label={pulls?.filter(({ draft }) => draft).length || 0}
                size="small"
                tooltip="Draft PRs"
                color="secondary"
              />{" "}
            </Stack>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                minWidth: 148,
                gap: 1,
                paddingLeft: 1,
              }}
            >
              <Typography color="text.secondary">Issues: </Typography>
              <AsyncChip
                label={issues?.length || 0}
                size="small"
                color="warning"
                sx={{ bgcolor: loadingIssues ? "grey.300" : "" }}
                isLoading={loadingIssues}
                tooltip="Open Issues"
              />
            </Stack>
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
              to={repositoryRoute(repository.providerHost, repository.fullName)}
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

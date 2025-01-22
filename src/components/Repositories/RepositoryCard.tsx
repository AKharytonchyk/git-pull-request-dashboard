import {
  Card,
  CardContent,
  Chip,
  Box,
  Typography,
  Tooltip,
  Link,
} from "@mui/material";
import { PullRequest } from "../../models/PullRequest";
import { LanguageIcon } from "../icons/LanguageIcon";
import { useMemo } from "react";
import { getColorForDaysInReview } from "../../utils/getColorsForDaysInReview";
import { Visibility } from "@mui/icons-material";

export type RepositoryCardProps = {
  name: string;
  pulls: PullRequest[];
  openCount: number;
  draftCount: number;
};

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  pulls,
  openCount,
  draftCount,
}) => {
  const [
    {
      base: { repo },
    },
  ] = pulls;

  const oldestOpenPr = useMemo(() => {
    return pulls
      .filter((pr) => !pr.draft) // Exclude draft PRs
      .sort(
        (prA, prB) => prA.created_at.getTime() - prB.created_at.getTime()
      )[0]; // Get the oldest PR
  }, [pulls]);

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
            mb: 1,
          }}
        >
          <LanguageIcon language={repo.language} />
          <Typography variant="h6">{repo?.full_name || "Unknown"}</Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            gap: 1,
            mt: "auto",
          }}
        >
          <Typography color="text.secondary">Max Days: </Typography>
          {oldestOpenPr ? (
            <Chip
              label={Math.floor(
                (new Date().getTime() - oldestOpenPr.created_at.getTime()) /
                  (1000 * 3600 * 24)
              )}
              size="small"
              sx={{
                bgcolor: getColorForDaysInReview(oldestOpenPr.created_at),
              }}
            />
          ) : (
            <Typography color="text.secondary">N/A</Typography>
          )}
          {" | "}
          <Typography color="text.secondary">Open PRs: </Typography>
          <Chip label={openCount} size="small" color="primary" />
          {" | "}
          <Typography color="text.secondary">Draft PRs: </Typography>
          <Chip label={draftCount} size="small" color="secondary" />
          <Link
            href={repo.html_url + "/pulls"}
            sx={{ marginLeft: "auto" }}
            target="_blank"
            rel="noopener"
          >
            <Tooltip title="View PRs">
              <Visibility />
            </Tooltip>
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};

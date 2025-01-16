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
};

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ pulls }) => {
  const [
    {
      base: { repo },
    },
  ] = pulls;

  const oldestPr = useMemo(() => {
    return pulls.sort(
      (prA, prB) => prA.created_at.getTime() - prB.created_at.getTime()
    )[0];
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
          <Chip
            label={Math.floor(
              (new Date().getTime() - oldestPr.created_at?.getTime()) /
                (1000 * 3600 * 24)
            )}
            size="small"
            sx={{ bgcolor: getColorForDaysInReview(oldestPr.created_at) }}
          />
          {"|"}
          <Typography color="text.secondary">PRs: </Typography>
          <Chip label={pulls.length} size="small" color="primary" />
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

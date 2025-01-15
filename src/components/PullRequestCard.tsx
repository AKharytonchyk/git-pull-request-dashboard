import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Link,
  CardActions,
  Box,
  Tooltip,
} from "@mui/material";
import { green, red, amber } from "@mui/material/colors";
import { PullRequest } from "../models/PullRequest";
import {
  DesignServices,
  FileOpen,
  GitHub,
  Lock,
  Visibility,
} from "@mui/icons-material";
import { PullRequestChecks } from "./PullRequestChecks";
import { PullRequestsApprovals } from "./PullRequestsApprovals";
import { PullRequestMergeCheck } from "./PullRequestMergeCheck";
import getContrastColor from "../utils/getContractColor";
import replaceEmoticons from "../utils/replaceEmoticons";

interface PullRequestCardProps {
  pr: PullRequest;
}

const PullRequestCard: React.FC<PullRequestCardProps> = ({ pr }) => {
  const getColorForDaysInReview = (createdAt: Date) => {
    const today = new Date();
    const daysInReview = Math.floor(
      (today.getTime() - new Date(createdAt).getTime()) / (1000 * 3600 * 24),
    );

    if (daysInReview < 3) return green[500];
    if (daysInReview < 7) return amber[500];
    return red[500];
  };

  return (
    <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardActions
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
          paddingLeft: 2,
          paddingRight: 2,
        }}
      >
        <Chip
          icon={<GitHub />}
          label={pr.base.repo.full_name}
          size="small"
          sx={{ marginRight: "auto" }}
        />
        {pr.locked && <Lock />}
        {pr.draft && (
          <Tooltip title="Draft PR">
            <DesignServices color="secondary" />
          </Tooltip>
        )}
        <Box
          sx={{ display: "flex", flexShrink: "1", flexWrap: "wrap", gap: 1 }}
        >
          {pr.labels.map((label) => (
            <Chip
              key={label.id}
              label={replaceEmoticons(label.name)}
              size="small"
              style={{
                backgroundColor: `#${label.color}`,
                color: getContrastColor(`#${label.color}`),
              }}
            />
          ))}
        </Box>
        <Chip
          label={pr.state.toUpperCase()}
          color={pr.state === "open" ? "success" : "default"}
          size="small"
          sx={{ marginY: 1 }}
        />
      </CardActions>
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          paddingBottom: 1,
          height: "100%",
        }}
      >
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          PR by {pr.user.login}
        </Typography>
        <Typography variant="h5" component="div">
          <Link href={pr.html_url} target="_blank" rel="noopener">
            #{pr.number}
          </Link>{" "}
          {pr.title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 2,
            marginTop: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              gap: 1,
            }}
          >
            <Typography color="text.secondary">Days in review: </Typography>
            <Chip
              label={Math.floor(
                (new Date().getTime() - new Date(pr.created_at).getTime()) /
                  (1000 * 3600 * 24),
              )}
              sx={{ bgcolor: getColorForDaysInReview(pr.created_at) }}
              size="small"
            />
          </Box>
          {"|"}
          <PullRequestChecks
            owner={pr.base.repo.owner.login}
            repo={pr.base.repo.name}
            prNumber={pr.number}
          />
          {"|"}
          <PullRequestMergeCheck
            owner={pr.base.repo.owner.login}
            repo={pr.base.repo.name}
            prNumber={pr.number}
          />
          {"|"}
          <PullRequestsApprovals
            owner={pr.base.repo.owner.login}
            repo={pr.base.repo.name}
            prNumber={pr.number}
          />
          <Box gap={2} display={"flex"}>
            <Link href={pr.html_url} target="_blank" rel="noopener">
              <Tooltip title="View/Open PR">
                <Visibility />
              </Tooltip>
            </Link>
            <Link href={pr.html_url + "/files"} target="_blank" rel="noopener">
              <Tooltip title="View Changes">
                <FileOpen />
              </Tooltip>
            </Link>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PullRequestCard;

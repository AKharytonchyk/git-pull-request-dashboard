import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Link,
  CardActions,
  Box,
} from "@mui/material";
import { green, red, amber } from "@mui/material/colors";
import { PullRequest } from "../models/PullRequest";
import { DesignServices, GitHub, Lock, LockOpen } from "@mui/icons-material";

interface PullRequestCardProps {
  pr: PullRequest;
}

const PullRequestCard: React.FC<PullRequestCardProps> = ({ pr }) => {
  const getColorForDaysInReview = (createdAt: Date) => {
    const today = new Date();
    const daysInReview = Math.floor(
      (today.getTime() - new Date(createdAt).getTime()) / (1000 * 3600 * 24)
    );

    if (daysInReview < 3) return green[500];
    if (daysInReview < 7) return amber[500];
    return red[500];
  };

  return (
    <Card>
      <CardActions
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
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
        {pr.locked ? <Lock /> : <LockOpen />}
        {pr.draft && <DesignServices color="secondary"/>}
        <Chip
          label={pr.state.toUpperCase()}
          color={pr.state === "open" ? "success" : "default"}
          size="small"
          sx={{ marginY: 1 }}
        />
      </CardActions>
      <CardContent sx={{ display: "flex", flexDirection: "column" }}>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          PR by {pr.user.login}
        </Typography>
        <Typography variant="h5" component="div">
          {pr.title}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "baseline", justifyContent: "space-between", paddingTop: 2, marginTop: 'auto' }}>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            Days in review:{" "}
            <Chip
              label={Math.floor(
                (new Date().getTime() - new Date(pr.created_at).getTime()) /
                  (1000 * 3600 * 24)
              )}
              sx={{ bgcolor: getColorForDaysInReview(pr.created_at) }}
              size="small"
            />
          </Typography>

          <Link href={pr.html_url} target="_blank" rel="noopener">
            View Pull Request
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PullRequestCard;

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
import { DesignServices, FileOpen, GitHub, Lock, Visibility } from "@mui/icons-material";
import { ConfigContext } from "../App";
import { PullRequestChecks } from "./PullRequestChecks";
import { PullRequestsApprovals } from "./PullRequestsApprovals";

interface PullRequestCardProps {
  pr: PullRequest;
}

const PullRequestCard: React.FC<PullRequestCardProps> = ({ pr }) => {
  const { octokit } = React.useContext(ConfigContext);
  const [checkStatus, setCheckStatus] = React.useState<string>("pending");
  const [aoorovals, setApprovals] = React.useState<number>(0);

  React.useEffect(() => {
    if (!octokit) return;

    octokit.getPRChecksStatus(pr.base.repo.owner.login, pr.base.repo.name, pr.number).then((status) => {
      console.log(`getPRChecksStatus: ${pr.number} ${pr.base.repo.name}`, status.data);
    });

    octokit.getPRApprovals(pr.base.repo.owner.login, pr.base.repo.name, pr.number).then((approvals) => {
      console.log('getPRApprovals', approvals.data);
    });
  }, [pr, octokit]);

  const getColorForDaysInReview = (createdAt: Date) => {
    const today = new Date();
    const daysInReview = Math.floor(
      (today.getTime() - new Date(createdAt).getTime()) / (1000 * 3600 * 24)
    );

    if (daysInReview < 3) return green[500];
    if (daysInReview < 7) return amber[500];
    return red[500];
  };

  
  const getLabelColor = (label: string) => {
    if (/(don't|do not)/gi.test(label)) return "warning";
    if (/(wip|work in progress)/gi.test(label)) return "secondary";
    if (/(ready for review|Review Neede|Ready For Testing)/gi.test(label)) return "success";

    return "default";
  }

  return (
    <Card>
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
        {pr.locked && <Lock /> }
        {pr.draft && <DesignServices color="secondary"/>}
        {pr.labels.map((label) => (<Chip key={label.id} label={label.name} size="small" color={getLabelColor(label.name)}/> ))}
        <Chip
          label={pr.state.toUpperCase()}
          color={pr.state === "open" ? "success" : "default"}
          size="small"
          sx={{ marginY: 1 }}
        />
      </CardActions>
      <CardContent sx={{ display: "flex", flexDirection: "column" , paddingBottom: 1}}>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          PR by {pr.user.login}
        </Typography>
        <Typography variant="h5" component="div">
        <Link href={pr.html_url} target="_blank" rel="noopener">#{pr.number}</Link> {pr.title}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "space-between", paddingTop: 2, marginTop: 'auto' }}>
          <Typography color="text.secondary">
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
          {"|"}
          <PullRequestChecks owner = {pr.base.repo.owner.login} repo = {pr.base.repo.name} prNumber = {pr.number}/>
          {"|"}
          <PullRequestsApprovals owner = {pr.base.repo.owner.login} repo = {pr.base.repo.name} prNumber = {pr.number}/>
          <Box gap={2} display={'flex'}>
            <Link href={pr.html_url} target="_blank" rel="noopener"><Tooltip title="View/Open PR"><Visibility/></Tooltip></Link>
            <Link href={pr.html_url + "/files"} target="_blank" rel="noopener"><Tooltip title="View Changes"><FileOpen /></Tooltip></Link>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PullRequestCard;

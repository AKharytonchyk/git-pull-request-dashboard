import Card from "@mui/material/Card";
import { Issue } from "../../models/Issue";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { Assignee } from "../User/Assignee";
import { Avatar, Box, CardHeader, Chip, Link, Tooltip } from "@mui/material";
import { useMemo, useState } from "react";
import { Markdown } from "../Markdown";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import getContrastColor from "../../utils/getContractColor";
import replaceEmoticons from "../../utils/replaceEmoticons";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

export type IssueCardProps = {
  issue: Issue;
};

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const [expanded, setExpanded] = useState(false);

  const avatarStyles = useMemo(() => {
    switch (issue.author_association) {
      case "OWNER":
        return {
          border: "2px solid #d9534f",
          boxShadow: "0 0 8px #d9534f",
        };
      case "MEMBER":
        return {
          border: "2px solid #5cb85c",
          boxShadow: "0 0 8px #5cb85c",
        };
      case "CONTRIBUTOR":
        return {
          border: "2px solid #5bc0de",
          boxShadow: "0 0 8px #5bc0de",
        };
      case "COLLABORATOR":
        return {
          border: "2px solid #f0ad4e",
          boxShadow: "0 0 8px #f0ad4e",
        };
      default:
        return {
          border: "none",
          boxShadow: "none",
        };
    }
  }, [issue.author_association]);

  const actions = useMemo(
    () => (
      <Box
        sx={{ display: "flex", gap: 1, height: "100%", alignItems: "center" }}
      >
        {expanded ? (
          <Button
            size="small"
            color="primary"
            onClick={() => setExpanded(!expanded)}
          >
            Collapse
          </Button>
        ) : (
          <Button
            size="small"
            color="primary"
            onClick={() => setExpanded(!expanded)}
          >
            Expand
          </Button>
        )}
        {"|"}
        <Tooltip title={`Navigate to ${issue.id}`}>
          <Link
            href={issue.html_url}
            target="_blank"
            rel="noopener"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <ArrowOutwardIcon />
          </Link>
        </Tooltip>
      </Box>
    ),
    [expanded, issue.html_url, issue.id]
  );

  return (
    <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader
        sx={{ display: "flex", gap: 1 }}
        avatar={
          <Tooltip
            title={`Author: ${issue.user.login} | ${issue.author_association.replace("NONE", "USER")}`}
          >
            <Avatar
              alt={issue.user.login}
              src={issue.user.avatar_url}
              sx={{ width: 36, height: 36, ...avatarStyles }}
            />
          </Tooltip>
        }
        title={issue.title}
        subheader={`#${issue.number}: Last Updated ${new Date(issue.updated_at).toLocaleDateString()}`}
        action={actions}
      />
      <CardActions sx={{ p: 2, display: "flex" }}>
        {issue.labels?.map((label) => (
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
      </CardActions>
      <CardContent
        sx={{
          maxHeight: expanded ? "none" : 200,
          overflow: "hidden",
          transition: "height 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
          m: 2,
          mt: 0,
          p: 0,
        }}
      >
        <Markdown content={issue.body} />
      </CardContent>
      <CardActions
        sx={{
          display: issue.assignees?.length > 0 ? "flex" : "none",
          justifyContent: "flex-end",
          p: 2,
        }}
      >
        {issue.assignees?.length > 0 && (
          <Box
            sx={{
              justifySelf: "end",
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Tooltip title="Assignees">
              <PersonSearchIcon />
            </Tooltip>
            {issue.assignees?.map((assignee) => (
              <Assignee key={assignee.id} assignee={assignee} />
            ))}
          </Box>
        )}
      </CardActions>
    </Card>
  );
};

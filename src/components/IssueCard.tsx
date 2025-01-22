import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Link,
  Box,
  Tooltip,
} from "@mui/material";
import {
  GitHub,
  Visibility,
} from "@mui/icons-material";

export interface IssueCardProps {
  title: string;
  htmlUrl: string;
  createdAt: string;
  labels: { name: string }[];
  body: string;
  repoName: string;
  createdBy: string;
  assignedTo?: string;
}

const IssueCard: React.FC<IssueCardProps> = ({
  title,
  htmlUrl,
  createdAt,
  labels,
  repoName,
  createdBy,
  assignedTo,
}) => {
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
          label={repoName || "Unknown"}
          size="small"
          sx={{ marginRight: "auto" }}
        />
        <Box
          sx={{ display: "flex", flexShrink: 1, flexWrap: "wrap", gap: 1 }}
        >
          {labels.map((label, index) => (
            <Chip key={index} label={label.name} size="small" />
          ))}
        </Box>
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
        Issue by {createdBy} {assignedTo && ` | Assigned to ${assignedTo}`}
        </Typography>
        <Typography variant="h5" component="div">
          <Link href={htmlUrl} target="_blank" rel="noopener">
            {title}
          </Link>
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
          <Typography color="text.secondary">Created on: <Typography color="text.secondary" sx={{ fontWeight: "bold" }}>{new Date(createdAt).toLocaleDateString()}</Typography> </Typography>

          <Box gap={2} display={"flex"}>
            <Link href={htmlUrl} target="_blank" rel="noopener">
              <Tooltip title="View Issue">
                <Visibility />
              </Tooltip>
            </Link>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default IssueCard;
import React from "react";
import { Organization } from "./models/Organization";
import { GitService } from "./service/gitService";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  ButtonGroup,
  List,
  ListItem,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Repository } from "./models/Repository";

export type OrganizationSettingProps = {
  org: Organization;
  octokit: GitService;
};

export const OrganizationSetting: React.FC<OrganizationSettingProps> = ({
  org,
  octokit,
}) => {
  const [repos, setRepos] = React.useState<Repository[]>([]);
  React.useEffect(() => {
    octokit.getRepos(org.login).then((repos) => {
      setRepos(repos.data as Repository[]);
    });
  }, [octokit, org.login]);

  return (
    <ListItem key={org.login}>
      <Accordion sx={{ width: "100%" }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar alt={org.login} src={org.avatar_url} sx={{ mr: 2 }} />{" "}
            <div>{org.login}</div>
          </Box>
        </AccordionSummary>
        <AccordionActions>
          <ButtonGroup size="small" color="primary">
            <Button>Select All</Button>
            <Button>Select None</Button>
          </ButtonGroup>
        </AccordionActions>
        <AccordionDetails>
          <List>
            {repos.map((repo) => (
              <ListItem key={repo.id}>{repo.full_name}</ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </ListItem>
  );
};

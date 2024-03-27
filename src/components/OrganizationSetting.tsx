import React, { useMemo } from "react";
import { Organization } from "../models/Organization";
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
import { Repository } from "../models/Repository";
import { RepositorySelector } from "./RepositorySelector";
import { ConfigContext } from "../App";

export type OrganizationSettingProps = {
  org: Organization;
};

export const OrganizationSetting: React.FC<OrganizationSettingProps> = ({
  org,
}) => {
  const { octokit, handleRepositorySelect }= React.useContext(ConfigContext);

  const [repos, setRepos] = React.useState<Repository[]>([]);
  React.useEffect(() => {
    if(!octokit) return;
    octokit.getRepos(org.login).then((repos) => {
      setRepos(repos.data as Repository[]);
    });
  }, [octokit, org.login]);

  const repoList = useMemo(() => (repos.map((repo) => (
    <RepositorySelector key={repo.id} repository={repo} />
  ))), [repos]);

  const handleSelectAll = React.useCallback(() => {
    repos.forEach((repo) => handleRepositorySelect(repo.full_name, true));
  }, [repos, handleRepositorySelect]);

  const handleSelectNone = React.useCallback(() => {
    repos.forEach((repo) => handleRepositorySelect(repo.full_name, false));
  }, [repos, handleRepositorySelect]);

  return (
    <ListItem key={org.login}>
      <Accordion sx={{ width: "100%", minWidth: "550px" }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar alt={org.login} src={org.avatar_url} sx={{ mr: 2 }} />
            <div>{org.login}</div>
          </Box>
        </AccordionSummary>
        <AccordionActions>
          <ButtonGroup size="small" color="primary">
            <Button onClick={() => handleSelectAll()}>Select All</Button>
            <Button onClick={() => handleSelectNone()}>Select None</Button>
          </ButtonGroup>
        </AccordionActions>
        <AccordionDetails>
          <List>
            {repoList}
          </List>
        </AccordionDetails>
      </Accordion>
    </ListItem>
  );
};

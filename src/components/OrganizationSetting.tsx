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
  Input,
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
  const { octokit, handleRepositorySelect } = React.useContext(ConfigContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const [repos, setRepos] = React.useState<Repository[]>([]);
  const [selectedRepos, setSelectedRepos] = React.useState<Repository[]>([]);

  React.useEffect(() => {
    if (!octokit) return;
    setIsLoading(true);
    octokit.getRepos(org.login).then((repos) => {
      setRepos(repos as Repository[]);
      setSelectedRepos(repos as Repository[]);
      setIsLoading(false);
    });
  }, [octokit, org.login]);

  const repoList = useMemo(
    () =>
      selectedRepos.map((repo) => (
        <RepositorySelector key={repo.id} repository={repo} />
      )),
    [selectedRepos]
  );

  const handleSelectAll = React.useCallback(() => {
    repos.forEach((repo) => handleRepositorySelect(repo.full_name, true));
  }, [repos, handleRepositorySelect]);

  const handleSelectNone = React.useCallback(() => {
    repos.forEach((repo) => handleRepositorySelect(repo.full_name, false));
  }, [repos, handleRepositorySelect]);

  const onFilterChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value === "" || event.target.value.length < 3)
        return setSelectedRepos(repos);
      const filter = event.target.value;
      setSelectedRepos(repos.filter((repo) => repo.full_name.includes(filter)));
    },
    [repos]
  );

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
          <Input
            placeholder="Filter Repositories"
            fullWidth
            disabled={isLoading}
            onChange={(e) =>
              onFilterChange(e as React.ChangeEvent<HTMLInputElement>)
            }
          />
          <ButtonGroup size="small" color="primary" sx={{flexShrink: 0}} disabled={isLoading}>
            <Button onClick={() => handleSelectAll()}>Select All</Button>
            <Button onClick={() => handleSelectNone()}>Select None</Button>
          </ButtonGroup>
        </AccordionActions>
        <AccordionDetails>
          {isLoading && <div>Loading...</div>}
          {!isLoading && <List>{repoList}</List>}
        </AccordionDetails>
      </Accordion>
    </ListItem>
  );
};

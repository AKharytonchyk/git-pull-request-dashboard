import React, { useMemo } from "react";
import { Organization } from "../models/Organization";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
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
import { OrgTitle } from "./OrgAccordionTitle";
import { UserTitle } from "./UserAccordionTitle";
import { StarredTitle } from './StarredAccordingTitle';

export type RepoSettingAccordionProps = {
  org?: Organization;
  type: "user" | "org" | "starred";
};

export const RepoSettingAccordion: React.FC<RepoSettingAccordionProps> = ({org, type}) => {
  const { octokit, handleRepositorySelect, repositorySettings } = React.useContext(ConfigContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const [repos, setRepos] = React.useState<Repository[]>([]);
  const [selectedRepos, setSelectedRepos] = React.useState<Repository[]>([]);

  React.useEffect(() => {
    if (!octokit) return;
    setIsLoading(true);
    
    const fetchRepos = async () => {
      let fetchedRepos: Repository[] = [];
      switch (type) {
        case "org":
          fetchedRepos = (org && await octokit.getRepos(org.login)) ?? [];
          break;
        case "user":
          fetchedRepos = await octokit.getUserRepos();
          break;
        case "starred":
          fetchedRepos = await octokit.getStaredRepos();
          break;
      }
      setRepos(fetchedRepos);
      setSelectedRepos(fetchedRepos);
      setIsLoading(false);
    }

    fetchRepos();
  }, [octokit, org, type]);

  const repoList = useMemo(
    () =>
      selectedRepos
      .sort((a, b) => {
        const repoAHasSettingsTrue = repositorySettings[a.full_name] === true ? 0 : 1;
        const repoBHasSettingsTrue = repositorySettings[b.full_name] === true ? 0 : 1;
        if (repoAHasSettingsTrue !== repoBHasSettingsTrue) {
          return repoAHasSettingsTrue - repoBHasSettingsTrue;
        }
        return a.full_name.localeCompare(b.full_name);
      })
      .map((repo) => (
        <RepositorySelector key={repo.id} repository={repo} />
      )),
    [selectedRepos, repositorySettings]
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

  const title = React.useMemo(() => {
    switch (type) {
      case "org":
        return <OrgTitle org={org} />;
      case "user":
        return <UserTitle />;
      case "starred":
        return <StarredTitle />;
    }
  }, [org, type]);


  return (
    <ListItem>
      <Accordion sx={{ width: "100%", minWidth: "550px" }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          {title}
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

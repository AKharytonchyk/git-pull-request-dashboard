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
  LinearProgress,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Repository } from "../models/Repository";
import { RepositorySelector } from "./RepositorySelector";
import { ConfigContext } from "../context/ConfigContext";
import { OrgTitle } from "./OrgAccordionTitle";
import { UserTitle } from "./UserAccordionTitle";
import { StarredTitle } from "./StarredAccordingTitle";
import { useQuery } from "@tanstack/react-query";
import { GitService } from "../service/gitService";
import { AuthSession } from "../models/Auth";
import { repositoryKey } from "../utils/repositoryKeys";

export type RepoSettingAccordionProps = {
  account: AuthSession;
  client: GitService;
  org?: Organization;
  type: "user" | "org" | "starred";
};

export const RepoSettingAccordion: React.FC<RepoSettingAccordionProps> = ({
  account,
  client,
  org,
  type,
}) => {
  const { handleRepositorySelect, repositorySettings } =
    React.useContext(ConfigContext);
  const [selectedRepos, setSelectedRepos] = React.useState<Repository[]>([]);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const providerHost = account.provider.host;

  const { isLoading, data: repos = [] } = useQuery({
    queryKey: ["repos", providerHost, org?.login, type],
    queryFn: async () => {
      let fetchedRepos: Repository[] = [];
      switch (type) {
        case "org":
          fetchedRepos = (org && (await client.getRepos(org.login))) ?? [];
          break;
        case "user":
          fetchedRepos = await client.getUserRepos();
          break;
        case "starred":
          fetchedRepos = await client.getStaredRepos();
          break;
      }
      setSelectedRepos(fetchedRepos);
      return fetchedRepos;
    },
    enabled: expanded,
  });

  const repoList = useMemo(
    () =>
      selectedRepos
        .sort((a, b) => {
          const repoAKey = repositoryKey(providerHost, a.full_name);
          const repoBKey = repositoryKey(providerHost, b.full_name);
          const repoAHasSettingsTrue =
            repositorySettings[repoAKey] === true ? 0 : 1;
          const repoBHasSettingsTrue =
            repositorySettings[repoBKey] === true ? 0 : 1;
          if (repoAHasSettingsTrue !== repoBHasSettingsTrue) {
            return repoAHasSettingsTrue - repoBHasSettingsTrue;
          }
          return a.full_name.localeCompare(b.full_name);
        })
        .map((repo) => (
          <RepositorySelector
            key={`${providerHost}:${repo.id}`}
            providerHost={providerHost}
            repository={repo}
          />
        )),
    [providerHost, selectedRepos, repositorySettings]
  );

  const handleSelectAll = React.useCallback(() => {
    repos.forEach((repo) =>
      handleRepositorySelect(repositoryKey(providerHost, repo.full_name), true)
    );
  }, [providerHost, repos, handleRepositorySelect]);

  const handleSelectNone = React.useCallback(() => {
    repos.forEach((repo) =>
      handleRepositorySelect(repositoryKey(providerHost, repo.full_name), false)
    );
  }, [providerHost, repos, handleRepositorySelect]);

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
        return <UserTitle account={account} />;
      case "starred":
        return <StarredTitle />;
    }
  }, [account, org, type]);

  const onChange = React.useCallback(
    (_: any, opened: boolean) => {
      setExpanded(opened);
    },
    [setExpanded]
  );

  return (
    <ListItem>
      <Accordion sx={{ width: "100%", minWidth: "550px" }} onChange={onChange}>
        <AccordionSummary expandIcon={<ExpandMore />}>{title}</AccordionSummary>
        <AccordionActions>
          <Input
            placeholder="Filter Repositories"
            fullWidth
            disabled={isLoading}
            onChange={(e) =>
              onFilterChange(e as React.ChangeEvent<HTMLInputElement>)
            }
          />
          <ButtonGroup
            size="small"
            color="primary"
            sx={{ flexShrink: 0 }}
            disabled={isLoading}
          >
            <Button onClick={() => handleSelectAll()}>Select All</Button>
            <Button onClick={() => handleSelectNone()}>Select None</Button>
          </ButtonGroup>
        </AccordionActions>
        <AccordionDetails>
          {isLoading && <LinearProgress />}
          {!isLoading && repos.length === 0 && (
            <Typography>No Repositories</Typography>
          )}
          {!isLoading && repos.length > 0 && <List>{repoList}</List>}
        </AccordionDetails>
      </Accordion>
    </ListItem>
  );
};

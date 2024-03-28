import { Drawer, List, Typography } from "@mui/material";
import React from "react";
import { Organization } from "./models/Organization";
import { ConfigContext } from "./App";
import { RepoSettingAccordion } from "./components/RepoSettingAccordion";

export type SettingsDrawerProps = {
  opened: boolean;
  onClose: () => void;
};

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  opened,
  onClose,
}) => {
  const [orgs, setOrgs] = React.useState<Organization[]>([]);
  const { octokit } = React.useContext(ConfigContext);

  React.useEffect(() => {
    if(octokit) octokit?.getOrganizations().then((orgs) => setOrgs(orgs.data));
  }, [octokit]);

  const orgList = React.useMemo(() => orgs.map((org) => (
    <RepoSettingAccordion key={org.id} org={org} type="org" />
  )), [orgs]);

  return (
    <Drawer anchor="left" open={opened} onClose={() => onClose()}>
      <Typography variant="h5" sx={{ m:3 }}>
        Organizations: 
      </Typography>
      <List sx={{ mr: 2, gap: 2 }}>
        <RepoSettingAccordion type="user" />
        <RepoSettingAccordion type="starred" />
        {orgList}
      </List>
    </Drawer>
  );
};

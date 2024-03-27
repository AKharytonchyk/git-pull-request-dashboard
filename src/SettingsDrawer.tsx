import { Refresh } from "@mui/icons-material";
import { Drawer, Button, List, Typography } from "@mui/material";
import React from "react";
import { OrganizationSetting } from "./components/OrganizationSetting";
import { Organization } from "./models/Organization";
import { ConfigContext } from "./App";

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
    <OrganizationSetting key={org.id} org={org} />
  )), [orgs]);

  return (
    <Drawer anchor="left" open={opened} onClose={() => onClose()}>
      <Typography variant="h5" sx={{ m:3 }}>
        Organizations: 
      </Typography>
      <List sx={{ mr: 2, gap: 2 }}>
        {orgList}
      </List>
    </Drawer>
  );
};

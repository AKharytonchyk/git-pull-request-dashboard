import { Drawer, List, Typography } from "@mui/material";
import React from "react";
import { Organization } from "./models/Organization";
import { ConfigContext } from "./App";
import { RepoSettingAccordion } from "./components/RepoSettingAccordion";
import { useQuery } from "@tanstack/react-query";

export type SettingsDrawerProps = {
  opened: boolean;
  onClose: () => void;
};

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  opened,
  onClose,
}) => {
  const { octokit } = React.useContext(ConfigContext);
  const { data: orgs = [] } = useQuery({
    queryKey: ["orgs"],
    queryFn: async () => {
      if (!octokit) return;
      const orgs = await octokit.getOrganizations();
      return orgs.data as Organization[];
    },
    enabled: !!octokit,
  });

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

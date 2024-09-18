import { Box, Drawer, List, Switch, Typography } from "@mui/material";
import React from "react";
import { Organization } from "./models/Organization";
import { ConfigContext } from "./App";
import { RepoSettingAccordion } from "./components/RepoSettingAccordion";
import { useQuery } from "@tanstack/react-query";
import { ExportSettings } from "./components/ExportSettings";

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

  const [showRawSettings, setShowRawSettings] = React.useState(false);

  const orgList = React.useMemo(() => orgs.map((org) => (
    <RepoSettingAccordion key={org.id} org={org} type="org" />
  )), [orgs]);

  const handleClose = React.useCallback(() => {
    setShowRawSettings(false);
    onClose();
  }, [onClose]);

  return (
    <Drawer anchor="left" open={opened} onClose={handleClose}>
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
        <Typography variant="h5" sx={{ m: 3, mr: 'auto' }}>
          Organizations:
        </Typography>
        <Typography variant="body1" sx={{ m: 3 }}>
          Show Raw Settings
        </Typography>
        <Switch onChange={() => setShowRawSettings((prev) => !prev)} />
      </Box>
      <Box sx={{ minWidth: 600, mr: 2, gap: 2 }}>
        <ExportSettings isOpen={showRawSettings} />
        <List sx={{ mr: 2, gap: 2, display: showRawSettings ? 'none' : 'block' }}>
          <RepoSettingAccordion type="user" />
          <RepoSettingAccordion type="starred" />
          {orgList}
        </List>
      </Box>
    </Drawer>
  );
};

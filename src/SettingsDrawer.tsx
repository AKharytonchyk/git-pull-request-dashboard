import { Box, Drawer, List, Switch, Typography } from "@mui/material";
import React from "react";
import { Organization } from "./models/Organization";
import { ConfigContext } from "./context/ConfigContext";
import { RepoSettingAccordion } from "./components/RepoSettingAccordion";
import { useQuery } from "@tanstack/react-query";
import { ExportSettings } from "./components/ExportSettings";
import type { GitAccountClient } from "./context/ConfigContext";

export type SettingsDrawerProps = {
  opened: boolean;
  onClose: () => void;
};

const AccountRepositorySettings: React.FC<{ entry: GitAccountClient }> = ({
  entry,
}) => {
  const { data: orgs = [] } = useQuery({
    queryKey: ["orgs", entry.account.provider.host],
    queryFn: async () => {
      const orgs = await entry.client.getOrganizations();
      return orgs.data as Organization[];
    },
    enabled: true,
  });

  const orgList = React.useMemo(
    () =>
      orgs.map((org) => (
        <RepoSettingAccordion
          key={`${entry.account.provider.host}:${org.id}`}
          account={entry.account}
          client={entry.client}
          org={org}
          type="org"
        />
      )),
    [entry.account, entry.client, orgs]
  );

  return (
    <>
      <Typography variant="h6" sx={{ mx: 3, mt: 2 }}>
        {entry.account.provider.host}
      </Typography>
      <RepoSettingAccordion
        account={entry.account}
        client={entry.client}
        type="user"
      />
      <RepoSettingAccordion
        account={entry.account}
        client={entry.client}
        type="starred"
      />
      {orgList}
    </>
  );
};

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  opened,
  onClose,
}) => {
  const { clients } = React.useContext(ConfigContext);

  const [showRawSettings, setShowRawSettings] = React.useState(false);

  const accountLists = React.useMemo(
    () =>
      clients.map((entry) => (
        <AccountRepositorySettings
          key={entry.account.provider.host}
          entry={entry}
        />
      )),
    [clients]
  );

  const handleClose = React.useCallback(() => {
    setShowRawSettings(false);
    onClose();
  }, [onClose]);

  return (
    <Drawer anchor="left" open={opened} onClose={handleClose}>
      <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
        <Typography variant="h5" sx={{ m: 3, mr: "auto" }}>
          Organizations:
        </Typography>
        <Typography variant="body1" sx={{ m: 3 }}>
          Show Raw Settings
        </Typography>
        <Switch onChange={() => setShowRawSettings((prev) => !prev)} />
      </Box>
      <Box sx={{ minWidth: 600, mr: 2, gap: 2 }}>
        <ExportSettings isOpen={showRawSettings} />
        <List
          sx={{ mr: 2, gap: 2, display: showRawSettings ? "none" : "block" }}
        >
          {accountLists}
        </List>
      </Box>
    </Drawer>
  );
};

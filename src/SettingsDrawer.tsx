import { Refresh } from "@mui/icons-material";
import { Drawer, Button, Stack, Box } from "@mui/material";
import React from "react";
import { GitService } from "./service/gitService";
import { OrganizationSetting } from "./OrganizationSetting";

export type SettingsDrawerProps = {
  opened: boolean;
  octokit: GitService;
  onClose: () => void;
};

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  opened,
  octokit,
  onClose,
}) => {
  const [orgs, setOrgs] = React.useState<any[]>([]);
  const getOrganizations = React.useCallback(() => {
    octokit.getOrganizations().then((orgs) => setOrgs(orgs.data));
  }, [octokit]);

  React.useEffect(() => {
    octokit.getOrganizations().then((orgs) => setOrgs(orgs.data));
  }, [octokit]);

  return (
    <Drawer anchor="left" open={opened} onClose={() => onClose()}>
      <Button variant="text" color="inherit" onClick={() => getOrganizations()}>
        <Refresh />
      </Button>
      <Stack sx={{ mr: 2, gap: 2 }}>
        {orgs?.map((org) => (
          <Box
            key={org.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "flex-start",
            }}
          >
            <OrganizationSetting org={org} octokit={octokit} />
          </Box>
        ))}
      </Stack>
    </Drawer>
  );
};

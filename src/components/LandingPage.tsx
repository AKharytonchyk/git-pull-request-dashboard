import React, { useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import PATSetupGuide from "./PATSetupGuide";
import RepositorySetupGuide from "./RepositorySetupGuide";

function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <>{children}</>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
    color: "primary",
  };
}

export default function LandingPage({ auth = false }) {
  const [value, setValue] = useState(0);

  const handleChange = (_: any, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ my: 4 }}>
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="simple tabs example"
            centered
          >
            <Tab label="General Info" {...a11yProps(0)} />
            <Tab label="Guide: How to Set Up PAT" {...a11yProps(1)} />
            <Tab label="Guide: How to Select Repos" {...a11yProps(2)} />
          </Tabs>
        </AppBar>
        {!auth ? (
          <TabPanel value={value} index={0}>
            <Typography variant="h6" gutterBottom>
              Welcome to the GitHub PR Dashboard
            </Typography>
            <Typography paragraph>
              This tool helps you to effortlessly monitor pull requests across
              all your GitHub repositories in one unified dashboard. Ideal for
              developers who contribute to or manage multiple projects, it
              simplifies staying on top of your PRs without the need to switch
              between repositories.
            </Typography>
            <Typography paragraph>
              Ready to simplify your GitHub workflow? Let's get started.
            </Typography>
          </TabPanel>
        ) : (
          <TabPanel value={value} index={0}>
            <Typography variant="h6" gutterBottom>
              Welcome to the GitHub PR Dashboard
            </Typography>
            <Typography paragraph>
              You are already authenticated with GitHub. However, you are either didn't configure projects
              you want to monitor or this project do not have any opened pull requests.
            </Typography>
            <Typography paragraph>
              Please review the following guides to configure your dashboard.
            </Typography>
          </TabPanel>
        )}

        <TabPanel value={value} index={1}>
          <Typography variant="h6" gutterBottom color={"inherit"}>
            How to Set Up PAT
          </Typography>
          <PATSetupGuide />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Typography variant="h6" gutterBottom>
            How to Select Repos
          </Typography>
          <RepositorySetupGuide />
        </TabPanel>
      </Paper>
    </Container>
  );
}

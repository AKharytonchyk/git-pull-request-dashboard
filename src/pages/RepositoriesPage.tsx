import React, { useEffect } from "react";
import { ConfigContext } from "../context/ConfigContext";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { Typography } from "@mui/material";
import { RepositoryCard } from "../components/Cards/RepositoryCard";

export const RepositoriesPage: React.FC = () => {
  const { repositorySettings, user } = React.useContext(ConfigContext);
  const [activeRepositories, setActiveRepositories] = React.useState<string[]>(
    []
  );

  useEffect(() => {
    setActiveRepositories(
      Object.keys(repositorySettings)
        .filter((key) => repositorySettings[key])
        .sort()
    );
  }, [repositorySettings]);

  if (!user) {
    return (
      <Box padding={2} width={"calc(100vw - 2em)"}>
        <Typography component="p">
          You need to be logged in to view your pull requests
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ xl: 4 }}>
      {activeRepositories.map((repo) => (
        <Grid size={{ xs: 12, lg: 6 }} key={repo}>
          <RepositoryCard name={repo} />
        </Grid>
      ))}
    </Grid>
  );
};

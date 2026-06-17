import React from "react";
import { ConfigContext } from "../context/ConfigContext";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { Typography } from "@mui/material";
import { RepositoryCard } from "../components/Cards/RepositoryCard";
import { useActiveRepositories } from "../hooks/useActiveRepositories";

export const RepositoriesPage: React.FC = () => {
  const { clients, repositorySettings, accounts } = React.useContext(ConfigContext);
  const activeRepositories = useActiveRepositories(repositorySettings, clients);

  if (accounts.length === 0) {
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
        <Grid size={{ xs: 12, lg: 6 }} key={repo.key}>
          <RepositoryCard name={repo.key} />
        </Grid>
      ))}
    </Grid>
  );
};

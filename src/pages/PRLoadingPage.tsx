import React from "react";
import { CircularProgress, Typography, Box } from "@mui/material";

export const PRLoadingPage: React.FC = () => {
  return (
    <>
      <Box
        component={"img"}
        src="loading.webp"
        alt="Loading Image"
        width={400}
        height={400}
        marginBottom={2}
      />
      <Typography variant="h4" align="center" marginTop={2}>
        Loading your PRs... <CircularProgress size={32} />
      </Typography>
      <Typography variant="subtitle1" align="center" marginTop={1}>
        Hang tight! We're fetching your pull requests faster than you can say
        "Merge Conflict"!
      </Typography>
    </>
  );
};

export default PRLoadingPage;

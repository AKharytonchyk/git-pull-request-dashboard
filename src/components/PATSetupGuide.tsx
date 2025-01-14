// PATSetupGuide.js
import { Typography, Box } from "@mui/material";

const PATSetupGuide = () => {
  return (
    <>
      <Typography paragraph>
        A Personal Access Token (PAT) on GitHub allows third-party applications
        to interact with your GitHub account securely. Follow these steps to
        create a PAT:
      </Typography>
      <Box sx={{ my: 2 }}>
        <Typography variant="body1" component="div">
          1. Log in to your GitHub account.
        </Typography>
        <Typography variant="body1" component="div">
          2. Click on your profile icon in the upper-right corner of any GitHub
          page, then click <strong>Settings</strong>.
        </Typography>
        <Typography variant="body1" component="div">
          3. In the left sidebar, click <strong>Developer settings</strong>.
        </Typography>
        <Typography variant="body1" component="div">
          4. In the left sidebar, click <strong>Personal access tokens</strong>,
          then click <strong>Generate new token</strong>.
        </Typography>
        <Typography variant="body1" component="div">
          5. Give your token a descriptive name.
        </Typography>
        <Typography variant="body1" component="div">
          6. Select the scopes or permissions you'd like to grant this token. To
          monitor pull requests across your repositories, select{" "}
          <strong>repo</strong> and <strong>read:org</strong>.
        </Typography>
        <Typography variant="body1" component="div">
          7. Click <strong>Generate token</strong>.
        </Typography>
        <Typography paragraph>
          After clicking <strong>Generate token</strong>, make sure to copy your
          new personal access token. You won’t be able to see it again!
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Note: Treat your tokens like passwords and keep them secret. Do not
          share your tokens.
        </Typography>
      </Box>
    </>
  );
};

export default PATSetupGuide;

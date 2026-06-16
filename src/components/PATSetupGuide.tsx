import { Typography, Box } from "@mui/material";

const PATSetupGuide = () => {
  return (
    <>
      <Typography component="p">
        The dashboard supports GitHub OAuth. Choose GitHub.com or GitHub
        Enterprise in the header, then use the GitHub login button to authorize
        the configured OAuth app once.
      </Typography>
      <Box sx={{ my: 2 }}>
        <Typography variant="body1" component="div">
          1. For GitHub.com, keep the GitHub selector active.
        </Typography>
        <Typography variant="body1" component="div">
          2. For GitHub Enterprise, select the enterprise option and enter the
          tenant host, such as <strong>pinkroccade.ghe.com</strong>.
        </Typography>
        <Typography variant="body1" component="div">
          3. Click the GitHub login button and authorize the OAuth app.
        </Typography>
        <Typography variant="body1" component="div">
          4. The dashboard will use your account permissions to list the
          repositories you can access.
        </Typography>
        <Typography component="p">
          OAuth sessions are stored in a secure server-side cookie, and GitHub
          API requests are proxied for the signed-in user.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Personal access token login remains available from the key icon when
          enabled for local development or unusual enterprise setups.
        </Typography>
      </Box>
    </>
  );
};

export default PATSetupGuide;

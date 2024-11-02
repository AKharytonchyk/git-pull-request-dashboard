// PATSetupGuide.js
import React from 'react';
import { Typography, Box } from '@mui/material';
import { Settings } from '@mui/icons-material';

const Outline: React.FC<{text: string}> = ({text}) => {
  return (
    <div>
      <span>{text}</span>
    </div>
  )
}

const PATSetupGuide = () => {
  return (
    <>
      <Typography paragraph>
        To be able to see pull request you would need to pick the project first. Follow these steps to configure your projects:
      </Typography>
      <Box sx={{ my: 2 }}>
        <Typography variant="body1" component="div">
          1. Click on <strong>Settings</strong> icon in the upper-right corner of the page. <Settings/>
        </Typography>
        <Typography variant="body1" component="div">
          2. Select any Organization from the list. 
        </Typography>
        <Typography variant="body1" component="div">
          3. Wait until the repositories are loaded.
        </Typography>
        <Typography variant="body1" component="div">
          4. Click a single <strong>Repository</strong> name to select it.
        </Typography>
        <Typography variant="body1" component="div">
          5. Click <strong>Select All</strong> or <strong>Remove All</strong> button to select or deselect all repositories.
        </Typography>
        <Typography variant="body1" component="div">
          6. Use filter to search for specific repository.
        </Typography>
        <Typography variant="body1" component="div">
          7. When finished just click outside the dialog to close it.
        </Typography>
        <Typography paragraph sx={{marginTop: 2}}>
          All the selection would be saved automatically in your browser. As soon as you select the repositories you would be able to see the pull requests if any are available.
        </Typography>

        <Outline text={"Note: \nABC"}/>
      </Box>
    </>
  );
};

export default PATSetupGuide;

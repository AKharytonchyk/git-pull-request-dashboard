import { CheckBoxOutlineBlank, CheckBoxOutlined } from "@mui/icons-material";
import {
  Button,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Typography,
} from "@mui/material";
import React from "react";
import { Repository } from "../models/Repository";
import { ConfigContext } from "../context/ConfigContext";

export type RepositorySelectorProps = {
  repository: Repository;
};

const Action: React.FC<{ onUndo: () => void }> = ({ onUndo }) => (
  <React.Fragment>
    <Button color="secondary" size="small" onClick={onUndo}>
      UNDO
    </Button>
  </React.Fragment>
);

export const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  repository,
}) => {
  const { repositorySettings, handleRepositorySelect } =
    React.useContext(ConfigContext);

  const [open, setOpen] = React.useState(false);

  const handleSelect = React.useCallback(() => {
    handleRepositorySelect(
      repository.full_name,
      !repositorySettings[repository.full_name]
    );
    setOpen(true);
  }, [handleRepositorySelect, repository, repositorySettings]);

  const handleUndo = React.useCallback(() => {
    handleRepositorySelect(
      repository.full_name,
      !repositorySettings[repository.full_name]
    );
    setOpen(false);
  }, [handleRepositorySelect, repository, repositorySettings]);

  const handleClose = React.useCallback((e: any) => {
    e?.stopPropagation();
    e?.preventDefault();
    setOpen(false);
  }, []);

  const message = React.useMemo(() => {
    return repositorySettings[repository.full_name] ? (
      <Typography>
        Repository <strong>{repository.name.toUpperCase()}</strong> was moved to
        the top of the list
      </Typography>
    ) : (
      <Typography>
        Repository <strong>{repository.name.toUpperCase()}</strong> was moved to
        the bottom of the list
      </Typography>
    );
  }, [repository, repositorySettings]);

  return (
    <ListItemButton key={repository.id} onClick={handleSelect}>
      <ListItemText primary={repository.full_name} />
      <ListItemIcon>
        {repositorySettings[repository.full_name] ? (
          <CheckBoxOutlined color="primary" />
        ) : (
          <CheckBoxOutlineBlank />
        )}
      </ListItemIcon>
      <Snackbar
        open={open}
        onClose={handleClose}
        message={message}
        autoHideDuration={2000}
        action={<Action onUndo={handleUndo} />}
      />
    </ListItemButton>
  );
};

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
import { repositoryKey } from "../utils/repositoryKeys";

export type RepositorySelectorProps = {
  providerHost: string;
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
  providerHost,
  repository,
}) => {
  const { repositorySettings, handleRepositorySelect } =
    React.useContext(ConfigContext);

  const [open, setOpen] = React.useState(false);
  const key = React.useMemo(
    () => repositoryKey(providerHost, repository.full_name),
    [providerHost, repository.full_name]
  );

  const handleSelect = React.useCallback(() => {
    handleRepositorySelect(
      key,
      !repositorySettings[key]
    );
    setOpen(true);
  }, [handleRepositorySelect, key, repositorySettings]);

  const handleUndo = React.useCallback(() => {
    handleRepositorySelect(
      key,
      !repositorySettings[key]
    );
    setOpen(false);
  }, [handleRepositorySelect, key, repositorySettings]);

  const handleClose = React.useCallback((e: any) => {
    e?.stopPropagation();
    e?.preventDefault();
    setOpen(false);
  }, []);

  const message = React.useMemo(() => {
    return repositorySettings[key] ? (
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
  }, [key, repository, repositorySettings]);

  return (
    <ListItemButton key={repository.id} onClick={handleSelect}>
      <ListItemText primary={repository.full_name} />
      <ListItemIcon>
        {repositorySettings[key] ? (
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

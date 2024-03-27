import { CheckBoxOutlineBlank, CheckBoxOutlined } from "@mui/icons-material";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import React from "react";
import { Repository } from "../models/Repository";
import { ConfigContext } from "../App";

export type RepositorySelectorProps = {
  repository: Repository;
};

export const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  repository,
}) => {
  const { repositorySettings, handleRepositorySelect } =
    React.useContext(ConfigContext);

  return (
    <ListItemButton
      key={repository.id}
      onClick={() =>
        handleRepositorySelect(
          repository.full_name,
          !repositorySettings[repository.full_name]
        )
      }
    >
      <ListItemText primary={repository.full_name} />
      <ListItemIcon>
        {repositorySettings[repository.full_name] ? (
          <CheckBoxOutlined color="primary" />
        ) : (
          <CheckBoxOutlineBlank />
        )}
      </ListItemIcon>
    </ListItemButton>
  );
};

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import JsonViewEditor from "@uiw/react-json-view/editor";
import React, { useEffect, useMemo } from "react";
import { githubLightTheme } from "@uiw/react-json-view/githubLight";
import { IconButton, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { ConfigContext } from "../App";

export type ExportSettingsProps = {
  isOpen: boolean;
};

export const ExportSettings: React.FC<ExportSettingsProps> = ({ isOpen }) => {
  const [inputSettings, setInputSettings] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [isValidJson, setIsValidJson] = React.useState<boolean>(true);
  const { repositorySettings, saveRawSettings } =
    React.useContext(ConfigContext);

  const rows = useMemo(() => {
    const settingsKeysCount = Object.keys(repositorySettings).length;
    return settingsKeysCount > 0 ? settingsKeysCount + 2 : 4;
  }, [repositorySettings]);

  useEffect(() => {
    setInputSettings(JSON.stringify(repositorySettings, null, 2));
  }, [repositorySettings]);

  useEffect(() => {
    if (isOpen) return;

    setIsEditing(false);
    setIsValidJson(true);
    setError("");
    setInputSettings(JSON.stringify(repositorySettings, null, 2));
  }, [isOpen, repositorySettings]);

  const regexKey = /^[A-Za-z0-9-]+\/[A-Za-z0-9.\-_]+$/;

  const validateJson = (input: string) => {
    try {
      const parsedJson = JSON.parse(input);

      for (const key in parsedJson) {
        if (!regexKey.test(key) || typeof parsedJson[key] !== "boolean") {
          throw new Error(
            `Invalid key or value. Key: "${key}", Value: ${parsedJson[key]}`,
          );
        }
      }

      setIsValidJson(true);
      setError("");
    } catch (error: any) {
      setIsValidJson(false);
      setError(error.message);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputSettings(value);
    validateJson(value);
  };

  const onSave = () => {
    if (!isValidJson) return;

    try {
      const parsedJson = JSON.parse(inputSettings) as Record<string, boolean>;
      saveRawSettings(parsedJson);
      setIsEditing(false);
      setError("");
    } catch (error: any) {
      setError(error.message);
    }
  };

  const onClick = () => {
    if (isEditing) {
      onSave();
    } else {
      setIsEditing((prev) => !prev);
    }
  };

  if (!isOpen) return null;

  return (
    <Box component="form" noValidate autoComplete="off" sx={{ mr: 1, mb: 2 }}>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            widows: "100%",
          }}
        >
          <Typography variant="body1">RAW Settings</Typography>
          <IconButton aria-label="close" onClick={onClick} disabled={!!error}>
            {isEditing ? <SaveIcon /> : <EditIcon />}
          </IconButton>
        </Box>
        {error && (
          <Typography color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}
      </Box>
      {isEditing ? (
        <TextField
          error={!isValidJson}
          label="JSON"
          value={inputSettings}
          fullWidth
          multiline
          rows={rows}
          onChange={onChange}
          sx={{
            fontSize: 13,
            fontFamily:
              '-apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
          }}
        />
      ) : (
        <JsonViewEditor
          editable={true}
          value={repositorySettings}
          style={githubLightTheme}
          displayDataTypes={false}
        />
      )}
    </Box>
  );
};

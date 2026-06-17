import { Business, GitHub, Key, Login } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import React from "react";

export type UnAuthHeaderProps = {
  loading?: boolean;
  onOAuthLogin: (providerHost?: string) => void;
  onPatLogin?: (token: string, providerHost?: string) => void;
};

export const UnAuthHeader: React.FC<UnAuthHeaderProps> = ({
  loading = false,
  onOAuthLogin,
  onPatLogin,
}) => {
  const [providerType, setProviderType] = React.useState<"github" | "enterprise">("github");
  const [enterpriseHost, setEnterpriseHost] = React.useState("");
  const [token, setToken] = React.useState("");
  const [showPatLogin, setShowPatLogin] = React.useState(false);

  const providerHost = providerType === "github" ? "github.com" : enterpriseHost;
  const enterpriseHostMissing = providerType === "enterprise" && !enterpriseHost.trim();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 1,
        alignItems: "center",
        justifyContent: "end",
        flexWrap: "wrap",
      }}
    >
      <ToggleButtonGroup
        exclusive
        size="small"
        value={providerType}
        onChange={(_event, value) => value && setProviderType(value)}
        aria-label="GitHub provider"
      >
        <ToggleButton value="github" aria-label="GitHub.com">
          <GitHub fontSize="small" />
        </ToggleButton>
        <ToggleButton value="enterprise" aria-label="GitHub Enterprise">
          <Business fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>
      {providerType === "enterprise" && (
        <TextField
          size="small"
          sx={{ width: { xs: "180px", sm: "240px" } }}
          label="Enterprise host"
          placeholder="your-tenant.ghe.com"
          variant="standard"
          value={enterpriseHost}
          onChange={(event) => setEnterpriseHost(event.target.value)}
        />
      )}
      <Button
        variant="text"
        color="inherit"
        startIcon={<Login />}
        disabled={loading || enterpriseHostMissing}
        onClick={() => onOAuthLogin(providerHost)}
      >
        Log in with GitHub
      </Button>
      {onPatLogin && (
        <Tooltip title="Token login">
          <IconButton
            color="inherit"
            size="small"
            onClick={() => setShowPatLogin((value) => !value)}
            aria-label="Token login"
          >
            <Key fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {showPatLogin && onPatLogin && (
        <>
          <TextField
            size="small"
            sx={{ width: { xs: "180px", sm: "300px" } }}
            label="Token"
            type="password"
            variant="standard"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
          <Button
            variant="text"
            color="inherit"
            disabled={loading || !token}
            onClick={() => onPatLogin(token, providerHost)}
          >
            Log In
          </Button>
        </>
      )}
    </Box>
  );
};

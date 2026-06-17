import React from "react";
import { GitService } from "../service/gitService";
import { AuthenticatedUser, AuthProvider } from "../models/Auth";

export const ConfigContext = React.createContext<{
  octokit: GitService | null;
  repositorySettings: Record<string, boolean>;
  handleRepositorySelect: (repository: string, selected: boolean) => void;
  saveRawSettings: (settings: Record<string, boolean> | undefined) => void;
  user?: AuthenticatedUser;
  provider?: AuthProvider;
}>({
  octokit: null,
  repositorySettings: {},
  handleRepositorySelect: () => {},
  saveRawSettings: () => {},
});

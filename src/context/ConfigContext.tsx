import React from "react";
import { GitService } from "../service/gitService";

export const ConfigContext = React.createContext<{
  octokit: GitService | null;
  repositorySettings: Record<string, boolean>;
  handleRepositorySelect: (repository: string, selected: boolean) => void;
  saveRawSettings: (settings: Record<string, boolean> | undefined) => void;
  user?: { login: string; avatar_url: string; url: string };
}>({
  octokit: null,
  repositorySettings: {},
  handleRepositorySelect: () => {},
  saveRawSettings: () => {},
});

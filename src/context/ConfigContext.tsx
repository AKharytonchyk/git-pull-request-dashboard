import React from "react";
import { GitService } from "../service/gitService";
import { AuthenticatedUser, AuthProvider, AuthSession } from "../models/Auth";

export type GitAccountClient = {
  account: AuthSession;
  client: GitService;
};

export const ConfigContext = React.createContext<{
  octokit: GitService | null;
  clients: GitAccountClient[];
  accounts: AuthSession[];
  repositorySettings: Record<string, boolean>;
  handleRepositorySelect: (repository: string, selected: boolean) => void;
  saveRawSettings: (settings: Record<string, boolean> | undefined) => void;
  getClientForProvider: (providerHost?: string) => GitService | null;
  user?: AuthenticatedUser;
  provider?: AuthProvider;
}>({
  octokit: null,
  clients: [],
  accounts: [],
  repositorySettings: {},
  handleRepositorySelect: () => {},
  saveRawSettings: () => {},
  getClientForProvider: () => null,
});

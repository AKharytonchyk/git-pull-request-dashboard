import React from "react";
import type { GitAccountClient } from "../context/ConfigContext";
import { parseRepositoryKey, RepositoryReference } from "../utils/repositoryKeys";

export type ActiveRepository = RepositoryReference & {
  client: GitAccountClient["client"];
};

export function useActiveRepositories(
  repositorySettings: Record<string, boolean>,
  clients: GitAccountClient[]
): ActiveRepository[] {
  return React.useMemo(() => {
    const defaultProviderHost = clients[0]?.account.provider.host ?? "github.com";
    const clientsByHost = new Map(
      clients.map((client) => [client.account.provider.host, client])
    );

    return Object.keys(repositorySettings)
      .filter((key) => repositorySettings[key])
      .map((key) => parseRepositoryKey(key, defaultProviderHost))
      .map((repository) => {
        const client = clientsByHost.get(repository.providerHost)?.client;
        return client ? { ...repository, client } : null;
      })
      .filter((repository): repository is ActiveRepository => repository !== null)
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [clients, repositorySettings]);
}

export type RepositoryReference = {
  providerHost: string;
  fullName: string;
  key: string;
};

export function repositoryKey(providerHost: string, fullName: string): string {
  return `${providerHost}:${fullName}`;
}

export function parseRepositoryKey(
  value: string,
  fallbackProviderHost = "github.com"
): RepositoryReference {
  const separatorIndex = value.indexOf(":");
  const hasHostPrefix =
    separatorIndex > 0 && value.slice(separatorIndex + 1).includes("/");
  const providerHost = hasHostPrefix
    ? value.slice(0, separatorIndex)
    : fallbackProviderHost;
  const fullName = hasHostPrefix ? value.slice(separatorIndex + 1) : value;

  return {
    providerHost,
    fullName,
    key: repositoryKey(providerHost, fullName),
  };
}

export function repositoryRoute(providerHost: string, fullName: string): string {
  return `/repositories/${encodeURIComponent(providerHost)}/${fullName}`;
}

import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { ConfigContext } from '../context/ConfigContext';

// Hook for repository data
export function useRepositoryData(repositoryName: string, enabled = true) {
  const { octokit } = useContext(ConfigContext);

  const pullRequestsQuery = useQuery({
    queryKey: ['pulls', repositoryName],
    queryFn: () => octokit!.getPullRequests(repositoryName),
    enabled: enabled && !!repositoryName && !!octokit
  });

  const issuesQuery = useQuery({
    queryKey: ['issues', repositoryName],
    queryFn: () => octokit!.getIssues(repositoryName),
    enabled: enabled && !!repositoryName && !!octokit
  });

  const repositoryQuery = useQuery({
    queryKey: ['repository', repositoryName],
    queryFn: () => octokit!.getRepository(repositoryName),
    enabled: enabled && !!repositoryName && !!octokit
  });

  return {
    pullRequests: pullRequestsQuery.data || [],
    issues: issuesQuery.data || [],
    repository: repositoryQuery.data,
    isLoading: pullRequestsQuery.isLoading || issuesQuery.isLoading || repositoryQuery.isLoading,
    error: pullRequestsQuery.error || issuesQuery.error || repositoryQuery.error,
  };
}

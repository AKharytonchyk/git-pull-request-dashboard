import React, { Suspense, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';

export const LazyDashboard = lazy(() => import('../pages/Dashboard'));
export const LazyIssuesPage = lazy(() => import('../pages/IssuesPage'));
export const LazyCoverage = lazy(() => import('../pages/Coverage'));
export const LazyMyPullRequests = lazy(() => import('../pages/MyPullRequests').then(module => ({ default: module.MyPullRequests })));
export const LazyRepositoriesPage = lazy(() => import('../pages/RepositoriesPage').then(module => ({ default: module.RepositoriesPage })));
export const LazyRepositoryItem = lazy(() => import('../pages/RepositoryItem').then(module => ({ default: module.RepositoryItem })));

interface LoadingFallbackProps {
  message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = "Loading..." 
}) => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="200px"
    flexDirection="column"
    gap={2}
  >
    <CircularProgress />
    <span>{message}</span>
  </Box>
);

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({ 
  children, 
  fallback = <LoadingFallback /> 
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

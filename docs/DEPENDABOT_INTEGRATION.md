# Dependabot Vulnerability Integration

This document explains how to integrate and use the Dependabot vulnerability detection features in the GitHub PR Dashboard.

## Overview

The GitHub PR Dashboard now supports retrieving vulnerability information from Dependabot alerts, similar to what you see on GitHub's security pages (e.g., `https://github.com/ORG/REPO/security/dependabot`).

## Features

### 🔍 **Vulnerability Detection**
- Retrieve Dependabot alerts for individual repositories
- Get organization-wide vulnerability summaries
- Filter alerts by severity, state, ecosystem, and more
- Check if Dependabot is enabled for a repository

### 📊 **Security Metrics**
- Count vulnerabilities by severity (Critical, High, Medium, Low)
- Track alert states (Open, Dismissed, Fixed, Auto-dismissed)
- Analyze vulnerabilities by ecosystem (npm, pip, maven, etc.)
- Generate security summaries for dashboards

## API Requirements

### Authentication & Permissions

To access Dependabot alerts, you need:

1. **Token Scopes**: 
   - `security_events` scope (recommended)
   - OR `public_repo` scope (for public repositories only)

2. **Repository Permissions**:
   - Read access to the repository
   - Security alerts access (if private repository)

3. **Organization Permissions** (for org-wide alerts):
   - Organization owner OR security manager role

### GitHub Enterprise Support

✅ **Fully Compatible** with GitHub Enterprise Server (GHE)
- Works with any GHE instance that supports Dependabot
- Automatically detects GHE API endpoints
- Same API structure as GitHub.com

## Usage Examples

### 1. Basic Repository Vulnerability Check

```typescript
import { GitService } from './service/gitService';

const gitService = new GitService(apiUrl, token);

// Check if Dependabot is enabled
const isEnabled = await gitService.isDependabotEnabled('owner/repo');

if (isEnabled) {
  // Get all vulnerabilities
  const alerts = await gitService.getDependabotAlerts('owner/repo');
  console.log(`Found ${alerts.length} vulnerabilities`);
}
```

### 2. Get Vulnerability Summary

```typescript
// Get aggregated vulnerability counts
const summary = await gitService.getDependabotAlertsSummary('owner/repo');

console.log(`Total vulnerabilities: ${summary.total}`);
console.log(`Critical: ${summary.by_severity.critical}`);
console.log(`High: ${summary.by_severity.high}`);
console.log(`Open: ${summary.open}`);
```

### 3. Filter Vulnerabilities

```typescript
// Get only high and critical severity open vulnerabilities
const criticalAlerts = await gitService.getDependabotAlerts('owner/repo', {
  state: 'open',
  severity: 'high,critical',
  sort: 'created',
  direction: 'desc'
});

// Get only npm vulnerabilities
const npmAlerts = await gitService.getDependabotAlerts('owner/repo', {
  ecosystem: 'npm',
  state: 'open'
});
```

### 4. Organization-Wide Security Analysis

```typescript
// Get all vulnerabilities across an organization
const orgAlerts = await gitService.getOrganizationDependabotAlerts('my-org', {
  state: 'open',
  severity: 'high,critical'
});

// Group by repository
const byRepo = orgAlerts.reduce((acc, alert) => {
  const repo = alert.repository?.full_name || 'unknown';
  acc[repo] = (acc[repo] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
```

## Data Structure

### DependabotAlert Interface

```typescript
interface DependabotAlert {
  number: number;                    // Alert ID
  state: 'open' | 'dismissed' | 'fixed' | 'auto_dismissed';
  dependency: {
    package: {
      ecosystem: string;             // npm, pip, maven, etc.
      name: string;                  // Package name
    };
    manifest_path: string;           // Path to dependency file
    scope: 'development' | 'runtime';
  };
  security_advisory: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    summary: string;                 // Vulnerability description
    cve_id: string | null;          // CVE identifier
    cvss: {
      score: number;                 // CVSS score (0-10)
      vector_string: string;
    };
  };
  created_at: string;
  updated_at: string;
  html_url: string;                  // Link to GitHub alert page
}
```

## Integration Examples

### Dashboard Component (React Query + Performance Optimized)

```typescript
// components/VulnerabilityIndicator.tsx
import React, { useContext, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOnScreen } from '../hooks/useOnScreen';

interface VulnerabilityIndicatorProps {
  repositoryFullName: string;
  compact?: boolean;
}

export const VulnerabilityIndicator: React.FC<VulnerabilityIndicatorProps> = ({ 
  repositoryFullName, 
  compact = false 
}) => {
  const { octokit } = useContext(ConfigContext);
  const ref = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(ref);
  
  const enabled = useMemo(
    () => isOnScreen && octokit !== undefined && repositoryFullName !== undefined,
    [isOnScreen, octokit, repositoryFullName]
  );

  const { data: summary, isLoading, error } = useQuery<DependabotAlertSummary>({
    queryKey: ["dependabot-alerts", repositoryFullName],
    queryFn: async () => {
      if (octokit) {
        return octokit.getDependabotAlertsSummary(repositoryFullName);
      }
      throw new Error("No octokit instance available");
    },
    enabled: enabled,
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors (permission issues)
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - vulnerability data doesn't change frequently
  });

  // Handle different error types including 403 access denied
  const getErrorInfo = () => {
    if (!error) return null;
    
    const errorObj = error as any;
    
    if (errorObj?.status === 403) {
      return {
        icon: <LockIcon />,
        label: "Access Denied",
        tooltip: "You don't have access to security alerts for this repository. Contact the repository owner to grant access.",
        color: 'default' as const
      };
    }
    
    if (errorObj?.status === 404) {
      return {
        icon: <WarningIcon />,
        label: "Not Found", 
        tooltip: "Repository not found or Dependabot is not enabled",
        color: 'default' as const
      };
    }
    
    return {
      icon: <WarningIcon />,
      label: "Error",
      tooltip: "Failed to load vulnerability information",
      color: 'default' as const
    };
  };

  const errorInfo = getErrorInfo();

  if (errorInfo) {
    return (
      <div ref={ref}>
        <Tooltip title={errorInfo.tooltip}>
          <Chip
            icon={errorInfo.icon}
            label={errorInfo.label}
            size="small"
            color={errorInfo.color}
            variant="outlined"
          />
        </Tooltip>
      </div>
    );
  }

  if (!summary) {
    return (
      <div ref={ref}>
        <AsyncChip
          isLoading={isLoading}
          label="Security"
          size="small"
          tooltip="Loading vulnerability information..."
          color="default"
        />
      </div>
    );
  }

  // ... rest of component logic
};
```

### Repository Card Enhancement (Performance Optimized)

```typescript
// Add to existing RepositoryCard component
import { VulnerabilityIndicator } from '../VulnerabilityIndicator';

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ name }) => {
  const { octokit } = React.useContext(ConfigContext);
  const ref = React.useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(ref);
  
  // Other existing queries...
  
  return (
    <Card ref={ref}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LanguageIcon language={repoData?.language} />
          <Typography variant="h6">{name}</Typography>
          
          {/* Add vulnerability indicator */}
          {repoData && (
            <VulnerabilityIndicator 
              repositoryFullName={repoData.full_name} 
              compact={true} 
            />
          )}
        </Box>
        
        {/* Rest of existing card content */}
      </CardContent>
    </Card>
  );
};
```

## User Interface Integration

### Repository Cards (Dashboard)

The vulnerability indicator appears on each repository card with a clean, progressive disclosure pattern:

- **Compact Mode**: Shows a single chip in the repository card header with the most critical vulnerability level
- **Expand Button**: Click the expand icon next to the chip to reveal detailed breakdown
- **Expanded View**: Detailed vulnerability breakdown appears below the repository card header
- **Color Coding**: Critical (red), High (orange), Medium (blue), Low (gray), Secure (green)
- **Lazy Loading**: Only loads when the card is visible on screen
- **Caching**: Results are cached for 5 minutes to improve performance
- **Clickable Links**: Each chip links directly to the filtered Dependabot security page

### Repository Detail Page

The individual repository page (`/repositories/{owner}/{repo}`) displays:

- **Full Vulnerability Panel**: Complete breakdown of all vulnerability levels
- **Always Visible**: Non-collapsible detailed view
- **Real-time Updates**: Automatically refetches when navigating to the page

### Error Handling

The UI gracefully handles various error states:

- **403 Forbidden**: Shows "Access Denied" with helpful tooltip
- **404 Not Found**: Shows "Not Found" indicating Dependabot may not be enabled
- **Network Errors**: Shows generic "Error" state with retry capability
- **Loading States**: Displays loading indicators during API calls

### Performance Optimizations

- **Intersection Observer**: Uses `useOnScreen` hook for lazy loading
- **React Query**: Provides caching, background updates, and automatic retries
- **Debounced Requests**: Prevents excessive API calls
- **Stale-while-revalidate**: Shows cached data while fetching updates

## Error Handling

### Common Error Scenarios

1. **Access Denied (403) - Proper Handling**
   ```typescript
   // The component automatically handles 403 errors
   const { data: summary, isLoading, error } = useQuery<DependabotAlertSummary>({
     queryKey: ["dependabot-alerts", repositoryFullName],
     queryFn: async () => {
       return octokit.getDependabotAlertsSummary(repositoryFullName);
     },
     retry: (failureCount, error: any) => {
       // Don't retry on 401/403 errors (permission issues)
       if (error?.status === 401 || error?.status === 403) {
         return false;
       }
       return failureCount < 2;
     },
   });

   // Error display
   if (error?.status === 403) {
     return (
       <Chip
         icon={<LockIcon />}
         label="Access Denied"
         tooltip="You don't have access to security alerts for this repository"
         color="default"
         variant="outlined"
       />
     );
   }
   ```

2. **Dependabot Disabled/Not Found (404)**
   ```typescript
   if (error?.status === 404) {
     return (
       <Chip
         icon={<WarningIcon />}
         label="Not Found"
         tooltip="Repository not found or Dependabot is not enabled"
         color="default"
         variant="outlined"
       />
     );
   }
   ```

3. **Rate Limiting (Automatic Retry)**
   ```typescript
   // React Query handles rate limiting automatically with exponential backoff
   // The component shows loading state during retries
   ```

## Performance Considerations

### Optimized Loading with React Query + useOnScreen

The `VulnerabilityIndicator` component is optimized for performance:

```typescript
// Only fetch data when component is visible on screen
const ref = useRef<HTMLDivElement>(null);
const isOnScreen = useOnScreen(ref);

const enabled = useMemo(
  () => isOnScreen && octokit !== undefined && repositoryFullName !== undefined,
  [isOnScreen, octokit, repositoryFullName]
);

const { data: summary, isLoading, error } = useQuery<DependabotAlertSummary>({
  queryKey: ["dependabot-alerts", repositoryFullName],
  queryFn: async () => {
    return octokit.getDependabotAlertsSummary(repositoryFullName);
  },
  enabled: enabled,
  staleTime: 5 * 60 * 1000, // 5 minutes cache
  retry: (failureCount, error: any) => {
    // Smart retry logic - don't retry permission errors
    if (error?.status === 401 || error?.status === 403) {
      return false;
    }
    return failureCount < 2;
  },
});
```

### Benefits

1. **Lazy Loading**: Only fetches vulnerability data when component is visible
2. **Caching**: React Query automatically caches results for 5 minutes
3. **Smart Retries**: Doesn't retry on permission errors (401/403)
4. **Deduplication**: Multiple components requesting same data share single request
5. **Background Updates**: Automatically refetches stale data in background

### Batch Processing

For organization-wide analysis:

```typescript
// Process repositories in batches to avoid rate limits
const processInBatches = async (repositories: string[], batchSize = 10) => {
  const results = [];
  
  for (let i = 0; i < repositories.length; i += batchSize) {
    const batch = repositories.slice(i, i + batchSize);
    const batchPromises = batch.map(repo => 
      gitService.getDependabotAlertsSummary(repo)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
};
```

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Optional: Enable vulnerability features
VITE_ENABLE_VULNERABILITIES=true

# Optional: Default vulnerability filters
VITE_VULNERABILITY_MIN_SEVERITY=medium
VITE_VULNERABILITY_SHOW_DISMISSED=false
```

### Token Configuration

Ensure your GitHub token has the required scopes:

```typescript
// Check token scopes
const user = await gitService.testAuthentication();
const scopes = user.headers?.['x-oauth-scopes']?.split(', ') || [];

if (!scopes.includes('security_events') && !scopes.includes('public_repo')) {
  throw new Error('Token needs security_events scope for vulnerability access');
}
```

## Troubleshooting

### Common Issues

1. **"Access denied to Dependabot alerts"**
   - Check token has `security_events` scope
   - Verify repository permissions
   - Ensure Dependabot is enabled on the repository

2. **"Repository not found"**
   - Repository might be private without access
   - Check organization permissions

3. **Empty results**
   - Repository might not have any dependencies
   - Dependabot might not be configured
   - All alerts might be dismissed or fixed

### Debug Mode

Enable debug logging for vulnerability requests:

```typescript
const gitService = new GitService(apiUrl, token, { debug: true });
```

## Security Best Practices

1. **Scope Limitation**: Only request `security_events` scope when needed
2. **Data Sanitization**: Sanitize vulnerability descriptions before display
3. **Access Control**: Implement proper authorization checks
4. **Rate Limiting**: Respect GitHub API rate limits
5. **Error Handling**: Don't expose sensitive error information

## Future Enhancements

- **Webhook Integration**: Real-time vulnerability notifications
- **Trend Analysis**: Track vulnerability trends over time
- **Custom Filters**: User-defined vulnerability filters
- **Export Features**: Export vulnerability reports
- **Integration**: Connect with other security tools

## Related Links

- [GitHub Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [GitHub REST API - Dependabot alerts](https://docs.github.com/en/rest/dependabot/alerts)
- [GitHub Token Scopes](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)

### 🔗 Clickable Security Links

All vulnerability chips are now clickable and will redirect users to the repository's Dependabot security page with appropriate severity filters. The URLs are dynamically generated based on the configured GitHub instance:

#### Dynamic URL Generation
The security URLs are automatically derived from the GitHub API configuration:

- **GitHub.com**: `api.github.com` → `github.com`
- **GitHub Enterprise**: `ghe.example.com/api/v3` → `ghe.example.com`

#### URL Structure
```
{baseWebUrl}/{repositoryFullName}/security/dependabot?q=is%3Aopen+severity%3A{severity}
```

#### Examples

**GitHub.com**:
- **Critical vulnerabilities**: `https://github.com/owner/repo/security/dependabot?q=is%3Aopen+severity%3Acritical`
- **High vulnerabilities**: `https://github.com/owner/repo/security/dependabot?q=is%3Aopen+severity%3Ahigh`
- **All open vulnerabilities**: `https://github.com/owner/repo/security/dependabot?q=is%3Aopen`

**GitHub Enterprise**:
- **Critical vulnerabilities**: `https://ghe.example.com/owner/repo/security/dependabot?q=is%3Aopen+severity%3Acritical`
- **High vulnerabilities**: `https://ghe.example.com/owner/repo/security/dependabot?q=is%3Aopen+severity%3Ahigh`
- **All open vulnerabilities**: `https://ghe.example.com/owner/repo/security/dependabot?q=is%3Aopen`

#### User Experience
- **Click any vulnerability chip** to open the filtered Dependabot page in a new tab
- **Severity-specific filtering** automatically applied based on the chip clicked
- **Environment-aware** URLs automatically adapt to GitHub.com or GitHub Enterprise
- **Maintain context** with the expand/collapse functionality while providing direct access
- **No navigation interference** - links open in new tabs to preserve the dashboard view

#### Fallback Behavior
If URL parsing fails or no GitHub service is available, the system gracefully falls back to GitHub.com URLs.

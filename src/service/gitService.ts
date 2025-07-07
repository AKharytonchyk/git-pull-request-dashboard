import { Octokit } from "@octokit/rest";
import rateLimiter from "../utils/RateLimiterQueue";
import { PullRequest } from "../models/PullRequest";
import { Issue } from "../models/Issue";
import {
  DependabotAlert,
  DependabotAlertSummary,
  DependabotAlertsOptions,
} from "../models/DependabotAlert";

export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "GitHubAPIError";
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public resetTime?: Date
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class GitService {
  private readonly octokit: Octokit;
  private readonly baseUrl: string;
  
  constructor(baseUrl: string, token: string) {
    this.baseUrl = !baseUrl.endsWith("/")
      ? baseUrl
      : baseUrl.substring(0, baseUrl.length - 1);
    this.octokit = new Octokit({
      baseUrl: this.baseUrl,
      auth: token,
    });
  }

  getPulls(owner: string, repo: string) {
    return rateLimiter.enqueue(() => this.octokit.pulls.list({ owner, repo }));
  }

  async getPullRequests(repo: string): Promise<PullRequest[]> {
    try {
      const [owner, name] = repo.split("/");
      const response = await this.getPulls(owner, name);

      return response.data
        .map((pr: any) => pr as PullRequest)
        .map((pr) => ({ ...pr, created_at: new Date(pr.created_at) }));
    } catch (error) {
      this.handleAPIError(error);
    }
  }

  async getIssues(fullName: string): Promise<Issue[]> {
    try {
      const [owner, name] = fullName.split("/");
      const issues = await this.getRepoIssues(owner, name);
      return issues.data?.length
        ? issues.data
            .filter(({ pull_request }: any) => !pull_request)
            .map((issue: any) => issue as Issue)
        : [];
    } catch (error) {
      this.handleAPIError(error);
    }
  }

  testAuthentication(): Promise<any> {
    try {
      return this.octokit.users.getAuthenticated();
    } catch (error) {
      this.handleAPIError(error);
    }
  }

  async getOrganizations(): Promise<any> {
    try {
      return await rateLimiter.enqueue(() =>
        this.octokit.orgs.listForAuthenticatedUser()
      );
    } catch (error) {
      this.handleAPIError(error);
    }
  }

  async getRepos(owner: string): Promise<any[]> {
    try {
      const repos = await rateLimiter.enqueue(() =>
        this.octokit.paginate(this.octokit.repos.listForOrg, {
          org: owner,
          type: "all",
          per_page: 100,
          timeout: 5000,
        })
      );

      return repos
        .filter((repo: any) => !repo.archived)
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
    } catch (error) {
      this.handleAPIError(error);
    }
  }

  async getRepository(fullName: string): Promise<any> {
    try {
      const [owner, name] = fullName.split("/");
      const response = await rateLimiter.enqueue(() =>
        this.octokit.repos.get({ owner, repo: name })
      );

      return response.data;
    } catch (error) {
      this.handleAPIError(error);
    }
  }

  async getStaredRepos() {
    return rateLimiter.enqueue(() =>
      this.octokit.paginate(
        this.octokit.activity.listReposStarredByAuthenticatedUser,
        { per_page: 100, timeout: 5000 }
      )
    );
  }

  /**
   * Get repositories for authenticated user with configurable options
   * @param options Configuration options for repository fetching
   */
  async getUserRepositories(options: {
    type?: 'all' | 'owner' | 'public' | 'private' | 'member';
    visibility?: 'all' | 'public' | 'private';
    affiliation?: string;
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    includeArchived?: boolean;
  } = {}) {
    const {
      type = 'all',
      visibility = 'all',
      affiliation = 'owner,collaborator,organization_member',
      sort = 'updated',
      direction = 'desc',
      includeArchived = false
    } = options;

    const repos = await rateLimiter.enqueue(() =>
      this.octokit.paginate(this.octokit.repos.listForAuthenticatedUser, {
        per_page: 100,
        timeout: 5000,
        type,
        visibility,
        affiliation,
        sort,
        direction,
      })
    );

    // Filter out archived repositories if not requested
    return includeArchived ? repos : repos.filter((repo: any) => !repo.archived);
  }

  async getPRChecksStatus(owner: string, repo: string, prNumber: number) {
    return rateLimiter.enqueue(
      () =>
        this.octokit.checks.listForRef({
          owner,
          repo,
          ref: `pull/${prNumber}/head`,
          filter: "latest",
        }),
      true
    );
  }

  async hasMergeConflict(owner: string, repo: string, prNumber: number) {
    const mergeConflicts = await rateLimiter.enqueue(
      () =>
        this.octokit.pulls.get({
          owner,
          repo,
          pull_number: prNumber,
        }),
      true
    );
    return mergeConflicts.data;
  }

  async getPRApprovals(owner: string, repo: string, prNumber: number) {
    const reviews = await rateLimiter.enqueue(
      () =>
        this.octokit.pulls.listReviews({
          owner,
          repo,
          pull_number: prNumber,
        }),
      true
    );

    if (
      !reviews.data ||
      !Array.isArray(reviews.data) ||
      reviews.data.length === 0
    ) {
      return [];
    }

    return Object.values(
      reviews.data.reduce(
        (acc: any, review: any) => {
          if (
            !acc[review.user.login] ||
            new Date(acc[review.user.login].submitted_at) <
              new Date(review.submitted_at)
          ) {
            acc[review.user.login] = review;
          }
          return acc;
        },
        {} as Record<string, any>
      )
    );
  }

  /**
   * Get Dependabot alerts for a repository
   * Requires 'security_events' scope or 'public_repo' scope for public repositories
   */
  async getDependabotAlerts(
    fullName: string,
    options: DependabotAlertsOptions = {}
  ): Promise<DependabotAlert[]> {
    try {
      const [owner, repo] = fullName.split("/");

      // Build query parameters
      const params = new URLSearchParams();
      if (options.state) params.append("state", options.state);
      if (options.severity) params.append("severity", options.severity);
      if (options.ecosystem) params.append("ecosystem", options.ecosystem);
      if (options.package) params.append("package", options.package);
      if (options.manifest) params.append("manifest", options.manifest);
      if (options.scope) params.append("scope", options.scope);
      if (options.sort) params.append("sort", options.sort);
      if (options.direction) params.append("direction", options.direction);
      if (options.per_page)
        params.append("per_page", options.per_page.toString());
      if (options.page) params.append("page", options.page.toString());

      const queryString = params.toString();
      const url = `/repos/${owner}/${repo}/dependabot/alerts${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await rateLimiter.enqueue(() =>
        this.octokit.request(`GET ${url}`, {
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        })
      );

      return response.data as DependabotAlert[];
    } catch (error: any) {
      // Handle specific Dependabot API errors
      if (error.status === 403) {
        throw new GitHubAPIError(
          "Access denied to Dependabot alerts - check if you have 'security_events' scope or repository permissions",
          403,
          "DEPENDABOT_ACCESS_DENIED"
        );
      }
      this.handleAPIError(error);
    }
  }

  /**
   * Get a summary of Dependabot alerts for a repository
   * This provides aggregated vulnerability counts without fetching all alerts
   */
  async getDependabotAlertsSummary(
    fullName: string
  ): Promise<DependabotAlertSummary> {
    try {
      // Fetch all alerts to generate summary (GitHub API doesn't provide a summary endpoint)
      const alerts = await this.getDependabotAlerts(fullName);

      const summary: DependabotAlertSummary = {
        total: alerts.length,
        open: 0,
        dismissed: 0,
        fixed: 0,
        auto_dismissed: 0,
        by_severity: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
        },
        by_ecosystem: {},
      };

      alerts.forEach((alert) => {
        // Count by state
        summary[alert.state]++;

        // Count by severity
        summary.by_severity[alert.security_advisory.severity]++;

        // Count by ecosystem
        const ecosystem = alert.dependency.package.ecosystem;
        summary.by_ecosystem[ecosystem] = (summary.by_ecosystem[ecosystem] || 0) + 1;
      });

      return summary;
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  /**
   * Get Dependabot alerts for an organization
   * Requires organization owner or security manager permissions
   */
  async getOrganizationDependabotAlerts(
    org: string,
    options: DependabotAlertsOptions = {}
  ): Promise<DependabotAlert[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (options.state) params.append("state", options.state);
      if (options.severity) params.append("severity", options.severity);
      if (options.ecosystem) params.append("ecosystem", options.ecosystem);
      if (options.package) params.append("package", options.package);
      if (options.scope) params.append("scope", options.scope);
      if (options.sort) params.append("sort", options.sort);
      if (options.direction) params.append("direction", options.direction);
      if (options.per_page)
        params.append("per_page", options.per_page.toString());
      if (options.page) params.append("page", options.page.toString());

      const queryString = params.toString();
      const url = `/orgs/${org}/dependabot/alerts${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await rateLimiter.enqueue(() =>
        this.octokit.request(`GET ${url}`, {
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        })
      );

      return response.data as DependabotAlert[];
    } catch (error: any) {
      if (error.status === 403) {
        throw new GitHubAPIError(
          "Access denied to organization Dependabot alerts - you must be an organization owner or security manager",
          403,
          "ORG_DEPENDABOT_ACCESS_DENIED"
        );
      }
      this.handleAPIError(error);
    }
  }

  /**
   * Check if a repository has Dependabot alerts enabled
   * This is a helper method to determine if vulnerability data is available
   */
  async isDependabotEnabled(fullName: string): Promise<boolean> {
    try {
      // Try to fetch alerts - if successful, Dependabot is enabled
      await this.getDependabotAlerts(fullName, { per_page: 1 });
      return true;
    } catch (error: any) {
      // If we get a 403 with specific error about Dependabot access, it might be disabled
      if (error.code === "DEPENDABOT_ACCESS_DENIED") {
        return false;
      }
      // For other errors, assume it's enabled but we don't have access
      return true;
    }
  }

  private async getRepoIssues(owner: string, repo: string) {
    return rateLimiter.enqueue(() =>
      this.octokit.issues.listForRepo({
        owner,
        repo,
        state: "open",
        per_page: 100,
      })
    );
  }

  /**
   * Get the base web URL from the API URL
   * For GitHub.com: api.github.com -> github.com
   * For GHE: ghe.example.com/api/v3 -> ghe.example.com
   */
  getBaseWebUrl(): string {
    try {
      const url = new URL(this.baseUrl);
      
      // For GitHub.com
      if (url.hostname === 'api.github.com') {
        return 'https://github.com';
      }
      
      // For GitHub Enterprise - remove /api/v3 path if present
      const webUrl = new URL(url.origin);
      return webUrl.toString().replace(/\/$/, ''); // Remove trailing slash
    } catch (error) {
      // Fallback to GitHub.com if URL parsing fails
      console.warn('Failed to parse base URL, falling back to github.com:', error);
      return 'https://github.com';
    }
  }

  private handleAPIError(error: any): never {
    if (error.status === 401) {
      throw new GitHubAPIError("Invalid or expired GitHub token", 401, "UNAUTHORIZED");
    } else if (error.status === 403) {
      if (error.message.includes("rate limit")) {
        const resetTime = error.response?.headers?.["x-ratelimit-reset"] 
          ? new Date(parseInt(error.response.headers["x-ratelimit-reset"]) * 1000)
          : undefined;
        throw new RateLimitError("GitHub API rate limit exceeded", resetTime);
      }
      throw new GitHubAPIError("Access forbidden - check your token permissions", 403, "FORBIDDEN");
    } else if (error.status === 404) {
      throw new GitHubAPIError("Repository or resource not found", 404, "NOT_FOUND");
    } else if (error.status >= 500) {
      throw new GitHubAPIError("GitHub API server error", error.status, "SERVER_ERROR");
    } else {
      throw new GitHubAPIError(`GitHub API error: ${error.message}`, error.status);
    }
  }
}

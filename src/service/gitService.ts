import { Octokit } from "@octokit/rest";
import rateLimiter from "../utils/RateLimiterQueue";
import { PullRequest } from "../models/PullRequest";
import { Issue } from "../models/Issue";

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
  constructor(baseUrl: string, token: string) {
    this.octokit = new Octokit({
      baseUrl: !baseUrl.endsWith("/")
        ? baseUrl
        : baseUrl.substring(0, baseUrl.length - 1),
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

  async getUserRepos() {
    return rateLimiter.enqueue(() =>
      this.octokit.paginate(this.octokit.repos.listForAuthenticatedUser, {
        per_page: 100,
        timeout: 5000,
        type: "owner",
      })
    );
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

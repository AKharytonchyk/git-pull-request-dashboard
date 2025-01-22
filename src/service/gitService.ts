import { Octokit } from "@octokit/rest";
import rateLimiter from "../utils/RateLimiterQueue";

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

  async getPullRequests(repo: string) {
    const [owner, name] = repo.split("/");
    const response = this.getPulls(owner, name);

    return (await response).data;
  }

  testAuthentication() {
    return this.octokit.users.getAuthenticated();
  }

  getOrganizations() {
    return rateLimiter.enqueue(() =>
      this.octokit.orgs.listForAuthenticatedUser(),
    );
  }

  async getRepos(owner: string) {
    const repos = await rateLimiter.enqueue(() =>
      this.octokit.paginate(this.octokit.repos.listForOrg, {
        org: owner,
        type: "all",
        per_page: 100,
        timeout: 5000,
      }),
    );

    return repos
      .filter((repo) => !repo.archived)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getStaredRepos() {
    return rateLimiter.enqueue(() =>
      this.octokit.paginate(
        this.octokit.activity.listReposStarredByAuthenticatedUser,
        { per_page: 100, timeout: 5000 },
      ),
    );
  }

  async getUserRepos() {
    return rateLimiter.enqueue(() =>
      this.octokit.paginate(this.octokit.repos.listForAuthenticatedUser, {
        per_page: 100,
        timeout: 5000,
        type: "owner",
      }),
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
      true,
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
      true,
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
      true,
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
        {} as Record<string, any>,
      ),
    );
  }

  async getIssues(owner: string, repo: string) {
    return rateLimiter.enqueue(() =>
      this.octokit.issues.listForRepo({
        owner,
        repo,
        state: "open",
      })
    ).then((response) => response.data);
  }
}

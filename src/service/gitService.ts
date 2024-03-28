import { Octokit } from "@octokit/rest";


export class GitService {
  private readonly octokit: Octokit;
  constructor(private readonly baseUrl: string, private readonly token: string) {
    this.octokit = new Octokit({
      baseUrl,
      auth: token,
    });
  }

  getPulls(owner: string, repo: string) {
    return this.octokit.pulls.list({owner, repo, state: "open"});
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
    return this.octokit.orgs.listForAuthenticatedUser();
  }

  async getRepos(owner: string) {
    const repos = await this.octokit.paginate(this.octokit.repos.listForOrg, {org: owner, per_page: 100, timeout: 5000});
    return repos.filter((repo) => !repo.archived).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getStaredRepos() {
    return this.octokit.paginate(this.octokit.activity.listReposStarredByAuthenticatedUser, {per_page: 100, timeout: 5000});
  }

  async getUserRepos() {
    return this.octokit.paginate(this.octokit.repos.listForAuthenticatedUser, {per_page: 100, timeout: 5000, type: "owner"});
  }

  async getPRChecksStatus(owner: string, repo: string, prNumber: number) {
    return this.octokit.checks.listForRef({owner, repo, ref: `pull/${prNumber}/head`, filter: "latest"});
  }

  async getPRApprovals(owner: string, repo: string, prNumber: number) {
    const reviews = await this.octokit.pulls.listReviews({owner, repo, pull_number: prNumber});

    return reviews.data.reduce((acc: any, review: any) => {
      if (!acc[review.user.login] || new Date(acc[review.user.login].submitted_at) < new Date(review.submitted_at)) {
        acc[review.user.login] = review;
      }
      return acc;
    }, {} as Record<string, any>).values();
  }
}
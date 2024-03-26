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
    return this.octokit.pulls.list({owner, repo});
  }

  testAuthentication() {
    return this.octokit.users.getAuthenticated();
  }

  getOrganizations() {
    return this.octokit.orgs.listForAuthenticatedUser();
  }

  getRepos(owner: string) {
    return this.octokit.repos.listForOrg({org: owner});
  }
}
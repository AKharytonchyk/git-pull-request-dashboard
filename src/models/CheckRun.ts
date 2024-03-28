export type CheckRun = {
  id: number;
  name: string;
  node_id: string;
  head_sha: string;
  external_id: string | null;
  url: string;
  html_url: string | null;
  details_url: string | null;
  status: string;
  conclusion: string | null;
  started_at: string | null;
  completed_at: string | null;
};

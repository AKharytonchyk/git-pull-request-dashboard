import { User } from "./User";

export type Approvals = {
  id:                 number;
  node_id:            string;
  user:               User;
  body:               string;
  state:              string;
  html_url:           string;
  pull_request_url:   string;
  author_association: string;
  submitted_at:       string | null;
  commit_id:          string;
}
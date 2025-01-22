import { User as Assignee, PullRequest, Label } from "./PullRequest";

export type Issue = {
  id: number;
  node_id: string;
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  number: number;
  state: string;
  title: string;
  body: string;
  user: Assignee;
  labels: Label[];
  assignee: Assignee;
  assignees: Assignee[];
  milestone: Milestone;
  locked: boolean;
  active_lock_reason: string;
  comments: number;
  pull_request: PullRequest;
  closed_at: null;
  created_at: Date;
  updated_at: Date;
  closed_by: Assignee;
  author_association: string;
  state_reason: string;
};

export type Reactions = {
  url: string;
  total_count: number;
  "+1": number;
  "-1": number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
};

export type Milestone = {
  url: string;
  html_url: string;
  labels_url: string;
  id: number;
  node_id: string;
  number: number;
  state: string;
  title: string;
  description: string;
  creator: Assignee;
  open_issues: number;
  closed_issues: number;
  created_at: Date;
  updated_at: Date;
  closed_at: Date;
  due_on: Date;
};

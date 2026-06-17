export type Repository = {
  providerHost?: string;
  repositoryKey?: string;
  id: number;
  name: string;
  full_name: string;
  url: string;
  html_url: string;
  description: string | null;
};

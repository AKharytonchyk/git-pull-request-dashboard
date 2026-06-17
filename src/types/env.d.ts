/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_API_URL?: string;
  readonly VITE_GITHUB_AVATAR_URL?: string;
  readonly VITE_GITHUB_BASE_URL?: string;
  readonly VITE_MAX_REQUESTS_PER_MINUTE?: string;
  readonly VITE_ENABLE_PAT_LOGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

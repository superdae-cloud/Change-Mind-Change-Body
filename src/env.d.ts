/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly ANTHROPIC_API_KEY: string;
  readonly ADMIN_USERNAME: string;
  readonly ADMIN_PASSWORD: string;
  readonly SESSION_SECRET: string;
  readonly GITHUB_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

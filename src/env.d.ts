/// <reference types="astro/client" />

interface NetlifyIdentityUser {
  email: string;
  jwt(): Promise<string>;
}

interface NetlifyIdentityWidget {
  on(event: string, callback: (...args: any[]) => void): void;
  open(tab?: string): void;
  close(): void;
  currentUser(): NetlifyIdentityUser | null;
}

interface Window {
  netlifyIdentity?: NetlifyIdentityWidget;
}

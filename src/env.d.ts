/// <reference types="astro/client" />

interface NetlifyIdentityWidget {
  on(event: string, callback: (...args: any[]) => void): void;
  open(tab?: string): void;
  close(): void;
}

interface Window {
  netlifyIdentity?: NetlifyIdentityWidget;
}

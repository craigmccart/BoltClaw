/**
 * Shared API helper that attaches the BoltClaw auth token to every request.
 *
 * The token arrives in the authenticated URL printed at startup
 * (http://localhost:3000?token=...). It is taken out of the address bar
 * straight away and kept in sessionStorage, so it lasts for this browser tab
 * (including reloads) and is gone when the tab closes. The server never
 * embeds the token in the page. If there is no token, main.tsx shows a
 * sign-in notice instead of the app.
 */

declare global {
  interface Window {
    __BOLTCLAW_TOKEN__?: string;
  }
}

const STORAGE_KEY = "boltclaw-token";

function readStored(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage blocked (private mode, strict settings)
  }
}

function store(token: string): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Fall back to the in-memory copy only.
  }
}

export function getToken(): string | null {
  // A token in the URL always wins, so opening a fresh authenticated URL
  // replaces a stale one from an earlier server run.
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get("token");
  if (urlToken) {
    window.__BOLTCLAW_TOKEN__ = urlToken;
    store(urlToken);
    // Strip token from URL so it doesn't leak into browser history or referer
    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url.toString());
    return urlToken;
  }

  if (window.__BOLTCLAW_TOKEN__) return window.__BOLTCLAW_TOKEN__;

  const stored = readStored();
  if (stored) {
    window.__BOLTCLAW_TOKEN__ = stored;
    return stored;
  }

  return null;
}

/**
 * Drop-in replacement for fetch() that attaches the auth token.
 * Same signature as window.fetch.
 */
export async function apiFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("x-boltclaw-token", token);
  }
  return fetch(input, { ...init, headers });
}

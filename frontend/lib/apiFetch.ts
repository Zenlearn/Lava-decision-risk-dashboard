/**
 * apiFetch — drop-in replacement for fetch() that auto-refreshes the access
 * token on 401 and retries once. If the refresh itself fails (expired refresh
 * token or network error) the caller gets the original 401 response so it can
 * redirect to sign-in.
 *
 * Background: PathwaysBackend issues 1h access tokens. Lava re-issues them as
 * its own cookie at sign-in, but the cookie maxAge is 30 days. After 1h the
 * cookie still exists so middleware thinks the user is logged in, but all API
 * calls return 401. /api/v1/auth/refresh proxies to PathwaysBackend's
 * /auth/generate-token and rotates both cookies.
 */

let refreshInFlight: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
    if (refreshInFlight) return refreshInFlight;
    refreshInFlight = fetch('/api/v1/auth/refresh', { method: 'POST' })
        .then((r) => r.ok)
        .catch(() => false)
        .finally(() => { refreshInFlight = null; });
    return refreshInFlight;
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const response = await fetch(input, init);
    if (response.status !== 401) return response;

    const refreshed = await attemptRefresh();
    if (!refreshed) return response;

    return fetch(input, init);
}

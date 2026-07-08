/**
 * Next.js Edge Middleware — Lava Decision Risk Frontend
 *
 * Runs on every request before the page renders.
 * Provides a lightweight redirect gate: if a protected route is accessed
 * without the `token` cookie, the user is sent to `/signin?redirect=<path>`.
 *
 * The `token` cookie is set by PathwaysBackend on login (same shared JWT).
 * Users who are already signed into ZenLearn will already have this cookie
 * and can access Lava dashboards without a separate login.
 *
 * Protection strategy:
 *   - Public: explicit paths in PUBLIC_PATHS (auth flows, root landing)
 *   - All other routes require the `token` cookie
 *
 * Security note: Presence of the `token` cookie is checked here, not its validity.
 * Full JWT verification happens on the backend API for every protected API call.
 * The `token` cookie is HttpOnly — not accessible to JavaScript.
 *
 * Adapted from Micro/middleware.ts — same cookie-gate pattern.
 */
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = new Set([
	'/signin',
]);

function isPublic(pathname: string): boolean {
	if (PUBLIC_PATHS.has(pathname)) return true;
	// OG/Twitter image routes are always public (social media crawlers)
	const ogMatch = pathname.match(/^(.+)\/(opengraph-image|twitter-image)(\.[a-z0-9]+)?$/i);
	if (ogMatch) {
		const parent = ogMatch[1];
		if (PUBLIC_PATHS.has(parent ?? '')) return true;
	}
	return false;
}

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// Always allow Next.js internals and static assets
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/favicon') ||
		pathname.startsWith('/api')
	) {
		return NextResponse.next();
	}

	if (isPublic(pathname)) return NextResponse.next();

	// The backend sets an HttpOnly cookie named 'token'.
	// Presence is sufficient for the redirect gate — actual JWT validation
	// happens on the API server for every protected API call.
	const token = req.cookies.get('token');
	if (!token?.value) {
		const loginUrl = req.nextUrl.clone();
		loginUrl.pathname = '/signin';
		loginUrl.searchParams.set('redirect', pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|json|mp4|pdf)).*)'],
};

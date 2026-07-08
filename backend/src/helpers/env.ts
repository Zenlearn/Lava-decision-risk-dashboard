/**
 * Type-safe environment variable accessor.
 *
 * WHY: `process.env.FOO` returns `string | undefined`. Casting with `as string`
 * or using `!` silences TypeScript but allows `undefined` to slip through at
 * runtime, causing hard-to-debug errors (e.g., signing JWTs with `undefined`).
 *
 * `getEnvVar()` throws at the call site with a clear message if the variable
 * is not set, making misconfigured deployments fail fast and loudly.
 *
 * USAGE:
 *   import { getEnvVar } from '../helpers/env';
 *   const secret = getEnvVar('JWT_SECRET');
 *
 * For optional variables (with a default):
 *   const port = getEnvVar('PORT', '3010');
 *
 * Copied from PathwaysBackend/backend/src/helpers/env.ts — keep in sync.
 */
export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;
  if (value === undefined) {
    throw new Error(
      `FATAL: Required environment variable "${name}" is not set. ` +
      `Check your .env file or deployment configuration.`
    );
  }
  return value;
}

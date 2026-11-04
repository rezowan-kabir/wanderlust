import { headers } from "next/headers";

import { auth } from "./auth";

/**
 * Resolve the Better Auth session for the current request, or `null` when the
 * caller is not signed in. Route handlers use this to read the *verified*
 * user identity (id, name, email) instead of trusting anything in the body.
 */
export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

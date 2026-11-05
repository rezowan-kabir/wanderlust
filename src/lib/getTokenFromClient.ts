import { authClient } from "@/lib/auth-client";

/**
 * Helper function to get the current session auth token safely.
 * Throws an error if the user is not authenticated or token cannot be fetched.
 */
export async function getTokenFromClient(): Promise<string> {
  const { data, error } = await authClient.token();
  const token = data?.token;

  if (error || !token) {
    throw new Error("Unable to retrieve session token. Please log in.");
  }

  return token;
}
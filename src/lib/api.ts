/**
 * Base URL of the external package API.
 *
 * Lives in its own module because `travel-packages.ts` is marked `"use client"`;
 * a Server Component importing a value from that file receives a client-reference
 * stub instead of the string, which breaks any `fetch` built from it.
 */
const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

export const API_BASE_URL = (
  configuredApiBaseUrl || "http://localhost:8000"
).replace(/\/+$/, "");

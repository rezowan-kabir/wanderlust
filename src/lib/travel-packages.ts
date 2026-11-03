"use client";

import { useSyncExternalStore } from "react";

/** Base URL of the external package API, e.g. http://localhost:8000. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type TravelPackage = {
  id: string;
  destinationName: string;
  country: string;
  category: string;
  price: number;
  duration: string;
  departureDate: string;
  imageUrl: string;
  description: string;
  /** Shown as a badge on destination cards; absent means the package has no rating. */
  rating?: number;
};

export type TravelPackagesResult = {
  packages: TravelPackage[];
  /** Non-null when the API could not be reached and saved packages were used. */
  error: string | null;
};

type TravelPackagesSnapshot = TravelPackagesResult;

const STORAGE_KEY = "wanderlust.travel-packages";
const emptyPackages: TravelPackage[] = [];
const apiErrorMessage =
  "Could not reach the travel packages API. Showing packages saved in this browser.";
const serverSnapshot: TravelPackagesSnapshot = {
  packages: emptyPackages,
  error: null,
};
let snapshot = serverSnapshot;
let initialized = false;
let storageListening = false;
const listeners = new Set<() => void>();

function isTravelPackage(value: unknown): value is TravelPackage {
  if (typeof value !== "object" || value === null) return false;

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.id === "string" &&
    typeof entry.destinationName === "string" &&
    typeof entry.country === "string" &&
    typeof entry.category === "string" &&
    typeof entry.price === "number" &&
    Number.isFinite(entry.price) &&
    entry.price >= 0 &&
    typeof entry.duration === "string" &&
    typeof entry.departureDate === "string" &&
    typeof entry.imageUrl === "string" &&
    typeof entry.description === "string"
  );
}

function normalizeRating(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

function normalizePackages(raw: unknown[]): TravelPackage[] {
  return raw.map((value, index) => {
    if (isTravelPackage(value)) {
      const rating = normalizeRating(value.rating);
      return rating === undefined ? value : { ...value, rating };
    }

    if (typeof value !== "object" || value === null) {
      throw new Error(`Destination at index ${index} has an invalid format.`);
    }

    const entry = value as Record<string, unknown>;
    const id = typeof entry._id === "string" ? entry._id : entry.id;
    const normalized = { ...entry, id };

    if (!isTravelPackage(normalized)) {
      throw new Error(`Destination at index ${index} has an invalid format.`);
    }

    const rating = normalizeRating(entry.rating);
    return rating === undefined ? normalized : { ...normalized, rating };
  });
}

function parsePackages(value: string | null): TravelPackage[] {
  if (value === null) return [];

  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every(isTravelPackage)) {
    throw new Error("Saved travel packages have an invalid format.");
  }

  return parsed;
}

function notifyListeners() {
  for (const listener of listeners) listener();
}

function setSnapshot(nextSnapshot: TravelPackagesSnapshot) {
  snapshot = nextSnapshot;
  notifyListeners();
}

function initialize() {
  if (initialized) return;
  initialized = true;

  try {
    snapshot = {
      packages: parsePackages(window.localStorage.getItem(STORAGE_KEY)),
      error: null,
    };
  } catch {
    snapshot = {
      packages: emptyPackages,
      error:
        "Could not load saved travel packages. Check your browser storage settings and try again.",
    };
  }
}

function handleStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;

  try {
    setSnapshot({
      packages: parsePackages(event.newValue),
      error: null,
    });
  } catch {
    setSnapshot({
      packages: emptyPackages,
      error: "Saved travel packages could not be read from browser storage.",
    });
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  initialize();
  if (!storageListening) {
    window.addEventListener("storage", handleStorage);
    storageListening = true;
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage);
      storageListening = false;
    }
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return serverSnapshot;
}

function readSavedPackages(): TravelPackage[] {
  try {
    return parsePackages(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return emptyPackages;
  }
}

/**
 * Fetch packages from the API. When the API cannot be reached the packages
 * saved in this browser are returned instead, with an error attached.
 */
export async function fetchTravelPackages(): Promise<TravelPackagesResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/destination`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}.`);
    }

    const body: unknown = await response.json();
    const payload = Array.isArray(body)
      ? body
      : typeof body === "object" && body !== null
        ? Object.values(body).find(Array.isArray)
        : null;

    if (!Array.isArray(payload)) {
      throw new Error("API response is not a list of packages.");
    }

    return { packages: normalizePackages(payload), error: null };
  } catch {
    return { packages: readSavedPackages(), error: apiErrorMessage };
  }
}

export function useTravelPackages() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveTravelPackage(
  entry: Omit<TravelPackage, "id">
): TravelPackage {
  initialize();

  if (snapshot.error) {
    throw new Error(snapshot.error);
  }

  const travelPackage: TravelPackage = {
    ...entry,
    id: crypto.randomUUID(),
  };
  const packages = [travelPackage, ...snapshot.packages];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
  setSnapshot({ packages, error: null });

  return travelPackage;
}

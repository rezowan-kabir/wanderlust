"use client";

import { useSyncExternalStore } from "react";

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
};

type TravelPackagesSnapshot = {
  packages: TravelPackage[];
  error: string | null;
};

const STORAGE_KEY = "wanderlust.travel-packages";
const emptyPackages: TravelPackage[] = [];
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

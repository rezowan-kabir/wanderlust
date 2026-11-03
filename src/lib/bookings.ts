"use client";

import { useSyncExternalStore } from "react";

import type { TravelPackage } from "@/lib/travel-packages";

/**
 * A captured booking. Package fields are copied at booking time so the record
 * stays intact even if the API later stops returning that package.
 */
export type Booking = {
  id: string;
  packageId: string;
  destinationName: string;
  country: string;
  category: string;
  price: number;
  duration: string;
  departureDate: string;
  imageUrl: string;
  bookedAt: string;
};

type BookingsSnapshot = {
  bookings: Booking[];
  error: string | null;
};

const STORAGE_KEY = "wanderlust.bookings";
const emptyBookings: Booking[] = [];
const serverSnapshot: BookingsSnapshot = {
  bookings: emptyBookings,
  error: null,
};
let snapshot = serverSnapshot;
let initialized = false;
let storageListening = false;
const listeners = new Set<() => void>();

function isBooking(value: unknown): value is Booking {
  if (typeof value !== "object" || value === null) return false;

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.id === "string" &&
    typeof entry.packageId === "string" &&
    typeof entry.destinationName === "string" &&
    typeof entry.country === "string" &&
    typeof entry.category === "string" &&
    typeof entry.price === "number" &&
    Number.isFinite(entry.price) &&
    entry.price >= 0 &&
    typeof entry.duration === "string" &&
    typeof entry.departureDate === "string" &&
    typeof entry.imageUrl === "string" &&
    typeof entry.bookedAt === "string" &&
    !Number.isNaN(Date.parse(entry.bookedAt))
  );
}

function parseBookings(value: string | null): Booking[] {
  if (value === null) return [];

  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every(isBooking)) {
    throw new Error("Saved bookings have an invalid format.");
  }

  return parsed;
}

function notifyListeners() {
  for (const listener of listeners) listener();
}

function setSnapshot(nextSnapshot: BookingsSnapshot) {
  snapshot = nextSnapshot;
  notifyListeners();
}

function initialize() {
  if (initialized) return;
  initialized = true;

  try {
    snapshot = {
      bookings: parseBookings(window.localStorage.getItem(STORAGE_KEY)),
      error: null,
    };
  } catch {
    snapshot = {
      bookings: emptyBookings,
      error:
        "Could not load saved bookings. Check your browser storage settings and try again.",
    };
  }
}

function handleStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;

  try {
    setSnapshot({
      bookings: parseBookings(event.newValue),
      error: null,
    });
  } catch {
    setSnapshot({
      bookings: emptyBookings,
      error: "Saved bookings could not be read from browser storage.",
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

function writeBookings(bookings: Booking[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  setSnapshot({ bookings, error: null });
}

export function useBookings() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveBooking(travelPackage: TravelPackage): Booking {
  initialize();

  if (snapshot.error) {
    throw new Error(snapshot.error);
  }

  const booking: Booking = {
    id: crypto.randomUUID(),
    packageId: travelPackage.id,
    destinationName: travelPackage.destinationName,
    country: travelPackage.country,
    category: travelPackage.category,
    price: travelPackage.price,
    duration: travelPackage.duration,
    departureDate: travelPackage.departureDate,
    imageUrl: travelPackage.imageUrl,
    bookedAt: new Date().toISOString(),
  };
  const bookings = [booking, ...snapshot.bookings];

  writeBookings(bookings);

  return booking;
}

export function removeBooking(id: string) {
  initialize();

  if (snapshot.error) {
    throw new Error(snapshot.error);
  }

  writeBookings(snapshot.bookings.filter((booking) => booking.id !== id));
}

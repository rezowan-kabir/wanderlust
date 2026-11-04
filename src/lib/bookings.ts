"use client";

import { useCallback, useEffect, useState } from "react";

import type { Booking } from "./booking-types";
import type { TravelPackage } from "./travel-packages";

export type { Booking };

type BookingsState = {
  bookings: Booking[];
  /** Non-null when the bookings API could not be reached or rejected. */
  error: string | null;
  isLoading: boolean;
};

const notSignedInMessage = "Sign in to see your bookings.";
const loadErrorMessage = "Could not load your bookings. Please try again.";

function readMessage(body: unknown, fallback: string): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof (body as { message: unknown }).message === "string"
  ) {
    return (body as { message: string }).message;
  }
  return fallback;
}

/**
 * Fetch the signed-in user's bookings and resolve to the next state. Kept
 * free of `setState` so effects can apply the result in a `.then()` callback.
 */
async function fetchBookingsState(): Promise<BookingsState> {
  try {
    const response = await fetch("/api/bookings", {
      headers: { Accept: "application/json" },
    });

    if (response.status === 401) {
      return { bookings: [], error: notSignedInMessage, isLoading: false };
    }

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}.`);
    }

    const body: unknown = await response.json();
    const bookings = Array.isArray((body as { bookings?: unknown }).bookings)
      ? ((body as { bookings: Booking[] }).bookings)
      : [];

    return { bookings, error: null, isLoading: false };
  } catch {
    return { bookings: [], error: loadErrorMessage, isLoading: false };
  }
}

/**
 * Load the signed-in user's bookings from the API. The list is fetched on
 * mount and can be reloaded with `refetch` after a mutation.
 */
export function useBookings(): BookingsState & { refetch: () => Promise<void> } {
  const [state, setState] = useState<BookingsState>({
    bookings: [],
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let isCancelled = false;

    fetchBookingsState().then((next) => {
      if (!isCancelled) {
        setState(next);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Runs from event handlers after a mutation, so flipping the loading flag
  // synchronously here is fine — only effects avoid synchronous setState.
  const refetch = useCallback(() => {
    setState((previous) => ({ ...previous, isLoading: true }));

    return fetchBookingsState().then((next) => {
      setState(next);
    });
  }, []);

  return { ...state, refetch };
}

/**
 * Store a booking for the signed-in user. The server stamps the user's id,
 * name and email from the verified session — the payload only carries the
 * package details. Throws with a human-readable message on failure.
 */
export async function saveBooking(
  travelPackage: TravelPackage,
): Promise<Booking> {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      packageId: travelPackage.id,
      destinationName: travelPackage.destinationName,
      country: travelPackage.country,
      category: travelPackage.category,
      price: travelPackage.price,
      duration: travelPackage.duration,
      departureDate: travelPackage.departureDate,
      imageUrl: travelPackage.imageUrl,
    }),
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const error = new Error(
      readMessage(body, `Booking failed with status ${response.status}.`),
    );
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const body: unknown = await response.json();
  return (body as { booking: Booking }).booking;
}

/** Remove one of the signed-in user's bookings. Throws on failure. */
export async function removeBooking(id: string): Promise<void> {
  const response = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new Error(
      readMessage(
        body,
        `Could not remove the booking (status ${response.status}).`,
      ),
    );
  }
}

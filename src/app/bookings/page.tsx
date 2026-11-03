"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { removeBooking, useBookings } from "@/lib/bookings";

const dateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timestampFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** `departureDate` is a `YYYY-MM-DD` date-input value; pin it to local midnight. */
function formatDepartureDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : dateFormat.format(date);
}

function formatBookedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : timestampFormat.format(date);
}

export default function BookingsPage() {
  const { bookings, error } = useBookings();

  return (
    <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 lg:pt-32">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-light tracking-tight text-slate-900">
          My Bookings
        </h1>
        <p className="mt-2 text-slate-600">
          Trips you have booked from your destinations.
        </p>

        {bookings.length > 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            {bookings.length} booking{bookings.length === 1 ? "" : "s"}
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
          >
            {error}
          </p>
        ) : null}

        {bookings.length === 0 ? (
          <div className="mt-10 rounded-lg border border-slate-200 px-6 py-12 text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              No bookings yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Pick a destination and press Book Now to add it here.
            </p>
            <Button
              render={<Link href="/destinations" />}
              className="mt-6 bg-brand text-white hover:bg-brand/90"
            >
              Browse destinations
            </Button>
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <Card className="h-full gap-0 overflow-hidden rounded-xl bg-white py-0 shadow-sm ring-0">
                  <Image
                    src={booking.imageUrl}
                    alt={booking.destinationName}
                    width={960}
                    height={540}
                    unoptimized
                    className="h-52 w-full object-cover"
                  />
                  <CardContent className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-slate-900">
                          {booking.destinationName}
                        </h2>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin className="size-4 shrink-0" aria-hidden />
                          {booking.country}
                        </p>
                      </div>
                      <p className="shrink-0 text-lg font-bold text-slate-900">
                        {priceFormat.format(booking.price)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="size-4" aria-hidden />
                        {booking.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-4" aria-hidden />
                        {formatDepartureDate(booking.departureDate)}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Booked {formatBookedAt(booking.bookedAt)}
                    </p>

                    <div className="mt-auto flex items-center justify-end border-t border-slate-100 pt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          try {
                            removeBooking(booking.id);
                          } catch {
                            /* storage error is already surfaced by the banner */
                          }
                        }}
                      >
                        <Trash className="size-4" aria-hidden />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

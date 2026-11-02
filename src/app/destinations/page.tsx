"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTravelPackages } from "@/lib/travel-packages";

function formatDepartureDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
}

export default function DestinationsPage() {
  const { packages, error } = useTravelPackages();

  return (
    <main className="min-h-[70vh] flex-1 bg-slate-50 px-4 pb-16 pt-28 sm:px-6 lg:pt-32">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              Explore
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Travel destinations
            </h1>
            <p className="mt-2 text-slate-600">
              Browse the travel packages available for your next trip.
            </p>
          </div>
          <Button
            render={<Link href="/add-destination" />}
            className="w-fit bg-brand text-white hover:bg-brand/90"
          >
            <Plus className="size-4" aria-hidden />
            Add Travel Package
          </Button>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        ) : packages.length === 0 ? (
          <Card className="items-center px-6 py-12 text-center shadow-sm ring-0">
            <h2 className="text-xl font-semibold text-slate-900">
              No travel packages yet
            </h2>
            <p className="mt-2 max-w-md text-slate-600">
              Add your first package and it will appear here for you to browse.
            </p>
            <Button
              render={<Link href="/add-destination" />}
              className="mt-6 bg-brand text-white hover:bg-brand/90"
            >
              <Plus className="size-4" aria-hidden />
              Create a package
            </Button>
          </Card>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((travelPackage) => (
              <li key={travelPackage.id}>
                <Card className="h-full gap-0 overflow-hidden rounded-xl bg-white py-0 shadow-sm ring-0">
                  <Image
                    src={travelPackage.imageUrl}
                    alt={travelPackage.destinationName}
                    width={960}
                    height={540}
                    unoptimized
                    className="h-52 w-full object-cover"
                  />
                  <CardContent className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-slate-900">
                          {travelPackage.destinationName}
                        </h2>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin className="size-4 shrink-0" aria-hidden />
                          {travelPackage.country}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium capitalize text-brand">
                        {travelPackage.category}
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
                      {travelPackage.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="size-4" aria-hidden />
                        {travelPackage.duration}
                      </span>
                      <time
                        className="flex items-center gap-1.5"
                        dateTime={travelPackage.departureDate}
                      >
                        <CalendarDays className="size-4" aria-hidden />
                        {formatDepartureDate(travelPackage.departureDate)}
                      </time>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                      <p className="text-lg font-bold text-slate-900">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }).format(travelPackage.price)}
                      </p>
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

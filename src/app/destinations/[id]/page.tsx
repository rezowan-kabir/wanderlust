import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Edit3,
  MapPin,
  Star,
  TriangleAlert,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { BookNowButton } from "./book-now-button";
import { DeleteDestinationButton } from "./delete-destination-button";
import { API_BASE_URL } from "@/lib/api";
import type { TravelPackage } from "@/lib/travel-packages";

type DetailResult =
  | { status: "ok"; destination: TravelPackage }
  | { status: "not-found" }
  | { status: "error" };

function DetailFallback() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
      <div className="relative h-[450px] w-full overflow-hidden rounded-2xl">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-6 w-72" />
          <Skeleton className="h-36 w-full" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function DetailError() {
  return (
    <div className="mt-10 rounded-lg border border-slate-200 px-6 py-12 text-center">
      <TriangleAlert className="mx-auto size-8 text-amber-500" aria-hidden />
      <h2 className="mt-3 text-xl font-semibold text-slate-900">
        Could not load destination
      </h2>
      <p className="mx-auto mt-2 max-w-md text-slate-600">
        The destination service is unavailable. Please try again later.
      </p>
      <Link
        href="/destinations"
        className="mt-6 inline-flex text-xs font-semibold uppercase text-brand underline underline-offset-4"
      >
        Back to Destinations
      </Link>
    </div>
  );
}

async function DestinationDetail({ id }: { id: string }) {
  let result: DetailResult;

  try {
    const response = await fetch(`${API_BASE_URL}/destination/${id}`, {
      headers: {
        Accept: "application/json",
        authorization: "user logged in",
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      result = { status: "not-found" };
    } else if (!response.ok) {
      result = { status: "error" };
    } else {
      const body: unknown = await response.json();
      const payload =
        typeof body === "object" && body !== null && "destination" in body
          ? (body as { destination: unknown }).destination
          : body;

      // The API answers a missing id with 200 + `null`, not 404.
      if (payload === null || payload === undefined) {
        result = { status: "not-found" };
      } else {
        result = {
          status: "ok",
          destination: {
            ...(payload as TravelPackage),
            id:
              (payload as TravelPackage).id ??
              (payload as { _id?: string })._id ??
              id,
          },
        };
      }
    }
  } catch {
    result = { status: "error" };
  }

  // Thrown outside the try: `notFound()` works by throwing a control-flow error.
  if (result.status === "not-found") {
    notFound();
  }

  if (result.status !== "ok") {
    return <DetailError />;
  }

  const destination = result.destination;

  // Default highlights if not provided by backend
  const providedHighlights: unknown =
    "highlights" in destination ? destination.highlights : undefined;
  const highlights: string[] = Array.isArray(providedHighlights)
    ? providedHighlights.filter(
        (highlight: unknown): highlight is string =>
          typeof highlight === "string",
      )
    : [
        "Luxury beachfront accommodation",
        "Visit Uluwatu Temple at sunset",
        "Traditional Balinese spa treatment",
        "Private beach dinner experience",
        "Sunrise trek to Mount Batur",
      ];

  return (
    <>
      {/* Top Header Actions */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/destinations"
          className="flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span className="text-sm font-medium">Back to Destinations</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/destinations/${destination.id}/edit`}
            className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Edit3 className="h-4 w-4 text-gray-600" aria-hidden />
            Edit
          </Link>
          <DeleteDestinationButton
            id={destination.id}
            name={destination.destinationName}
          />
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative mb-10 h-[450px] w-full overflow-hidden rounded-2xl shadow-sm">
        <Image
          src={destination.imageUrl}
          alt={destination.destinationName}
          fill
          priority
          unoptimized
          className="object-cover"
        />
      </div>

      {/* Main Content & Sidebar */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-8 lg:col-span-2">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-gray-500">
              <MapPin className="h-4 w-4" aria-hidden />
              <span className="text-sm font-medium">{destination.country}</span>
            </div>

            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              {destination.destinationName}
            </h1>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1 font-semibold">
                <Star
                  className="h-4 w-4 fill-emerald-500 text-emerald-500"
                  aria-hidden
                />
                <span>
                  {typeof destination.rating === "number"
                    ? destination.rating.toFixed(1)
                    : "4.9"}
                </span>
                <span className="font-normal text-gray-400">(234 reviews)</span>
              </div>

              <div className="flex items-center gap-2 font-medium text-gray-600">
                <CalendarDays className="h-4 w-4" aria-hidden />
                <span>{destination.duration}</span>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
            <p className="leading-relaxed text-gray-500">
              {destination.description}
            </p>
          </div>

          {/* Highlights */}
          <div className="space-y-4 pt-2">
            <h2 className="text-2xl font-bold text-gray-900">Highlights</h2>
            <p className="leading-relaxed text-gray-500">
              {destination.description}
            </p>

            <ul className="grid grid-cols-1 gap-x-6 gap-y-3 pt-2 md:grid-cols-2">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <Check
                    className="h-4 w-4 shrink-0 text-emerald-500"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Sidebar (Pricing & Booking) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6 rounded-2xl border border-gray-100 p-6 shadow-xl shadow-gray-100/50">
            <div>
              <p className="text-xs font-medium text-gray-400">Starting from</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-cyan-500">
                  ${destination.price}
                </span>
                <span className="text-sm text-gray-400">per person</span>
              </div>
            </div>

            {/* Departure Date */}
            <div>
              <input
                type="text"
                readOnly
                value={destination.departureDate}
                aria-label="Departure date"
                className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-gray-700 outline-none"
              />
            </div>

            {/* Action Button */}
            <BookNowButton travelPackage={destination} />

            {/* Included Features */}
            <div className="space-y-2.5 border-t border-gray-100 pt-2">
              {[
                "Free cancellation up to 7 days",
                "Travel insurance included",
                "24/7 customer support",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-gray-500"
                >
                  <Check
                    className="h-3.5 w-3.5 shrink-0 text-emerald-500"
                    aria-hidden
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DestinationPage({
  params,
}: PageProps<"/destinations/[id]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-28 text-gray-800 sm:px-6">
      <Suspense fallback={<DetailFallback />}>
        <DestinationDetailBridge params={params} />
      </Suspense>
    </div>
  );
}

async function DestinationDetailBridge({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DestinationDetail id={id} />;
}




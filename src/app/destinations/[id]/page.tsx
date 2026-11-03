import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  Clock,
  Edit3,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/lib/travel-packages";

/** Shape the destination detail endpoint is expected to return. */
type Destination = {
  destinationName: string;
  country: string;
  duration: string;
  departureDate: string;
  imageUrl: string;
  description: string;
  price: number;
};

function DetailFallback() {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="lg:col-span-1">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

/**
 * Every data access lives behind this Suspense boundary: with Cache Components
 * an uncached fetch (or `params`) read at prerender time would abort the build,
 * so the static shell primes and the id-dependent content streams in.
 */
async function DestinationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Dynamic fetch request
  const response = await fetch(`${API_BASE_URL}/destination/${id}`, {
    cache: "no-store", // standard for dynamic page data
  });
  const destination: Destination = await response.json();

  return (
    <>
      {/* Hero Banner Image */}
      <div className="relative mb-10 h-[450px] w-full overflow-hidden rounded-2xl shadow-sm">
        <Image
          src={destination.imageUrl}
          alt={destination.destinationName}
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Left Column: Details & Description */}
        <div className="space-y-8 lg:col-span-2">
          <div>
            {/* Country Badge */}
            <div className="mb-2 flex items-center gap-1.5 text-gray-500">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">{destination.country}</span>
            </div>

            {/* Destination Name */}
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              {destination.destinationName}
            </h1>

            {/* Sub-info Meta */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1 font-semibold">
                <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                <span>4.9</span>
                <span className="font-normal text-gray-400">(234 reviews)</span>
              </div>

              <div className="flex items-center gap-2 font-medium text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{destination.duration}</span>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
            <p className="leading-relaxed text-gray-600">
              {destination.description}
            </p>
          </div>

          {/* Highlights Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Highlights</h2>
            <p className="leading-relaxed text-gray-600">
              {destination.description}
            </p>

            <ul className="grid grid-cols-1 gap-y-3 gap-x-6 pt-2 md:grid-cols-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="shrink-0 h-4 w-4 text-emerald-500" />
                <span>Luxury beachfront accommodation</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="shrink-0 h-4 w-4 text-emerald-500" />
                <span>Visit Uluwatu Temple at sunset</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="shrink-0 h-4 w-4 text-emerald-500" />
                <span>Traditional Balinese spa treatment</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="shrink-0 h-4 w-4 text-emerald-500" />
                <span>Private beach dinner experience</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="shrink-0 h-4 w-4 text-emerald-500" />
                <span>Sunrise trek to Mount Batur</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Pricing & Booking Card */}
        <div className="lg:col-span-1">
          <div className="space-y-6 rounded-2xl border border-gray-100 p-6 shadow-xl shadow-gray-100/50 [position:sticky;top:1.5rem]">
            <div>
              <p className="text-xs font-medium text-gray-400">Starting from</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-cyan-600">
                  ${destination.price}
                </span>
                <span className="text-sm text-gray-400">per person</span>
              </div>
            </div>

            {/* Departure Date Input/Display */}
            <div>
              <input
                type="text"
                readOnly
                value={destination.departureDate}
                className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-gray-700 outline-none focus:no-underline"
              />
            </div>

            {/* Book Now Button */}
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 py-3 font-medium text-white transition-colors hover:bg-cyan-700">
              <span>Book Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Included Features List */}
            <div className="space-y-2.5 border-t border-gray-100 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Check className="shrink-0 h-3.5 w-3.5 text-emerald-500" />
                <span>Free cancellation up to 7 days</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Check className="shrink-0 h-3.5 w-3.5 text-emerald-500" />
                <span>Travel insurance included</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Check className="shrink-0 h-3.5 w-3.5 text-emerald-500" />
                <span>24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DestinationPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-gray-800">
      {/* Navigation & Action Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/destinations"
          className="flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Destinations</span>
        </Link>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
            <Edit3 className="h-4 w-4 text-gray-600" />
            Edit
          </button>
          <button className="flex items-center gap-2 rounded-md border border-rose-300 px-4 py-2 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50">
            <Trash2 className="h-4 w-4 text-rose-500" />
            Cancel
          </button>
        </div>
      </div>

      <Suspense fallback={<DetailFallback />}>
        <DestinationDetail params={Promise.resolve({} as { id: string })} />
      </Suspense>
    </div>
  );
}

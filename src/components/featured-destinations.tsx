import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FeaturedCarousel } from "@/components/featured-carousel";
import { API_BASE_URL } from "@/lib/api";
import type { TravelPackage } from "@/lib/travel-packages";

/**
 * Pull the fields a card needs off a raw `/featured-destinations` document.
 * The API returns Mongo docs (`_id`, not `id`) and omits optional fields.
 */
function normalizeDestination(value: unknown): TravelPackage | null {
  if (typeof value !== "object" || value === null) return null;

  const entry = value as Record<string, unknown>;
  const id =
    typeof entry._id === "string"
      ? entry._id
      : typeof entry.id === "string"
        ? entry.id
        : null;

  if (id === null || typeof entry.destinationName !== "string") return null;

  const rating =
    typeof entry.rating === "number" && Number.isFinite(entry.rating)
      ? entry.rating
      : undefined;

  return {
    id,
    destinationName: entry.destinationName,
    country: typeof entry.country === "string" ? entry.country : "",
    category: typeof entry.category === "string" ? entry.category : "",
    price: typeof entry.price === "number" ? entry.price : 0,
    duration: typeof entry.duration === "string" ? entry.duration : "",
    departureDate:
      typeof entry.departureDate === "string" ? entry.departureDate : "",
    imageUrl: typeof entry.imageUrl === "string" ? entry.imageUrl : "",
    description: typeof entry.description === "string" ? entry.description : "",
    ...(rating === undefined ? {} : { rating }),
  };
}

/**
 * Read the five featured packages. Any failure — API down, malformed body —
 * resolves to an empty list so a backend hiccup never breaks the homepage.
 */
async function fetchFeaturedDestinations(): Promise<TravelPackage[]> {
  "use cache";

  try {
    const response = await fetch(`${API_BASE_URL}/featured-destinations`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];

    const body: unknown = await response.json();
    const payload = Array.isArray(body)
      ? body
      : typeof body === "object" && body !== null
        ? Object.values(body).find(Array.isArray)
        : null;

    if (!Array.isArray(payload)) return [];

    return payload
      .map(normalizeDestination)
      .filter((item): item is TravelPackage => item !== null);
  } catch {
    return [];
  }
}

/** Homepage band previewing five packages in a swipeable carousel. */
export default async function FeaturedDestinations() {
  const packages = await fetchFeaturedDestinations();

  // Nothing to show (API unreachable at build time) — leave the band out.
  if (packages.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
            Featured Destinations
          </h2>
          <p className="mt-3 text-slate-600">
            Handpicked travel experiences for the adventure seekers
          </p>
        </div>

        <Link
          href="/destinations"
          className="inline-flex shrink-0 items-center gap-3 border border-brand/50 px-5 py-3 text-[13px] font-semibold tracking-[0.15em] text-brand uppercase transition-colors hover:bg-brand/5"
        >
          All Destinations
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <FeaturedCarousel packages={packages} />
    </section>
  );
}

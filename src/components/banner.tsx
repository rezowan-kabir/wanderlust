import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const searchFields = [
  { label: "Location", value: "Address, City Or Zip" },
  { label: "Date/Duration", value: "Anytime/3 Days" },
  { label: "Budget", value: "$0-$3000" },
  { label: "People", value: "5-10" },
];

/** Full-bleed hero with the beach photo, headline and the search strip. */
export function Banner() {
  return (
    <section className="relative isolate flex min-h-[640px] flex-col overflow-hidden lg:min-h-[720px]">
      <Image
        src="/assets/Banner.png"
        alt="Aerial view of a turquoise cove surrounded by lush green hills"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-black/35" />

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-36 text-center">
        <h1 className="max-w-4xl text-5xl font-light leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-8xl">
          Discover Your
          <br />
          Next Adventure
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
          Explore breathtaking destinations and create unforgettable memories with
          our curated travel experiences.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-3 rounded bg-brand px-7 py-4 text-[13px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand/90"
          >
            Explore Now
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/destinations"
            className="inline-flex items-center rounded bg-white/25 px-7 py-4 text-[13px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:bg-white/35"
          >
            View Destination
          </Link>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 border-t border-white/20 bg-black/35 backdrop-blur-sm lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        {searchFields.map((field, index) => (
          <div
            key={field.label}
            className={`px-7 py-3.5 text-left ${
              index > 0 ? "border-t border-white/20 lg:border-t-0 lg:border-l" : ""
            }`}
          >
            <p className="text-[15px] font-medium text-white sm:text-base">
              {field.label}
            </p>
            <p className="mt-0.5 text-xs text-white/70 sm:text-[13px]">
              {field.value}
            </p>
          </div>
        ))}

        <button
          type="button"
          className="border-t border-white/20 bg-brand px-12 py-4 text-base font-semibold text-white transition-colors hover:bg-brand/90 lg:border-t-0"
        >
          Search
        </button>
      </div>
    </section>
  );
}

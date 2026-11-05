"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, MapPin, Star } from "lucide-react";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { TravelPackage } from "@/lib/travel-packages";

/** Image plus the destination details shown under it. */
function DestinationCard({ travelPackage }: { travelPackage: TravelPackage }) {
  return (
    <article className="group h-full">
      <div className="relative overflow-hidden rounded-lg bg-slate-100">
        <Image
          src={travelPackage.imageUrl}
          alt={travelPackage.destinationName}
          width={880}
          height={540}
          unoptimized
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* `rating` is optional — the badge only renders when it was supplied. */}
        {typeof travelPackage.rating === "number" ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-[#e0f7fa] px-2.5 py-1.5 text-sm font-semibold text-slate-900">
            {travelPackage.rating.toFixed(1)}
            <Star
              className="size-3.5 fill-slate-900 text-slate-900"
              aria-hidden
            />
          </span>
        ) : null}
      </div>

      <div className="mt-3 sm:mt-4">
        <p className="flex items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
          <MapPin className="size-3.5 shrink-0 text-slate-400 sm:size-4" aria-hidden />
          {travelPackage.country}
        </p>

        <div className="mt-1.5 flex min-w-0 flex-col gap-0.5 sm:mt-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h3 className="min-w-0 truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {travelPackage.destinationName}
          </h3>
          <p className="shrink-0 text-sm font-bold text-slate-900 sm:text-xl">
            ${travelPackage.price}
            <span className="text-xs font-normal text-slate-400">/Person</span>
          </p>
        </div>

        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 sm:mt-2 sm:text-sm">
          <CalendarDays
            className="size-3.5 shrink-0 text-slate-400 sm:size-4"
            aria-hidden
          />
          {travelPackage.duration}
        </p>

        <Link
          href={`/destinations/${travelPackage.id}`}
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold tracking-wider text-brand uppercase transition-opacity hover:opacity-80 sm:mt-4 sm:gap-1.5 sm:text-[13px]"
        >
          Book Now
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

/**
 * Swipeable row of featured packages with the "1/5" counter, progress bar and
 * round prev/next controls from the mockup.
 */
export function FeaturedCarousel({ packages }: { packages: TravelPackage[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!api) return;

    // Embla pushes changes through its own emitter, so this is a subscription
    // rather than a synchronous state update inside the effect.
    const handleSelect = () => setCurrentSlide(api.selectedScrollSnap());

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  const slideCount = packages.length;
  const progress =
    slideCount > 0 ? ((currentSlide + 1) / slideCount) * 100 : 0;

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "start", loop: false }}
      className="mt-12 w-full"
    >
      <CarouselContent>
        {packages.map((travelPackage) => (
          <CarouselItem
            key={travelPackage.id}
            className="basis-[66%] sm:basis-[46%]"
          >
            <DestinationCard travelPackage={travelPackage} />
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className="mt-10 flex items-center gap-5">
        <p className="shrink-0 text-2xl font-medium text-slate-900">
          {Math.min(currentSlide + 1, slideCount)}/{slideCount}
        </p>

        <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <CarouselPrevious className="static my-0 size-11 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900" />
          <CarouselNext className="static my-0 size-11 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900" />
        </div>
      </div>
    </Carousel>
  );
}

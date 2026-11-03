"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Plus,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { saveBooking } from "@/lib/bookings";
import {
  fetchTravelPackages,
  type TravelPackage,
  type TravelPackagesResult,
} from "@/lib/travel-packages";

/** Select value that resets a filter instead of matching a package. */
const ALL_VALUE = "__all__";

const priceRanges = [
  { id: "under-1000", label: "Under $1,000", min: 0, max: 1000 },
  { id: "1000-2500", label: "$1,000 - $2,500", min: 1000, max: 2500 },
  { id: "2500-5000", label: "$2,500 - $5,000", min: 2500, max: 5000 },
  {
    id: "5000-plus",
    label: "$5,000 & above",
    min: 5000,
    max: Number.POSITIVE_INFINITY,
  },
];

const sortOptions = [
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Highest rating" },
  { id: "name", label: "Name: A to Z" },
];

/**
 * The three filter triggers form one segmented bar, so each one drops its own
 * border, corner radius and height. The height is forced because SelectTrigger
 * sets a higher-specificity `data-[size=default]` height.
 */
const filterTriggerClass =
  "h-12! w-full rounded-none border-0 bg-white pl-4 pr-4 uppercase tracking-wide data-placeholder:text-slate-500";

function sortTravelPackages(packages: TravelPackage[], sortId: string | null) {
  const sorted = [...packages];

  sorted.sort((first, second) => {
    switch (sortId) {
      case "price-asc":
        return first.price - second.price;
      case "price-desc":
        return second.price - first.price;
      case "rating":
        return (second.rating ?? 0) - (first.rating ?? 0);
      case "name":
        return first.destinationName.localeCompare(second.destinationName);
      default:
        return 0;
    }
  });

  return sorted;
}

function FilterSelect({
  label,
  resetLabel,
  value,
  onChange,
  children,
}: {
  label: string;
  resetLabel: string;
  value: string | null;
  onChange: (value: string | null) => void;
  children: React.ReactNode;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) =>
        onChange(next === null || next === ALL_VALUE ? null : String(next))
      }
    >
      <SelectTrigger className={filterTriggerClass}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{resetLabel}</SelectItem>
        {children}
      </SelectContent>
    </Select>
  );
}

export default function DestinationsPage() {
  const router = useRouter();
  const [result, setResult] = useState<TravelPackagesResult>({
    packages: [],
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [sortId, setSortId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    fetchTravelPackages().then((nextResult) => {
      if (isCancelled) return;
      setResult(nextResult);
      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const { packages, error } = result;

  const categoryOptions = [
    ...new Set(
      packages
        .map((travelPackage) => travelPackage.category)
        .filter((value) => value.length > 0)
    ),
  ].sort((first, second) => first.localeCompare(second));

  const selectedRange = priceRanges.find((range) => range.id === priceRange);

  const visiblePackages = sortTravelPackages(
    packages.filter(
      (travelPackage) =>
        (category === null || travelPackage.category === category) &&
        (selectedRange === undefined ||
          (travelPackage.price >= selectedRange.min &&
            travelPackage.price <= selectedRange.max))
    ),
    sortId
  );


  return (
    <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 lg:pt-32">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-light tracking-tight text-slate-900">
          Explore All Destinations
        </h1>
        <p className="mt-2 text-slate-600">
          Find your perfect travel experience from our curated collection
        </p>

        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <FilterSelect
              label="CATEGORY"
              resetLabel="All categories"
              value={category}
              onChange={setCategory}
            >
              {categoryOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </FilterSelect>

            <FilterSelect
              label="PRICE RANGE"
              resetLabel="All prices"
              value={priceRange}
              onChange={setPriceRange}
            >
              {priceRanges.map((range) => (
                <SelectItem key={range.id} value={range.id}>
                  {range.label}
                </SelectItem>
              ))}
            </FilterSelect>

            <FilterSelect
              label="SORT BY"
              resetLabel="Default order"
              value={sortId}
              onChange={setSortId}
            >
              {sortOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </FilterSelect>
          </div>
        </div>

        {isLoading ? null : (
          <p className="mt-4 text-sm text-slate-500">
            Showing {visiblePackages.length} destination
            {visiblePackages.length === 1 ? "" : "s"}
          </p>
        )}

        {error && !isLoading ? (
          <p
            role="alert"
            className={
              packages.length > 0
                ? "mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
                : "mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            }
          >
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <li key={index} className="flex flex-col gap-2.5">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-20" />
              </li>
            ))}
          </ul>
        ) : packages.length === 0 ? (
          <div className="mt-10 rounded-lg border border-slate-200 px-6 py-12 text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              No destinations yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Add your first package and it will appear here for you to browse.
            </p>
            <Button
              render={<Link href="/add-destination" />}
              className="mt-6 bg-brand text-white hover:bg-brand/90"
            >
              <Plus className="size-4" aria-hidden />
              Add Travel Package
            </Button>
          </div>
        ) : visiblePackages.length === 0 ? (
          <div className="mt-10 rounded-lg border border-slate-200 px-6 py-12 text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              No destinations match your filters
            </h2>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Try clearing the category or price range to see more results.
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePackages.map((travelPackage) => (
              <li key={travelPackage.id}>
                <article className="group flex h-full flex-col">
                  <div className="relative">
                    <Image
                      src={travelPackage.imageUrl}
                      alt={travelPackage.destinationName}
                      width={640}
                      height={400}
                      unoptimized
                      className="h-48 w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {typeof travelPackage.rating === "number" ? (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-white py-1 pl-2.5 pr-2 text-xs font-semibold text-slate-900 shadow-sm">
                        {travelPackage.rating.toFixed(1)}
                        <Star
                          className="size-3 fill-slate-900 text-slate-900"
                          aria-hidden
                        />
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col pt-3">
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="size-3.5 shrink-0" aria-hidden />
                      {travelPackage.country}
                    </p>

                    <div className="mt-1 flex items-baseline justify-between gap-3">
                      <h2 className="min-w-0 truncate text-base font-semibold text-slate-900">
                        {travelPackage.destinationName}
                      </h2>
                      <p className="shrink-0 text-base font-bold text-slate-900">
                        ${travelPackage.price}
                        <span className="text-xs font-normal text-slate-500">
                          /Person
                        </span>
                      </p>
                    </div>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                      {travelPackage.duration}
                    </p>

                    <Link
                      href="/bookings"
                      className="mt-4 inline-flex w-fit items-center gap-1 text-xs font-semibold text-brand uppercase underline underline-offset-4"
                      onClick={(event) => {
                        event.preventDefault();

                        try {
                          saveBooking(travelPackage);
                        } catch (bookingError) {
                          toast.add({
                            title: "Could not add booking",
                            description:
                              bookingError instanceof Error
                                ? bookingError.message
                                : "Please try again.",
                            type: "error",
                          });
                          return;
                        }

                        toast.add({
                          title: "Booking added",
                          description: `${travelPackage.destinationName} is now in your bookings.`,
                          type: "success",
                        });
                        router.push("/bookings");
                      }}
                    >
                      Book Now
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

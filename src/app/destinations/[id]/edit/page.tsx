import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/lib/api";
import type { TravelPackage } from "@/lib/travel-packages";
import { EditPackageForm } from "./edit-form";

function EditFormFallback() {
  return (
    <div className="mx-auto mt-10 w-full max-w-[544px] space-y-4">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="ml-auto h-10 w-36" />
    </div>
  );
}

/**
 * Data access stays inside the page's Suspense boundary so the route can
 * prerender under Cache Components (see `/destinations/[id]`).
 */
async function EditDestination({ id }: { id: string }) {
  const response = await fetch(`${API_BASE_URL}/destination/${id}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    notFound();
  }

  const body: unknown = await response.json();
  const payload =
    typeof body === "object" && body !== null && "destination" in body
      ? (body as { destination: unknown }).destination
      : body;

  // The API answers a missing id with 200 + `null`, not 404.
  if (payload === null || payload === undefined) {
    notFound();
  }

  const destination: TravelPackage = {
    ...(payload as TravelPackage),
    id:
      (payload as TravelPackage).id ??
      (payload as { _id?: string })._id ??
      id,
  };

  return <EditPackageForm destination={destination} />;
}

export default function EditDestinationPage({
  params,
}: PageProps<"/destinations/[id]/edit">) {
  return (
    <main className="flex-1 px-4 pb-20 pt-28 sm:px-6 lg:pt-32">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/destinations"
          className="inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span className="text-sm font-medium">Back to Destinations</span>
        </Link>

        <h1 className="mt-4 text-4xl font-light tracking-tight text-slate-900">
          Edit Travel Package
        </h1>
        <p className="mt-2 text-slate-600">
          Update the package details and save your changes.
        </p>
      </div>

      <Suspense fallback={<EditFormFallback />}>
        <EditDestinationBridge params={params} />
      </Suspense>
    </main>
  );
}

async function EditDestinationBridge({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditDestination id={id} />;
}

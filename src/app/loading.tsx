import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading"
      className="flex-1 px-4 pb-16 pt-28 sm:px-6 lg:pt-32"
    >
      <div className="mx-auto max-w-6xl">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-3 h-4 w-80" />

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex flex-col gap-2.5">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

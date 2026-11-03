import Link from "next/link";
import { Compass, Home, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center px-4 pb-20 pt-28 sm:px-6 lg:pt-32">
      <div className="mx-auto max-w-xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          <Compass className="size-3.5" aria-hidden />
          404
        </span>

        <h1 className="mt-5 text-4xl font-light tracking-tight text-slate-900 sm:text-5xl">
          This destination is off the map
        </h1>
        <p className="mt-4 text-slate-600">
          The page you are looking for does not exist or may have been removed.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            render={<Link href="/" />}
            className="bg-brand text-white hover:bg-brand/90"
          >
            <Home className="size-4" aria-hidden />
            Back home
          </Button>
          <Button variant="outline" render={<Link href="/destinations" />}>
            <MapPin className="size-4" aria-hidden />
            Browse destinations
          </Button>
        </div>
      </div>
    </main>
  );
}

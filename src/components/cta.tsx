import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Full-bleed closing CTA over the plane photo. */
export function CallToAction() {
  return (
    <section className="relative isolate flex min-h-[400px] items-center justify-center overflow-hidden px-6 py-24 text-center">
      <Image
        src="/assets/CTA.png"
        alt="Airliner flying over a tropical island"
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-black/50" />

      <div className="flex flex-col items-center">
        <h2 className="text-4xl font-light leading-tight text-white sm:text-5xl lg:text-6xl">
          Ready To Start Your Journey?
        </h2>

        <p className="mt-5 max-w-2xl text-base text-white/90 sm:text-lg">
          Join thousands of travelers who have discovered the world with us
        </p>

        <Link
          href="/destinations"
          className="mt-10 inline-flex items-center gap-4 bg-white px-8 py-3.5 text-[13px] font-semibold uppercase tracking-wide text-neutral-900 transition-colors hover:bg-white/90"
        >
          Book Your Trip Today
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

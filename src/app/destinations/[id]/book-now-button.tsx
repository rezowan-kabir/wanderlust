"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { toast } from "@/components/ui/toast";
import { saveBooking } from "@/lib/bookings";
import type { TravelPackage } from "@/lib/travel-packages";

export function BookNowButton({
  travelPackage,
}: {
  travelPackage: TravelPackage;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 py-3 font-medium text-white transition-colors hover:bg-cyan-700"
      onClick={() => {
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
      <span>Book Now</span>
      <ArrowRight className="h-4 w-4" aria-hidden />
    </button>
  );
}

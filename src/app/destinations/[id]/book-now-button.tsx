"use client";

import { useState } from "react";
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
  const [isBooking, setIsBooking] = useState(false);

  async function handleBookNow() {
    setIsBooking(true);

    try {
      await saveBooking(travelPackage);
    } catch (bookingError) {
      const message =
        bookingError instanceof Error
          ? bookingError.message
          : "Please try again.";

      // The API answers an unauthenticated booking with 401; send them to sign in.
      if (
        bookingError instanceof Error &&
        (bookingError as Error & { status?: number }).status === 401
      ) {
        toast.add({
          title: "Sign in to book",
          description: "You need an account to save a booking.",
          type: "info",
        });
        router.push("/login");
        return;
      }

      toast.add({
        title: "Could not add booking",
        description: message,
        type: "error",
      });
      setIsBooking(false);
      return;
    }

    toast.add({
      title: "Booking added",
      description: `${travelPackage.destinationName} is now in your bookings.`,
      type: "success",
    });
    router.push("/bookings");
  }

  return (
    <button
      type="button"
      disabled={isBooking}
      onClick={handleBookNow}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 py-3 font-medium text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span>{isBooking ? "Booking..." : "Book Now"}</span>
      <ArrowRight className="h-4 w-4" aria-hidden />
    </button>
  );
}

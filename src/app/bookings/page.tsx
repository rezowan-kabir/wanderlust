"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  CalendarDays,
  CircleCheck,
  Clock3,
  Eye,
  Mail,
  MapPin,
  Tag,
  Trash2,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { removeBooking, useBookings, type Booking } from "@/lib/bookings";

const dateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timestampFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** `departureDate` is a `YYYY-MM-DD` date-input value; pin it to local midnight. */
function parseDepartureDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDepartureDate(value: string) {
  const date = parseDepartureDate(value);
  return date ? dateFormat.format(date) : value;
}

function formatBookedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : timestampFormat.format(date);
}

/**
 * Bookings are stored without a status column, so the badge is derived from
 * the departure date: a trip still ahead is confirmed, one that has sailed is
 * completed, and an unparseable date is left as pending.
 */
type TripStatus = "confirmed" | "pending" | "completed";

const statusStyles: Record<
  TripStatus,
  { label: string; className: string; icon: typeof CircleCheck }
> = {
  confirmed: {
    label: "Confirmed",
    className: "bg-emerald-50 text-emerald-600",
    icon: CircleCheck,
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-600",
    icon: Clock3,
  },
  completed: {
    label: "Completed",
    className: "bg-slate-100 text-slate-500",
    icon: CircleCheck,
  },
};

function statusFor(booking: Booking): TripStatus {
  const departure = parseDepartureDate(booking.departureDate);
  if (!departure) return "pending";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return departure >= today ? "confirmed" : "completed";
}

function StatusBadge({ status }: { status: TripStatus }) {
  const { label, className, icon: Icon } = statusStyles[status];

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

/** One booking rendered as a horizontal row, matching the /bookings mockup. */
function BookingRow({
  booking,
  isRemoving,
  onView,
  onCancel,
}: {
  booking: Booking;
  isRemoving: boolean;
  onView: () => void;
  onCancel: () => void;
}) {
  return (
    <li>
      <article className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:gap-5">
        <Image
          src={booking.imageUrl}
          alt={booking.destinationName}
          width={480}
          height={270}
          unoptimized
          className="h-44 w-full rounded-lg object-cover sm:h-36 sm:w-48 sm:shrink-0"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <StatusBadge status={statusFor(booking)} />

          <h2 className="mt-2 truncate text-xl font-bold tracking-tight text-slate-900">
            {booking.destinationName}
          </h2>

          <dl className="mt-2 space-y-1.5 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CalendarDays
                className="size-4 shrink-0 text-slate-400"
                aria-hidden
              />
              <span>Departure: {formatDepartureDate(booking.departureDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="size-4 shrink-0 text-slate-400" aria-hidden />
              <span className="truncate" title={booking.id}>
                Booking ID: {booking.id}
              </span>
            </div>
          </dl>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
            <p className="text-2xl font-bold text-brand">
              {priceFormat.format(booking.price)}
            </p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isRemoving}
                onClick={onCancel}
                className="border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" aria-hidden />
                {isRemoving ? "Cancelling..." : "Cancel"}
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={onView}
                className="bg-brand text-white hover:bg-brand/90"
              >
                <Eye className="size-4" aria-hidden />
                View
              </Button>
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-slate-400" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">
          {label}
        </dt>
        <dd className="truncate text-sm font-medium text-slate-700" title={value}>
          {value}
        </dd>
      </div>
    </div>
  );
}

/**
 * Full booking record. The list keeps the mockup's compact layout, so the
 * traveller name/email captured at booking time live here instead.
 */
function BookingDetailsDialog({
  booking,
  onClose,
}: {
  booking: Booking | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={booking !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            {booking?.destinationName ?? "Booking details"}
          </DialogTitle>
          <DialogDescription>
            Everything stored for this booking.
          </DialogDescription>
        </DialogHeader>

        {booking ? (
          <>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
              <User className="size-4 shrink-0 text-slate-400" aria-hidden />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {booking.userName}
                </p>
                <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                  <Mail className="size-3.5 shrink-0" aria-hidden />
                  {booking.userEmail}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <DetailRow
                icon={<MapPin className="size-4" />}
                label="Destination"
                value={`${booking.destinationName}, ${booking.country}`}
              />
              <DetailRow
                icon={<Tag className="size-4" />}
                label="Category"
                value={booking.category}
              />
              <DetailRow
                icon={<CalendarDays className="size-4" />}
                label="Departure"
                value={formatDepartureDate(booking.departureDate)}
              />
              <DetailRow
                icon={<Clock3 className="size-4" />}
                label="Duration"
                value={booking.duration}
              />
              <DetailRow
                icon={<CircleCheck className="size-4" />}
                label="Status"
                value={statusStyles[statusFor(booking)].label}
              />
              <DetailRow
                icon={<Eye className="size-4" />}
                label="Price"
                value={priceFormat.format(booking.price)}
              />
              <DetailRow
                icon={<Tag className="size-4" />}
                label="Booking ID"
                value={booking.id}
              />
              <DetailRow
                icon={<Clock3 className="size-4" />}
                label="Booked"
                value={formatBookedAt(booking.bookedAt)}
              />
            </dl>

            <DialogFooter>
              <Button
                type="button"
                render={<Link href={`/destinations/${booking.packageId}`} />}
                className="bg-brand text-white hover:bg-brand/90"
                onClick={onClose}
              >
                View destination
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default function BookingsPage() {
  const { bookings, error, isLoading, refetch } = useBookings();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const viewingBooking =
    bookings.find((booking) => booking.id === viewingId) ?? null;

  async function handleCancel(id: string, name: string) {
    setRemovingId(id);

    try {
      await removeBooking(id);
      await refetch();
      toast.add({
        title: "Booking cancelled",
        description: `${name} has been removed from your bookings.`,
        type: "success",
      });
    } catch (removeError) {
      toast.add({
        title: "Could not cancel booking",
        description:
          removeError instanceof Error
            ? removeError.message
            : "Please try again.",
        type: "error",
      });
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <main className="flex-1 px-4 pt-28 pb-16 sm:px-6 lg:pt-32">
      <section className="mx-auto max-w-5xl">
        <h1 className="font-serif text-4xl font-normal tracking-tight text-slate-950">
          My Bookings
        </h1>
        <p className="mt-1.5 text-slate-600">
          Manage and view your upcoming travel plans
        </p>

        {error && !isLoading ? (
          <div
            role="alert"
            className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            <span>{error}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="border-amber-300 bg-white"
            >
              Try again
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <ul className="mt-6 flex flex-col gap-4">
            {Array.from({ length: 3 }, (_, index) => (
              <li
                key={index}
                className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:gap-5"
              >
                <Skeleton className="h-44 w-full rounded-lg sm:h-36 sm:w-48 sm:shrink-0" />
                <div className="flex flex-1 flex-col gap-3">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-7 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <Skeleton className="h-7 w-24" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-24 rounded-lg" />
                      <Skeleton className="h-9 w-20 rounded-lg" />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : bookings.length === 0 ? (
          <div className="mt-10 rounded-xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              No bookings yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              {error
                ? "Sign in to see the trips you have booked."
                : "Pick a destination and press Book Now to add it here."}
            </p>
            <Button
              type="button"
              render={<Link href={error ? "/login" : "/destinations"} />}
              className="mt-6 bg-brand text-white hover:bg-brand/90"
            >
              {error ? "Sign In" : "Browse destinations"}
            </Button>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {bookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                isRemoving={removingId === booking.id}
                onView={() => setViewingId(booking.id)}
                onCancel={() => handleCancel(booking.id, booking.destinationName)}
              />
            ))}
          </ul>
        )}
      </section>

      <BookingDetailsDialog
        booking={viewingBooking}
        onClose={() => setViewingId(null)}
      />
    </main>
  );
}

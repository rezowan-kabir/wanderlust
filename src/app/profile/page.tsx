"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Globe,
  MapPin,
  Pencil,
  Plane,
  TrendingUp,
  User,
  DollarSign,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { useBookings } from "@/lib/bookings";
import { EditProfileDialog } from "./edit-profile-dialog";

/** One number in the Travel Statistics grid. */
function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tone}`}
      >
        {icon}
      </span>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col items-center">
          <Skeleton className="size-28 rounded-full" />
          <Skeleton className="mt-4 h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="mt-6 h-11 w-full" />
      </div>
      <div>
        <Skeleton className="h-7 w-48" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** "My Profile" page: account details plus travel statistics from bookings. */
export default function ProfilePage() {
  const {
    data: session,
    isPending,
    refetch,
  } = authClient.useSession();
  const user = session?.user;
  const { bookings, isLoading: bookingsLoading } = useBookings();
  const [isEditing, setIsEditing] = useState(false);

  const stats = useMemo(() => {
    const countries = new Set<string>();
    let upcoming = 0;
    let spent = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const booking of bookings) {
      if (booking.country) {
        countries.add(booking.country);
      }

      // `departureDate` is a YYYY-MM-DD input value; parse at local midnight.
      const departure = new Date(`${booking.departureDate}T00:00:00`);
      if (!Number.isNaN(departure.getTime()) && departure >= today) {
        upcoming += 1;
      }

      spent += booking.price;
    }

    return {
      total: bookings.length,
      countries: countries.size,
      upcoming,
      spent,
    };
  }, [bookings]);

  // `createdAt` is an ISO string on the client session.
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  if (isPending) {
    return (
      <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 lg:pt-32">
        <section className="mx-auto max-w-6xl">
          <ProfileSkeleton />
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 lg:pt-32">
        <section className="mx-auto max-w-6xl">
          <h1 className="font-serif text-4xl text-slate-900">My Profile</h1>
          <p className="mt-2 text-slate-600">
            Manage your account settings and travel preferences
          </p>
          <div className="mt-10 rounded-lg border border-slate-200 px-6 py-12 text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              Sign in to view your profile
            </h2>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              You need an account to see your details and travel statistics.
            </p>
            <Button
              render={<Link href="/login" />}
              className="mt-6 bg-brand text-white hover:bg-brand/90"
            >
              Sign In
            </Button>
          </div>
        </section>
      </main>
    );
  }

  const location = (user as { location?: string }).location;
  const nationality = (user as { nationality?: string }).nationality;

  return (
    <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 lg:pt-32">
      <section className="mx-auto max-w-6xl">
        <h1 className="font-serif text-4xl text-slate-900">My Profile</h1>
        <p className="mt-2 text-slate-600">
          Manage your account settings and travel preferences
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
          {/* Account card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="size-28">
                  <AvatarImage
                    referrerPolicy="no-referrer"
                    src={user.image || ""}
                    alt={user.name || "User"}
                  />
                  <AvatarFallback className="text-2xl">
                    {user.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="size-8" />
                    )}
                  </AvatarFallback>
                </Avatar>
                {/* No upload endpoint exists; opens the edit dialog instead. */}
                <button
                  type="button"
                  aria-label="Change profile photo"
                  onClick={() => setIsEditing(true)}
                  className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-brand text-white shadow-md transition-colors hover:bg-brand/90"
                >
                  <Camera className="size-4" aria-hidden />
                </button>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                {user.name || "Unnamed"}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="size-4" aria-hidden />
                {location || "Location not set"}
              </p>
            </div>

            <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Member since</dt>
                <dd className="font-semibold text-slate-900">{memberSince}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Nationality</dt>
                <dd className="font-semibold text-slate-900">
                  {nationality || "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Email</dt>
                <dd className="truncate font-semibold text-slate-900">
                  {user.email}
                </dd>
              </div>
            </dl>

            <Button
              className="mt-6 h-11 w-full bg-brand text-white hover:bg-brand/90"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-4" aria-hidden />
              Edit Profile
            </Button>
          </div>

          {/* Travel statistics */}
          <div>
            <h2 className="font-serif text-2xl text-slate-900">
              Travel Statistics
            </h2>

            {bookingsLoading ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                  label="Total Bookings"
                  value={String(stats.total)}
                  icon={<Plane className="size-5 text-cyan-500" aria-hidden />}
                  tone="bg-cyan-50"
                />
                <StatCard
                  label="Countries Visited"
                  value={String(stats.countries)}
                  icon={<Globe className="size-5 text-green-500" aria-hidden />}
                  tone="bg-green-50"
                />
                <StatCard
                  label="Upcoming Trips"
                  value={String(stats.upcoming)}
                  icon={
                    <TrendingUp
                      className="size-5 text-orange-500"
                      aria-hidden
                    />
                  }
                  tone="bg-orange-50"
                />
                <StatCard
                  label="Total Spent"
                  value={`$${stats.spent.toLocaleString("en-US")}`}
                  icon={
                    <DollarSign className="size-5 text-pink-500" aria-hidden />
                  }
                  tone="bg-pink-50"
                />
              </div>
            )}

            {!bookingsLoading && bookings.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No bookings yet — your statistics will appear after your first
                trip.{" "}
                <Link
                  href="/destinations"
                  className="font-medium text-brand underline underline-offset-4"
                >
                  Browse destinations
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <EditProfileDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        user={{
          name: user.name || "",
          image: user.image || "",
          location: location || "",
          nationality: nationality || "",
        }}
        onSaved={() => {
          void refetch();
        }}
      />
    </main>
  );
}

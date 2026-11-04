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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { useBookings } from "@/lib/bookings";

type ProfileDetails = {
  name: string;
  image: string;
  location: string;
  nationality: string;
};

const maxProfileImageFileSize = 10 * 1024 * 1024;
const maxProfileImageDataSize = 1024 * 1024;

async function resizeProfileImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }

  if (file.size > maxProfileImageFileSize) {
    throw new Error("Choose an image smaller than 10 MB.");
  }

  const bitmap = await createImageBitmap(file);

  try {
    const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Your browser could not process this image.");
    }

    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0);

    const imageBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Your browser could not process this image."));
          }
        },
        "image/jpeg",
        0.8,
      );
    });

    if (imageBlob.size > maxProfileImageDataSize) {
      throw new Error("This image is too large to save as a profile photo.");
    }

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Your browser could not read this image."));
        }
      };
      reader.onerror = () => {
        reject(reader.error ?? new Error("Your browser could not read this image."));
      };
      reader.readAsDataURL(imageBlob);
    });
  } finally {
    bitmap.close();
  }
}

function EditProfileDialog({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ProfileDetails;
  onSaved: () => Promise<unknown>;
}) {
  const [values, setValues] = useState(user);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState("");

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) return;

    setIsProcessingImage(true);
    setError("");
    try {
      const image = await resizeProfileImage(file);
      setValues((current) => ({ ...current, image }));
    } catch (imageError) {
      setError(
        imageError instanceof Error
          ? imageError.message
          : "Unable to process this image.",
      );
    } finally {
      setIsProcessingImage(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const { error: updateError } = await authClient.updateUser({
        ...values,
        name: values.name.trim(),
        image: values.image.trim() || null,
        location: values.location.trim(),
        nationality: values.nationality.trim(),
      });

      if (updateError) {
        throw new Error(updateError.message || "Unable to save your profile.");
      }

      await onSaved();
      toast.add({
        title: "Profile updated",
        description: "Your account details have been saved.",
        type: "success",
      });
      onOpenChange(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save your profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setValues(user);
          setError("");
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update your account details and travel preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="profile-name">Name</FieldLabel>
              <Input
                id="profile-name"
                type="text"
                value={values.name}
                onChange={(event) =>
                  setValues({ ...values, name: event.target.value })
                }
                disabled={isSaving || isProcessingImage}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-image-file">
                Choose a photo from your device
              </FieldLabel>
              <Input
                id="profile-image-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => void handleImageChange(event)}
                disabled={isSaving || isProcessingImage}
                className="h-auto cursor-pointer py-2 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:font-medium file:text-slate-700"
              />
              <p className="text-xs text-slate-500">
                JPEG, PNG, or WebP; up to 10 MB. Photos are resized before
                saving.
              </p>
              {isProcessingImage ? (
                <p role="status" className="text-sm text-slate-600">
                  Processing photo...
                </p>
              ) : null}
              {values.image ? (
                <Avatar className="size-16">
                  <AvatarImage
                    src={values.image}
                    alt="Profile photo preview"
                  />
                  <AvatarFallback>
                    <User className="size-5" />
                  </AvatarFallback>
                </Avatar>
              ) : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-image-url">
                Or use a profile image URL
              </FieldLabel>
              <Input
                id="profile-image-url"
                type="url"
                value={values.image.startsWith("data:") ? "" : values.image}
                onChange={(event) =>
                  setValues({ ...values, image: event.target.value })
                }
                disabled={isSaving || isProcessingImage}
                placeholder="https://example.com/photo.jpg"
              />
            </Field>
            {([
              ["location", "Location"],
              ["nationality", "Nationality"],
            ] as const).map(([field, label]) => (
              <Field key={field}>
                <FieldLabel htmlFor={`profile-${field}`}>{label}</FieldLabel>
                <Input
                  id={`profile-${field}`}
                  type="text"
                  value={values[field]}
                  onChange={(event) =>
                    setValues({ ...values, [field]: event.target.value })
                  }
                  disabled={isSaving || isProcessingImage}
                />
              </Field>
            ))}
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving || isProcessingImage}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isProcessingImage}
              className="bg-brand text-white hover:bg-brand/90"
            >
              {isProcessingImage
                ? "Processing photo..."
                : isSaving
                  ? "Saving..."
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
      </div>
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-full ${tone}`}
      >
        {icon}
      </span>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center">
          <Skeleton className="size-28 rounded-full" />
          <Skeleton className="mt-4 h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="mt-6 h-11 w-full" />
      </div>
      <div>
        <Skeleton className="h-7 w-48" />
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** "My Profile" page: account details plus travel statistics from bookings. */
export default function ProfilePage() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;
  const {
    bookings,
    error: bookingsError,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = useBookings();
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

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  if (isPending) {
    return (
      <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 lg:pt-32 bg-slate-50/50 min-h-screen">
        <section className="mx-auto max-w-6xl">
          <ProfileSkeleton />
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 lg:pt-32 bg-slate-50/50 min-h-screen">
        <section className="mx-auto max-w-6xl">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-slate-900">
            My Profile
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your account settings and travel preferences
          </p>
          <div className="mt-10 rounded-xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-sm">
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

  const location = user.location;
  const nationality = user.nationality;

  return (
    <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 lg:pt-32 bg-slate-50/30 min-h-screen">
      <section className="mx-auto max-w-6xl">
        <h1 className="font-serif text-4xl font-normal tracking-tight text-slate-950">
          My Profile
        </h1>
        <p className="mt-1.5 text-slate-600">
          Manage your account settings and travel preferences
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
          {/* Account card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="size-28 border-2 border-white shadow-md">
                  <AvatarImage
                    referrerPolicy="no-referrer"
                    src={user.image || ""}
                    alt={user.name || "User"}
                  />
                  <AvatarFallback className="text-2xl bg-slate-100 text-slate-700">
                    {user.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="size-8" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  aria-label="Change profile photo"
                  onClick={() => setIsEditing(true)}
                  className="absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full bg-brand text-white shadow-md transition-colors hover:bg-brand/90"
                >
                  <Camera className="size-4" aria-hidden />
                </button>
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                {user.name || "Unnamed"}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <MapPin className="size-4 text-slate-400" aria-hidden />
                {location || "Location not set"}
              </p>
            </div>

            <dl className="mt-6 space-y-4 border-t border-slate-100 pt-5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Member since</dt>
                <dd className="font-semibold text-slate-900">{memberSince}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Nationality</dt>
                <dd className="font-semibold text-slate-900">
                  {nationality || "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Email</dt>
                <dd
                  className="max-w-[180px] truncate font-semibold text-slate-900"
                  title={user.email}
                >
                  {user.email}
                </dd>
              </div>
            </dl>

            <Button
              className="mt-6 h-11 w-full bg-brand font-medium text-white shadow-sm hover:bg-brand/90"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-4 mr-2" aria-hidden />
              Edit Profile
            </Button>
          </div>

          {/* Travel statistics */}
          <div>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-slate-950">
              Travel Statistics
            </h2>

            {bookingsError && !bookingsLoading ? (
              <div
                role="alert"
                className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
              >
                <span>{bookingsError}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void refetchBookings()}
                  className="border-amber-300 bg-white"
                >
                  Try again
                </Button>
              </div>
            ) : null}

            {bookingsLoading ? (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : !bookingsError ? (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <StatCard
                  label="Total Bookings"
                  value={String(stats.total)}
                  icon={<Plane className="size-5 text-cyan-600" aria-hidden />}
                  tone="bg-cyan-50"
                />
                <StatCard
                  label="Countries Booked"
                  value={String(stats.countries)}
                  icon={
                    <Globe className="size-5 text-emerald-600" aria-hidden />
                  }
                  tone="bg-emerald-50"
                />
                <StatCard
                  label="Upcoming Trips"
                  value={String(stats.upcoming)}
                  icon={
                    <TrendingUp className="size-5 text-amber-500" aria-hidden />
                  }
                  tone="bg-amber-50"
                />
                <StatCard
                  label="Total Spent"
                  value={`$${stats.spent.toLocaleString("en-US")}`}
                  icon={
                    <DollarSign
                      className="size-5 text-fuchsia-600"
                      aria-hidden
                    />
                  }
                  tone="bg-fuchsia-50"
                />
              </div>
            ) : null}

            {!bookingsLoading && !bookingsError && bookings.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No bookings yet — your statistics will appear after your first
                trip.{" "}
                <Link
                  href="/destinations"
                  className="font-medium text-brand underline underline-offset-4 hover:opacity-80"
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
        onSaved={() => refetch()}
      />
    </main>
  );
}

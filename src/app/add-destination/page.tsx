"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  saveTravelPackage,
  useTravelPackages,
} from "@/lib/travel-packages";

const categories = [
  { value: "beach", label: "Beach" },
  { value: "mountain", label: "Mountain" },
  { value: "city", label: "City" },
  { value: "adventure", label: "Adventure" },
  { value: "cultural", label: "Cultural" },
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Form inputs share the light-slate fill from the design. */
const fieldClass = "border-slate-200 bg-slate-50 placeholder:text-slate-400";

/** Package creation form shown on /add-destination. */
export default function AddDestinationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const { packages, error: storageError } = useTravelPackages();

  async function addPackage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const entry = {
      destinationName: String(formData.get("destinationName") ?? "").trim(),
      country: String(formData.get("country") ?? "").trim(),
      category:
        categories.find((option) => option.value === category)?.label ?? "",
      price: Number(formData.get("price") ?? 0),
      duration: String(formData.get("duration") ?? "").trim(),
      departureDate: String(formData.get("departureDate") ?? ""),
      imageUrl: String(formData.get("imageUrl") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/add-destination`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });
      const data: unknown = await response.json();
     
      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Failed to add destination.";
        throw new Error(message);
      }

      saveTravelPackage(entry);
      toast.add({
        title: "Travel package added",
        description: `${entry.destinationName} has been added to your packages.`,
        type: "success",
      });

      form.reset();
      setCategory(null);
    } catch (error) {
      toast.add({
        title: "Could not add travel package",
        description:
          error instanceof Error
            ? error.message
            : "Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex-1 px-6 pt-24 pb-20 ">
      <div className="max-w-2xl mx-auto">
        <h1 className=" text-4xl font-light tracking-tight text-slate-900">
          Add New Travel Package
        </h1>
        <p className="mt-2 text-slate-600">
          Create a package to make it available in your destinations.
        </p>
      </div>

      <Card className="mx-auto mt-14 w-full max-w-[544px] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-0 [--card-spacing:1.75rem]">
        <form
          className="flex flex-col gap-4 px-7"
          onReset={() => {
            setCategory(null);
          }}
          onSubmit={addPackage}
        >
          <Field>
            <FieldLabel htmlFor="destination-name" className="font-semibold">
              Destination Name
            </FieldLabel>
            <Input
              id="destination-name"
              name="destinationName"
              placeholder="Bali Paradise"
              required
              disabled={isSubmitting}
              className={fieldClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="country" className="font-semibold">
                Country
              </FieldLabel>
              <Input
                id="country"
                name="country"
                placeholder="Indonesia"
                required
                disabled={isSubmitting}
                className={fieldClass}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="category" className="font-semibold">
                Category
              </FieldLabel>
              <Select
                name="category"
                required
                value={category}
                disabled={isSubmitting}
                onValueChange={(value) => {
                  setCategory(value == null ? null : String(value));
                }}
              >
                <SelectTrigger
                  id="category"
                  className={`w-full ${fieldClass} data-placeholder:text-slate-400`}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="price" className="font-semibold">
                Price (USD)
              </FieldLabel>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 1299"
                required
                disabled={isSubmitting}
                className={fieldClass}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="duration" className="font-semibold">
                Duration
              </FieldLabel>
              <Input
                id="duration"
                name="duration"
                placeholder="e.g., 7 Days/6 Nights"
                required
                disabled={isSubmitting}
                className={fieldClass}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="departure-date" className="font-semibold">
              Departure Date
            </FieldLabel>
            <Input
              id="departure-date"
              name="departureDate"
              type="date"
              required
              disabled={isSubmitting}
              className={fieldClass}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="image-url" className="font-semibold">
              Image URL
            </FieldLabel>
            <Input
              id="image-url"
              name="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              required
              disabled={isSubmitting}
              className={fieldClass}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="description" className="font-semibold">
              Description
            </FieldLabel>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the travel experience..."
              required
              disabled={isSubmitting}
              className={`${fieldClass} min-h-[100px] resize-none`}
            />
          </Field>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="reset"
              variant="outline"
              disabled={isSubmitting}
              className="border-red-500 px-4 text-red-500 hover:border-red-500 hover:bg-red-50 hover:text-red-500"
            >
              <Trash className="size-4" aria-hidden />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand px-4 text-white hover:bg-brand/90"
            >
              {isSubmitting ? (
                <span>Adding Package...</span>
              ) : (
                <>
                  <Save className="size-4" aria-hidden />
                  Add Travel Package
                </>
              )}
            </Button>
          </div>

          {storageError ? (
            <p role="alert" className="text-sm font-medium text-red-600">
              {storageError}
            </p>
          ) : null}
        </form>
      </Card>

      {packages.length > 0 ? (
        <section className="mx-auto mt-10 w-full max-w-[544px]">
          <h2 className="flex items-baseline gap-2 text-lg font-medium text-slate-900">
            Added packages
            <span className="text-sm font-normal text-slate-500">
              {packages.length}
            </span>
          </h2>

          <ul className="mt-4 flex flex-col gap-3">
            {packages.map((travelPackage) => (
              <li key={travelPackage.id}>
                <Card className="rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-0 [--card-spacing:1rem]">
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">
                          {travelPackage.destinationName}
                        </p>
                        <p className="text-sm text-slate-500">
                          {travelPackage.country}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                        {travelPackage.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                      <span>
                        ${travelPackage.price.toLocaleString("en-US")}
                      </span>
                      <span>{travelPackage.duration}</span>
                      <time dateTime={travelPackage.departureDate}>
                        {travelPackage.departureDate}
                      </time>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-600">
                      {travelPackage.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="mx-auto mt-8 w-full max-w-[544px] text-sm text-slate-600">
        <Link
          href="/destinations"
          className="font-medium text-brand underline underline-offset-4"
        >
          View all destinations
        </Link>
      </p>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  API_BASE_URL,
  updateTravelPackage,
  type TravelPackage,
} from "@/lib/travel-packages";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

const categories = [
  { value: "beach", label: "Beach" },
  { value: "mountain", label: "Mountain" },
  { value: "city", label: "City" },
  { value: "adventure", label: "Adventure" },
  { value: "cultural", label: "Cultural" },
];

/** Form inputs share the light-slate fill from the design. */
const fieldClass = "border-slate-200 bg-slate-50 placeholder:text-slate-400";

export function EditPackageForm({
  destination,
}: {
  destination: TravelPackage;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<string | null>(() => {
    // The API stores the display label ("Beach"), the select uses values.
    return (
      categories.find(
        (option) =>
          option.label.toLowerCase() === destination.category.toLowerCase(),
      )?.value ?? null
    );
  });

  async function updatePackage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
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
      const token = await getTokenFromClient()
      const response = await fetch(
        `${API_BASE_URL}/destination/${destination.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
           
              Authorization: `Bearer ${token}`,
            
          },
          body: JSON.stringify(entry),
        },
      );

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}.`);
      }

      // Keep the browser fallback copy in step with the API record.
      updateTravelPackage(destination.id, entry);

      toast.add({
        title: "Travel package updated",
        description: `${entry.destinationName} has been saved.`,
        type: "success",
      });
      router.push(`/destinations/${destination.id}`);
    } catch (error) {
      toast.add({
        title: "Could not update travel package",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto mt-10 w-full max-w-[544px] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-0 [--card-spacing:1.75rem]">
      <form className="flex flex-col gap-4 px-7" onSubmit={updatePackage}>
        <Field>
          <FieldLabel htmlFor="destination-name" className="font-semibold">
            Destination Name
          </FieldLabel>
          <Input
            id="destination-name"
            name="destinationName"
            defaultValue={destination.destinationName}
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
              defaultValue={destination.country}
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
              defaultValue={destination.price}
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
              defaultValue={destination.duration}
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
            defaultValue={destination.departureDate}
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
            defaultValue={destination.imageUrl}
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
            defaultValue={destination.description}
            required
            disabled={isSubmitting}
            className={`${fieldClass} min-h-[100px] resize-none`}
          />
        </Field>

        <div className="flex justify-end gap-3 pt-3">
          <Button
            variant="outline"
            disabled={isSubmitting}
            render={<Link href={`/destinations/${destination.id}`} />}
          >
            <X className="size-4" aria-hidden />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand px-4 text-white hover:bg-brand/90"
          >
            {isSubmitting ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save className="size-4" aria-hidden />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

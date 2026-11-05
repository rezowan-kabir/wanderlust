"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { toast } from "@/components/ui/toast";
import { API_BASE_URL, removeTravelPackage } from "@/lib/travel-packages";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

/**
 * Destructive, so it takes two clicks: the first arms the button, the second
 * deletes. Blurring disarms it so a stray click cannot remove a destination.
 */
export function DeleteDestinationButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleClick() {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    setIsDeleting(true);

    try {
      const token = await getTokenFromClient()
      const response = await fetch(`${API_BASE_URL}/destination/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}.`);
      }

      try {
        removeTravelPackage(id);
      } catch {
        // The API delete already succeeded; a stale browser copy is harmless.
      }

      toast.add({
        title: "Destination deleted",
        description: `${name} has been removed from your destinations.`,
        type: "success",
      });
      router.push("/destinations");
    } catch (error) {
      toast.add({
        title: "Could not delete destination",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
      setIsConfirming(false);
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      disabled={isDeleting}
      onBlur={() => setIsConfirming(false)}
      onClick={handleClick}
      className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        isConfirming
          ? "border-rose-500 bg-rose-500 text-white hover:bg-rose-600"
          : "border-rose-200 text-rose-500 hover:bg-rose-50"
      }`}
    >
      <Trash2 className="h-4 w-4" aria-hidden />
      {isDeleting
        ? "Deleting..."
        : isConfirming
          ? "Confirm delete?"
          : "Delete"}
    </button>
  );
}

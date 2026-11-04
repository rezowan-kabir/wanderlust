import { NextResponse } from "next/server";

import { createBooking, listBookings } from "@/lib/booking-store";
import type { NewBookingInput } from "@/lib/booking-store";
import { getSessionUser } from "@/lib/session";

/** Fields the client may send when creating a booking. */
const packageFields = [
  "packageId",
  "destinationName",
  "country",
  "category",
  "price",
  "duration",
  "departureDate",
  "imageUrl",
] as const;

function readPackageInput(body: unknown): NewBookingInput | null {
  if (typeof body !== "object" || body === null) return null;

  const record = body as Record<string, unknown>;

  for (const field of packageFields) {
    if (field === "price") {
      if (typeof record.price !== "number" || !Number.isFinite(record.price)) {
        return null;
      }
      continue;
    }

    if (typeof record[field] !== "string") {
      return null;
    }
  }

  return {
    packageId: record.packageId as string,
    destinationName: record.destinationName as string,
    country: record.country as string,
    category: record.category as string,
    price: record.price as number,
    duration: record.duration as string,
    departureDate: record.departureDate as string,
    imageUrl: record.imageUrl as string,
  };
}

/** List the signed-in user's bookings. */
export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const bookings = await listBookings(user.id);
  return NextResponse.json({ bookings });
}

/** Create a booking for the signed-in user. */
export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const input = readPackageInput(await request.json().catch(() => null));

  if (!input) {
    return NextResponse.json(
      { message: "Invalid booking payload." },
      { status: 400 },
    );
  }

  const booking = await createBooking(user.id, user.name, user.email, input);
  return NextResponse.json({ booking }, { status: 201 });
}

import { NextResponse } from "next/server";

import { deleteBooking } from "@/lib/booking-store";
import { getSessionUser } from "@/lib/session";

/** Delete one of the signed-in user's bookings. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteBooking(user.id, id);

  if (!deleted) {
    return NextResponse.json(
      { message: "Booking not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ message: "Booking deleted." });
}

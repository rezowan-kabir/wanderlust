import { ObjectId } from "mongodb";

import { db } from "./mongodb";
import type { Booking } from "./booking-types";

/** Shape of a booking document as stored in MongoDB. */
type BookingDocument = {
  _id: ObjectId;
  userId: string;
  userName: string;
  userEmail: string;
  packageId: string;
  destinationName: string;
  country: string;
  category: string;
  price: number;
  duration: string;
  departureDate: string;
  imageUrl: string;
  bookedAt: string;
};

const bookings = db.collection<BookingDocument>("bookings");

function toBooking(doc: BookingDocument): Booking {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

/** Fields the client supplies when creating a booking. */
export type NewBookingInput = {
  packageId: string;
  destinationName: string;
  country: string;
  category: string;
  price: number;
  duration: string;
  departureDate: string;
  imageUrl: string;
};

/** Insert a booking stamped with the authenticated user's identity. */
export async function createBooking(
  userId: string,
  userName: string,
  userEmail: string,
  input: NewBookingInput,
): Promise<Booking> {
  // `insertOne` attaches `_id` to the object it is given, so the stored doc is
  // captured first and the returned booking is built explicitly (never spread).
  const stored: Omit<BookingDocument, "_id"> = {
    userId,
    userName,
    userEmail,
    packageId: input.packageId,
    destinationName: input.destinationName,
    country: input.country,
    category: input.category,
    price: input.price,
    duration: input.duration,
    departureDate: input.departureDate,
    imageUrl: input.imageUrl,
    bookedAt: new Date().toISOString(),
  };

  const result = await bookings.insertOne({ ...stored } as BookingDocument);

  return { id: result.insertedId.toString(), ...stored };
}

/** List every booking belonging to a user, newest first. */
export async function listBookings(userId: string): Promise<Booking[]> {
  const docs = await bookings
    .find({ userId })
    .sort({ bookedAt: -1 })
    .toArray();

  return docs.map(toBooking);
}

/**
 * Delete one booking, scoped to its owner. Returns false when the id is
 * malformed or the booking does not belong to the caller.
 */
export async function deleteBooking(
  userId: string,
  id: string,
): Promise<boolean> {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return false;
  }

  const result = await bookings.deleteOne({
    _id: ObjectId.createFromHexString(id),
    userId,
  });

  return result.deletedCount > 0;
}

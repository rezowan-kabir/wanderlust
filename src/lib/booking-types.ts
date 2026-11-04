/**
 * A stored booking.
 *
 * Package fields are copied at booking time so the record stays intact even
 * if the API later stops returning that package.
 *
 * `userId`, `userName` and `userEmail` are stamped server-side from the
 * verified Better Auth session — never taken from the request body.
 */
export type Booking = {
  id: string;
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

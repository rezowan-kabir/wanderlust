import { MongoClient } from "mongodb";

/**
 * Shared MongoDB connection for app data (bookings).
 *
 * Uses the same connection string and database as Better Auth (`wamderlust`,
 * note the typo — renaming it would orphan existing auth collections) so
 * booking records live alongside auth data.
 *
 * The driver queues operations until the first connect resolves, so callers
 * can use `db` directly without awaiting a connection.
 */
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is required.");
}

const client = new MongoClient(uri);

export const db = client.db("wamderlust");

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached: typeof mongoose | null = null;

/** Connect when `MONGODB_URI` is set; otherwise returns null (optional features use in-memory only). */
export async function connectDb(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) return null;
  if (cached) return cached;
  cached = await mongoose.connect(MONGODB_URI);
  return cached;
}

/** Required for auth and user APIs. */
export async function requireMongo(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env for authentication and profiles.");
  }
  const c = await connectDb();
  if (!c) throw new Error("MongoDB connection failed.");
  return c;
}

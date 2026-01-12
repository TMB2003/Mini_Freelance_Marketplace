import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "./app.js";
import { connectDB } from "./connectDB.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Ensure MongoDB is connected before handling request
  await connectDB();

  return app(req, res);
}

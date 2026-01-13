import { Hono } from "hono";
import { cors } from "hono/cors";
import { StatusCodes } from "http-status-codes";
import { serveStatic } from "hono/bun";
import routes from "./routes";
import { logger } from "hono/logger";
import { connectDB } from "./utils/db";

// Connect to MongoDB
await connectDB(process.env.MONGODB_URI as string);

// Initialize Hono app
const app = new Hono();

//logger
app.use(logger());

// CORS Middleware
app.use(cors());

// Static file serving for uploads
app.use("/uploads/*", serveStatic({ root: "./" }));

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", service: "Rentals-Backend" });
});

// API Routes
app.route("/", routes)

// 404 Handler
app.notFound((c) => {
  return c.json({ error: "Not Found" }, StatusCodes.NOT_FOUND);
});

// Error Handler
app.onError((err, c) => {
  console.error("Error:", err);
  return c.json(
    { error: "Internal Server Error" },
    StatusCodes.INTERNAL_SERVER_ERROR
  );
});

// Export the app
const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 5000;

console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
  idleTimeout: 0, // Disable idle timeout
};

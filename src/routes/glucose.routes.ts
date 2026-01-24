import { Hono } from "hono";
import { GlucoseController } from "../controllers/glucose.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const glucoseRoutes = new Hono();
const glucoseController = new GlucoseController();

glucoseRoutes.use("*", authMiddleware);

// Get all glucose readings
glucoseRoutes.get("/", (ctx) => glucoseController.getAll(ctx));

// Get latest glucose reading
glucoseRoutes.get("/latest", (ctx) => glucoseController.getLatest(ctx));

// Get glucose readings by date range
glucoseRoutes.get("/range", (ctx) => glucoseController.getByDateRange(ctx));

// Get glucose readings by meal context
glucoseRoutes.get("/context", (ctx) => glucoseController.getByMealContext(ctx));

// Get glucose statistics
glucoseRoutes.get("/stats", (ctx) => glucoseController.getStats(ctx));

// Get single glucose reading by ID
glucoseRoutes.get("/:id", (ctx) => glucoseController.getById(ctx));

// Create new glucose reading
glucoseRoutes.post("/", (ctx) => glucoseController.create(ctx));

// Update glucose reading
glucoseRoutes.put("/:id", (ctx) => glucoseController.update(ctx));

// Delete glucose reading
glucoseRoutes.delete("/:id", (ctx) => glucoseController.delete(ctx));

export default glucoseRoutes;

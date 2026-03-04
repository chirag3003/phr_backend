import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { WaterController } from "../controllers";

const waterRoutes = new Hono();
const waterController = new WaterController();

waterRoutes.use("*", authMiddleware);

// Get all water records
waterRoutes.get("/", (ctx) => waterController.getAll(ctx));

// Get latest water record
waterRoutes.get("/latest", (ctx) => waterController.getLatest(ctx));

// Get water records by date range
waterRoutes.get("/range", (ctx) => waterController.getByDateRange(ctx));

// Get water record by date
waterRoutes.get("/date", (ctx) => waterController.getByDate(ctx));

// Get single water record by ID
waterRoutes.get("/:id", (ctx) => waterController.getById(ctx));

// Create or update water record for a date
waterRoutes.post("/", (ctx) => waterController.upsert(ctx));

// Update water record by ID
waterRoutes.put("/:id", (ctx) => waterController.update(ctx));

// Delete water record by ID
waterRoutes.delete("/:id", (ctx) => waterController.delete(ctx));

export default waterRoutes;

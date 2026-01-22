import { Hono } from "hono";
import { glucoseController } from "../controllers/glucose.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const glucoseRoutes = new Hono();

glucoseRoutes.use("*", authMiddleware);

// Get all glucose readings
glucoseRoutes.get("/", glucoseController.getAll);

// Get latest glucose reading
glucoseRoutes.get("/latest", glucoseController.getLatest);

// Get glucose readings by date range
glucoseRoutes.get("/range", glucoseController.getByDateRange);

// Get glucose readings by meal context
glucoseRoutes.get("/context", glucoseController.getByMealContext);

// Get glucose statistics
glucoseRoutes.get("/stats", glucoseController.getStats);

// Get single glucose reading by ID
glucoseRoutes.get("/:id", glucoseController.getById);

// Create new glucose reading
glucoseRoutes.post("/", glucoseController.create);

// Update glucose reading
glucoseRoutes.put("/:id", glucoseController.update);

// Delete glucose reading
glucoseRoutes.delete("/:id", glucoseController.delete);

export default glucoseRoutes;

import { Hono } from "hono";
import { StepsController } from "../controllers/steps.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const stepsRoutes = new Hono();
const stepsController = new StepsController();

stepsRoutes.use("*", authMiddleware);

// Sync steps from mobile app - POST /steps/sync
stepsRoutes.post("/sync", (ctx) => stepsController.sync(ctx));

// Get last sync date and next sync start date - GET /steps/last-updated
stepsRoutes.get("/last-updated", (ctx) => stepsController.getLastUpdated(ctx));

// Get all steps - GET /steps
stepsRoutes.get("/", (ctx) => stepsController.getAll(ctx));

// Get latest step record - GET /steps/latest
stepsRoutes.get("/latest", (ctx) => stepsController.getLatest(ctx));

// Get steps by date range - GET /steps/range?startDate=...&endDate=...
stepsRoutes.get("/range", (ctx) => stepsController.getByDateRange(ctx));

// Get step statistics - GET /steps/stats?startDate=...&endDate=...
stepsRoutes.get("/stats", (ctx) => stepsController.getStats(ctx));

// Delete step record by ID - DELETE /steps/:id
stepsRoutes.delete("/:id", (ctx) => stepsController.delete(ctx));

export default stepsRoutes;

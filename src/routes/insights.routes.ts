import { Hono } from "hono";
import { InsightsController } from "../controllers/insights.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const insightsRoutes = new Hono();
const insightsController = new InsightsController();

insightsRoutes.use("*", authMiddleware);

// Get AI-generated meal insights and tips
insightsRoutes.get("/meals", (ctx) => insightsController.getMealInsights(ctx));

// Get AI-generated glucose insights and tips
insightsRoutes.get("/glucose", (ctx) => insightsController.getGlucoseInsights(ctx));

// Generate health summary PDF
insightsRoutes.post("/summary", (ctx) => insightsController.generateSummary(ctx));

export default insightsRoutes;

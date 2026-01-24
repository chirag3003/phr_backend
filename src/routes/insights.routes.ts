import { Hono } from "hono";
import { insightsController } from "../controllers/insights.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const insightsRoutes = new Hono();

insightsRoutes.use("*", authMiddleware);

// Get AI-generated meal insights and tips
insightsRoutes.get("/meals", insightsController.getMealInsights);

// Get AI-generated glucose insights and tips
insightsRoutes.get("/glucose", insightsController.getGlucoseInsights);

export default insightsRoutes;

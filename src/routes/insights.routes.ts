import { Hono } from "hono";
import { InsightsController, WaterInsightsController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const insightsRoutes = new Hono();
const insightsController = new InsightsController();
const waterInsightsController = new WaterInsightsController();

insightsRoutes.use("*", authMiddleware);

// Get AI-generated meal insights and tips
insightsRoutes.get("/meals", (ctx) => insightsController.getMealInsights(ctx));

// Get AI-generated glucose insights and tips
insightsRoutes.get("/glucose", (ctx) => insightsController.getGlucoseInsights(ctx));

// Get AI-generated activity insights
insightsRoutes.get("/activity", (ctx) => insightsController.getActivityInsights(ctx));

// Generate health summary PDF
insightsRoutes.post("/summary", (ctx) => insightsController.generateSummary(ctx));

// Get AI-generated water insights
insightsRoutes.get("/water", (ctx) => waterInsightsController.getWaterInsights(ctx));

export default insightsRoutes;

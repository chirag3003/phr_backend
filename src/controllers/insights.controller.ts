import { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import { InsightsService } from "../services/insights.service";

const insightsService = new InsightsService();

export class InsightsController {
  async getMealInsights(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const insights = await insightsService.getMealInsights(userId);
      return ctx.json(insights, StatusCodes.OK);
    } catch (error: any) {
      console.error("Error generating meal insights:", error);
      return ctx.json(
        { error: error.message || "Failed to generate meal insights" },
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getGlucoseInsights(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const insights = await insightsService.getGlucoseInsights(userId);
      return ctx.json(insights, StatusCodes.OK);
    } catch (error: any) {
      console.error("Error generating glucose insights:", error);
      return ctx.json(
        { error: error.message || "Failed to generate glucose insights" },
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import { WaterInsightsService } from "../services/waterInsights.service";

const waterInsightsService = new WaterInsightsService();

export class WaterInsightsController {
  async getWaterInsights(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const insights = await waterInsightsService.getWaterInsights(userId);
      return ctx.json(insights, StatusCodes.OK);
    } catch (error: any) {
      console.error("Error generating water insights:", error);
      return ctx.json(
        { error: error.message || "Failed to generate water insights" },
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

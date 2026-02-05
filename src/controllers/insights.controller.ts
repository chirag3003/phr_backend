import type { Context } from "hono";
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
  async generateSummary(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const body = await ctx.req.json();

      // Validate request
      const { startDate, endDate, include } = (await import("../validators/summary.validator")).summaryRequestSchema.parse(body);

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Fetch data
      const data = await insightsService.getSummaryData(userId, start, end);

      // Filter based on 'include' flags
      // We fetched everything by range, now we just nullify/empty what's not needed
      // Or we could have passed 'include' to service to minimize DB calls, but for now filtering here is fine.
      if (!include.glucose) data.glucose = [];
      if (!include.symptoms) data.symptoms = [];
      if (!include.meals) data.meals = [];
      if (!include.documents) data.documents = [];

      // Generate PDF
      const { PdfService } = await import("../services/pdf.service");
      const pdfService = new PdfService();
      const pdfUrl = await pdfService.generateHealthSummary(data);

      return ctx.json({ url: pdfUrl }, StatusCodes.CREATED);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return ctx.json({ error: error.issues }, StatusCodes.BAD_REQUEST);
      }
      console.error("Error generating summary PDF:", error);
      return ctx.json(
        { error: error.message || "Failed to generate summary PDF" },
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

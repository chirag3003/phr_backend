import type { Context } from "hono";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { StepsService } from "../services/steps.service";
import { syncStepsRequestSchema } from "../validators";
import { ZodError } from "zod";

const stepsService = new StepsService();

export class StepsController {
  /**
   * POST /steps/sync - Sync step data from mobile app
   * Accepts bulk array of steps, validates dates, performs upsert
   */
  async sync(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const body = syncStepsRequestSchema.parse(await ctx.req.json());

      const result = await stepsService.syncSteps(userId, body);
      return ctx.json(
        {
          synced: result.synced,
          lastSyncDate: result.lastSyncDate,
          message: `Successfully synced ${result.synced} day(s) of step data`,
        },
        StatusCodes.OK
      );
    } catch (e) {
      if (e instanceof ZodError) {
        return ctx.json({ error: e }, StatusCodes.BAD_REQUEST);
      }
      if (e instanceof Error && e.message.includes("Invalid date")) {
        return ctx.json({ error: e.message }, StatusCodes.BAD_REQUEST);
      }
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * GET /steps/last-updated - Get last sync date and next sync start date
   * Used by mobile app to determine what date range to sync next
   */
  async getLastUpdated(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const result = await stepsService.getLastSyncDate(userId);
      return ctx.json(result, StatusCodes.OK);
    } catch (e) {
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * GET /steps - Get all steps for user, sorted by date descending
   */
  async getAll(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const steps = await stepsService.getSteps(userId);
      return ctx.json(steps, StatusCodes.OK);
    } catch (e) {
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * GET /steps/range - Get steps within a date range
   */
  async getByDateRange(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const startDate = ctx.req.query("startDate");
      const endDate = ctx.req.query("endDate");

      if (!startDate || !endDate) {
        return ctx.json({ error: "startDate and endDate query parameters are required" }, StatusCodes.BAD_REQUEST);
      }

      const steps = await stepsService.getStepsByDateRange(userId, new Date(startDate), new Date(endDate));
      return ctx.json(steps, StatusCodes.OK);
    } catch (e) {
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * GET /steps/latest - Get the most recent step record
   */
  async getLatest(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const steps = await stepsService.getLatestSteps(userId);
      if (!steps) {
        return ctx.json({ error: "No steps found" }, StatusCodes.NOT_FOUND);
      }
      return ctx.json(steps, StatusCodes.OK);
    } catch (e) {
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * GET /steps/stats - Get step statistics for a date range
   */
  async getStats(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const startDate = ctx.req.query("startDate");
      const endDate = ctx.req.query("endDate");

      if (!startDate || !endDate) {
        return ctx.json({ error: "startDate and endDate query parameters are required" }, StatusCodes.BAD_REQUEST);
      }

      const stats = await stepsService.getStepsStats(userId, new Date(startDate), new Date(endDate));
      return ctx.json(stats, StatusCodes.OK);
    } catch (e) {
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * DELETE /steps/:id - Delete a step record by ID
   */
  async delete(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const steps = await stepsService.deleteSteps(id);
      if (!steps) {
        return ctx.json({ error: "Steps record not found" }, StatusCodes.NOT_FOUND);
      }
      return ctx.json({}, StatusCodes.OK);
    } catch (e) {
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

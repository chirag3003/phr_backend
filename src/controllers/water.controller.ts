import type { Context } from "hono";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { WaterService } from "../services";
import { createWaterSchema, updateWaterSchema } from "../validators";
import { ZodError } from "zod";

const waterService = new WaterService();

export class WaterController {
  async getAll(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const records = await waterService.getWaterByUserId(userId);
      return ctx.json(records, StatusCodes.OK);
    } catch (e) {
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getById(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const record = await waterService.getWaterById(id);
      if (!record) {
        return ctx.json({ error: "Water intake not found" }, StatusCodes.NOT_FOUND);
      }
      return ctx.json(record, StatusCodes.OK);
    } catch (e) {
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getByDateRange(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const startDate = ctx.req.query("startDate");
      const endDate = ctx.req.query("endDate");
      if (!startDate || !endDate) {
        return ctx.json({ error: "startDate and endDate are required" }, StatusCodes.BAD_REQUEST);
      }

      const records = await waterService.getWaterByDateRange(
        userId,
        new Date(startDate),
        new Date(endDate),
      );
      return ctx.json(records, StatusCodes.OK);
    } catch (e) {
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getByDate(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const date = ctx.req.query("date");
      if (!date) {
        return ctx.json({ error: "date is required" }, StatusCodes.BAD_REQUEST);
      }

      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return ctx.json({ error: "Invalid date format" }, StatusCodes.BAD_REQUEST);
      }

      const record = await waterService.getOrCreateWaterByDate(userId, parsedDate);
      return ctx.json(record, StatusCodes.OK);
    } catch (e) {
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getLatest(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const record = await waterService.getLatestWater(userId);
      if (!record) {
        return ctx.json({ error: "No water intake records found" }, StatusCodes.NOT_FOUND);
      }
      return ctx.json(record, StatusCodes.OK);
    } catch (e) {
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async upsert(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const body = createWaterSchema.parse(await ctx.req.json());
      const record = await waterService.upsertWaterByDate(userId, body);
      return ctx.json(record, StatusCodes.CREATED);
    } catch (e) {
      if (e instanceof ZodError) {
        return ctx.json({ error: e }, StatusCodes.BAD_REQUEST);
      }
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async update(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const body = updateWaterSchema.parse(await ctx.req.json());
      const record = await waterService.updateWater(id, body);
      if (!record) {
        return ctx.json({ error: "Water intake not found" }, StatusCodes.NOT_FOUND);
      }
      return ctx.json(record, StatusCodes.OK);
    } catch (e) {
      if (e instanceof ZodError) {
        return ctx.json({ error: e }, StatusCodes.BAD_REQUEST);
      }
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const record = await waterService.deleteWater(id);
      if (!record) {
        return ctx.json({ error: "Water intake not found" }, StatusCodes.NOT_FOUND);
      }
      return ctx.json({}, StatusCodes.OK);
    } catch (e) {
      console.error(e);
      return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

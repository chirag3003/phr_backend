import type { Context } from "hono";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { glucoseService } from "../services/glucose.service";
import { createGlucoseSchema, updateGlucoseSchema } from "../validators/glucose.schema";
import { ZodError } from "zod";

export const glucoseController = {
    async getAll(ctx: Context) {
        try {
            const userId = ctx.get("userId");
            const glucoseReadings = await glucoseService.findAll(userId);
            return ctx.json(glucoseReadings, StatusCodes.OK);
        } catch (e) {
            console.error(e);
            return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    async getById(ctx: Context) {
        try {
            const id = ctx.req.param("id");
            const glucose = await glucoseService.findById(id);
            if (!glucose) {
                return ctx.json({ error: "Glucose reading not found" }, StatusCodes.NOT_FOUND);
            }
            return ctx.json(glucose, StatusCodes.OK);
        } catch (e) {
            console.error(e);
            return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    async getByDateRange(ctx: Context) {
        try {
            const userId = ctx.get("userId");
            const startDate = ctx.req.query("startDate");
            const endDate = ctx.req.query("endDate");
            if (!startDate || !endDate) {
                return ctx.json({ error: "startDate and endDate are required" }, StatusCodes.BAD_REQUEST);
            }

            const glucoseReadings = await glucoseService.findByDateRange(
                userId,
                new Date(startDate),
                new Date(endDate)
            );
            return ctx.json(glucoseReadings, StatusCodes.OK);
        } catch (e) {
            console.error(e);
            return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    async getByMealContext(ctx: Context) {
        try {
            const userId = ctx.get("userId");
            const mealContext = ctx.req.query("mealContext");
            if (!mealContext) {
                return ctx.json({ error: "mealContext is required" }, StatusCodes.BAD_REQUEST);
            }

            const glucoseReadings = await glucoseService.findByMealContext(userId, mealContext);
            return ctx.json(glucoseReadings, StatusCodes.OK);
        } catch (e) {
            console.error(e);
            return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    async getLatest(ctx: Context) {
        try {
            const userId = ctx.get("userId");
            const glucose = await glucoseService.getLatest(userId);
            if (!glucose) {
                return ctx.json({ error: "No glucose readings found" }, StatusCodes.NOT_FOUND);
            }
            return ctx.json(glucose, StatusCodes.OK);
        } catch (e) {
            console.error(e);
            ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    async getStats(ctx: Context) {
        try {
            const userId = ctx.get("userId");
            const startDate = ctx.req.query("startDate");
            const endDate = ctx.req.query("endDate");

            if (!startDate || !endDate) {
                return ctx.json({ error: "startDate and endDate are required" }, StatusCodes.BAD_REQUEST);
            }

            const stats = await glucoseService.getStats(
                userId,
                new Date(startDate),
                new Date(endDate)
            );
            return ctx.json(stats, StatusCodes.OK);
        } catch (e) {
            console.error(e);
            return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    async create(ctx: Context) {
        try {
            const userId = ctx.get("userId");
            const body = createGlucoseSchema.parse(await ctx.req.json());

            const glucose = await glucoseService.create(userId, body);
            return ctx.json(glucose, StatusCodes.CREATED);
        } catch (e) {
            if (e instanceof ZodError) {
                return ctx.json({ error: e }, StatusCodes.BAD_REQUEST);
            }
            console.error(e);
            return ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    async update(ctx: Context) {
        try {
            const id = ctx.req.param("id");
            const body = updateGlucoseSchema.parse(await ctx.req.json());

            const glucose = await glucoseService.update(id, body);
            if (!glucose) {
                return ctx.json({ error: "Glucose reading not found" }, StatusCodes.NOT_FOUND);
            }
            return ctx.json(glucose, StatusCodes.OK);
        } catch (e) {
            if (e instanceof ZodError) {
                return ctx.json({ error: e }, StatusCodes.BAD_REQUEST);
            }
            console.error(e);
            ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    async delete(ctx: Context) {
        try {
            const id = ctx.req.param("id");
            const glucose = await glucoseService.delete(id);
            if (!glucose) {
                return ctx.json({ error: "Glucose reading not found" }, StatusCodes.NOT_FOUND);
            }
            return ctx.json({}, StatusCodes.OK);
        } catch (e) {
            console.error(e);
            ctx.json(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};

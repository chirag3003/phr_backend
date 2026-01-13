import type { Context } from "hono";
import { SymptomService } from "../services";
import { StatusCodes } from "http-status-codes";
import { createSymptomSchema, updateSymptomSchema } from "../validators";

const symptomService = new SymptomService();

export class SymptomController {
  async getSymptoms(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const symptoms = await symptomService.getSymptoms(userId);
      return ctx.json(symptoms, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getSymptomById(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const symptom = await symptomService.getSymptomById(id);
      return ctx.json(symptom, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getSymptomsByDateRange(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const startDate = new Date(ctx.req.query("startDate") as string);
      const endDate = new Date(ctx.req.query("endDate") as string);
      const symptoms = await symptomService.getSymptomsByDateRange(userId, startDate, endDate);
      return ctx.json(symptoms, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createSymptom(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const body = createSymptomSchema.parse(await ctx.req.json());
      const createdSymptom = await symptomService.createSymptom(userId, body);
      return ctx.json(createdSymptom, StatusCodes.CREATED);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateSymptom(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const body = updateSymptomSchema.parse(await ctx.req.json());
      const updatedSymptom = await symptomService.updateSymptom(id, body);
      return ctx.json(updatedSymptom, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteSymptom(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      await symptomService.deleteSymptom(id);
      return ctx.json({}, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

import type { Context } from "hono";
import { AllergyService } from "../services";
import { StatusCodes } from "http-status-codes";
import { createAllergySchema, updateAllergySchema } from "../validators";

const allergyService = new AllergyService();

export class AllergyController {
  async getAllergies(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const allergies = await allergyService.getAllergies(userId);
      return ctx.json(allergies, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  async getAllergyById(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const allergy = await allergyService.getAllergyById(id);
      return ctx.json(allergy, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createAllergy(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const body = createAllergySchema.parse(await ctx.req.json());
      const createdAllergy = await allergyService.createAllergy(userId, body);
      return ctx.json(createdAllergy, StatusCodes.CREATED);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateAllergy(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const body = updateAllergySchema.parse(await ctx.req.json());
      const updatedAllergy = await allergyService.updateAllergy(id, body);
      return ctx.json(updatedAllergy, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteAllergy(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const deletedAllergy = await allergyService.deleteAllergy(id);
      return ctx.json(deletedAllergy, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

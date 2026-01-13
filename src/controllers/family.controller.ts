import type { Context } from "hono";
import { FamilyService } from "../services/family.service";
import { StatusCodes } from "http-status-codes";
import { createFamilySchema, updateFamilySchema } from "../validators/family.schema";

const familyService = new FamilyService();

export class FamilyController {
  async getFamiliesByUserId(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const families = await familyService.getFamiliesByUserId(userId);
      return ctx.json(families, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getFamilyById(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const family = await familyService.getFamilyById(id);
      return ctx.json(family, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createFamily(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const body = await ctx.req.json();
      body.admin = userId;
      body.members = []
      const family = createFamilySchema.parse(body)
      const createdFamily = await familyService.createFamily(family);
      return ctx.json(createdFamily, StatusCodes.CREATED);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateFamily(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const body = updateFamilySchema.parse(await ctx.req.json());
      const updatedFamily = await familyService.updateFamily(id, body);
      return ctx.json(updatedFamily, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

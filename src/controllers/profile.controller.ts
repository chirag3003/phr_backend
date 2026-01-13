import type { Context } from "hono";
import { ProfileService } from "../services";
import { StatusCodes } from "http-status-codes";
import { createProfileSchema, updateProfileSchema } from "../validators";

const profileService = new ProfileService();

export class ProfileController {
  async getProfile(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const profile = await profileService.getProfile(userId);
      return ctx.json(profile, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getProfileById(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const profile = await profileService.getProfileById(id);
      return ctx.json(profile, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createProfile(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const body = createProfileSchema.parse(await ctx.req.json());
      const createdProfile = await profileService.createProfile(userId, body);
      return ctx.json(createdProfile, StatusCodes.CREATED);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProfile(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const body = updateProfileSchema.parse(await ctx.req.json());
      const updatedProfile = await profileService.updateProfileByUserId(userId, body);
      return ctx.json(updatedProfile, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteProfile(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      await profileService.deleteProfile(id);
      return ctx.json({}, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

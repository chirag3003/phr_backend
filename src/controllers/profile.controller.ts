import type { Context } from "hono";
import { ProfileService, UploadService } from "../services";
import { StatusCodes } from "http-status-codes";
import { createProfileSchema, updateProfileSchema } from "../validators";

const profileService = new ProfileService();
const uploadService = new UploadService();

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
      const contentType = ctx.req.header("content-type") || "";

      let profileData: Record<string, unknown>;
      let profileImageUrl: string | undefined;

      if (contentType.includes("multipart/form-data")) {
        // Handle form data with optional image upload
        const formData = await ctx.req.formData();

        // Get optional profile image
        const file = formData.get("profileImage") as File | null;
        if (file && file.size > 0) {
          // const baseUrl = new URL(ctx.req.url).origin;
          const baseUrl = "https://phr.chirag.codes"
          const uploadResult = await uploadService.uploadFile(userId, file, baseUrl);
          profileImageUrl = uploadResult.url;
        }

        // Parse profile fields from form data
        profileData = {
          firstName: formData.get("firstName") as string,
          lastName: formData.get("lastName") as string,
          dob: formData.get("dob") as string,
          sex: formData.get("sex") as string,
          diabetesType: formData.get("diabetesType") as string,
          bloodType: formData.get("bloodType") as string,
          height: Number(formData.get("height")),
          weight: Number(formData.get("weight")),
        };
      } else {
        // Handle JSON body (no image)
        profileData = await ctx.req.json();
      }

      const validatedData = createProfileSchema.parse(profileData);
      const createdProfile = await profileService.createProfile(userId, {
        ...validatedData,
        profileImage: profileImageUrl,
      });

      return ctx.json(createdProfile, StatusCodes.CREATED);
    } catch (err) {
      console.error(err);
      return ctx.json(
        { error: err instanceof Error ? err.message : "Internal server error" },
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
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

  async updateProfileImage(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const formData = await ctx.req.formData();

      const file = formData.get("profileImage") as File | null;
      if (!file) {
        return ctx.json(
          { error: "Profile image file is required" },
          StatusCodes.BAD_REQUEST,
        );
      }

      const baseUrl = new URL(ctx.req.url).origin;
      const uploadResult = await uploadService.uploadFile(userId, file, baseUrl);

      const updatedProfile = await profileService.updateProfileImage(
        userId,
        uploadResult.url,
      );

      return ctx.json(updatedProfile, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json(
        { error: err instanceof Error ? err.message : "Internal server error" },
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
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

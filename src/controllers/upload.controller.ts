import type { Context } from "hono";
import { UploadService } from "../services/upload.service";
import { StatusCodes } from "http-status-codes";

const uploadService = new UploadService();

export class UploadController {
  async uploadImage(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const body = await ctx.req.parseBody();
      const file = body["file"] as File;

      if (!file) {
        return ctx.json({ error: "No file provided" }, StatusCodes.BAD_REQUEST);
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        return ctx.json(
          { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" },
          StatusCodes.BAD_REQUEST
        );
      }

      // Get base URL for constructing the image URL
      const baseUrl = new URL(ctx.req.url).origin;

      const result = await uploadService.uploadFile(userId, file, baseUrl);

      return ctx.json(result, StatusCodes.CREATED);
    } catch (err) {
      console.error(err);
      return ctx.json({ error: "Upload failed" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async uploadBulkImages(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const body = await ctx.req.parseBody({ all: true });
      const files = body["files"] as File[];

      if (!files || files.length === 0) {
        return ctx.json({ error: "No files provided" }, StatusCodes.BAD_REQUEST);
      }

      // Validate file types
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          return ctx.json(
            { error: `Invalid file type for ${file.name}. Only JPEG, PNG, GIF, and WebP are allowed` },
            StatusCodes.BAD_REQUEST
          );
        }
      }

      // Get base URL for constructing the image URL
      const baseUrl = new URL(ctx.req.url).origin;

      const results = await uploadService.uploadFiles(userId, files, baseUrl);

      return ctx.json(results, StatusCodes.CREATED);
    } catch (err) {
      console.error(err);
      return ctx.json({ error: "Bulk upload failed" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getUploads(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const uploads = await uploadService.getUploadsByUserId(userId);
      return ctx.json(uploads, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({ error: "Failed to get uploads" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getUploadById(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const upload = await uploadService.getUploadById(id);
      if (!upload) {
        return ctx.json({ error: "Upload not found" }, StatusCodes.NOT_FOUND);
      }
      return ctx.json(upload, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({ error: "Failed to get upload" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteUpload(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      await uploadService.deleteUpload(id);
      return ctx.json({ message: "Upload deleted" }, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({ error: "Failed to delete upload" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

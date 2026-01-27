import type { Context } from "hono";
import { DocDoctorService } from "../services/docDoctor.service";
import { StatusCodes } from "http-status-codes";
import { createDocDoctorSchema, updateDocDoctorSchema } from "../validators/docDoctor.schema";

const docDoctorService = new DocDoctorService();

export class DocDoctorController {
  async getDocDoctorsByUserId(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const docDoctors = await docDoctorService.getDocDoctorsByUserId(userId);
      return ctx.json(docDoctors, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getDocDoctorById(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const docDoctor = await docDoctorService.getDocDoctorById(id);
      return ctx.json(docDoctor, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createDocDoctor(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const body = createDocDoctorSchema.parse(await ctx.req.json());
      const createdDocDoctor = await docDoctorService.createDocDoctor(userId, body);
      return ctx.json(createdDocDoctor, StatusCodes.CREATED);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateDocDoctor(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const body = updateDocDoctorSchema.parse(await ctx.req.json());
      const updatedDocDoctor = await docDoctorService.updateDocDoctor(id, body);
      return ctx.json(updatedDocDoctor, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteDocDoctor(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      await docDoctorService.deleteDocDoctor(id);
      return ctx.json({}, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
} 

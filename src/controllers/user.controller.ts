import type { Context } from "hono";
import { UserService } from "../services";
import { StatusCodes } from "http-status-codes";
import { createUserSchema, updateUserSchema } from "../validators";

const userService = new UserService();

export class UserController {
  async getUsers(ctx: Context) {
    try {
      const users = await userService.getUsers();
      return ctx.json(users, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserById(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const user = await userService.getUserById(id);
      return ctx.json(user, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createUser(ctx: Context) {
    try {
      const body = createUserSchema.parse(await ctx.req.json());
      const createdUser = await userService.createUser(body);
      return ctx.json(createdUser, StatusCodes.CREATED);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUser(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const body = updateUserSchema.parse(await ctx.req.json());
      const updatedUser = await userService.updateUser(id, body);
      return ctx.json(updatedUser, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteUser(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      await userService.deleteUser(id);
      return ctx.json({}, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

import type { Context } from "hono";
import { UserService } from "../services";
import { StatusCodes } from "http-status-codes";
import { createUserSchema } from "../validators";
import { generateJWT } from "../lib/auth";

const userService = new UserService();

export class AuthController {
  async signup(ctx: Context) {
    try {
      const body = createUserSchema.parse(await ctx.req.json());

      // Check if user already exists
      const existingUser = await userService.getUserByPhoneNumber(body.phoneNumber);
      if (existingUser) {
        return ctx.json(
          { error: "User with this phone number already exists" },
          StatusCodes.CONFLICT
        );
      }

      // Create user
      const user = await userService.createUser(body);

      // Generate JWT token
      const token = await generateJWT(user._id.toString(), user.phoneNumber);

      return ctx.json(
        {
          user,
          token,
        },
        StatusCodes.CREATED
      );
    } catch (err) {
      console.error(err);
      return ctx.json({ error: "Signup failed" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async login(ctx: Context) {
    try {
      const body = createUserSchema.parse(await ctx.req.json());

      // Find user by phone number
      const user = await userService.getUserByPhoneNumber(body.phoneNumber);
      if (!user) {
        return ctx.json(
          { error: "User not found" },
          StatusCodes.NOT_FOUND
        );
      }

      // Generate JWT token
      const token = await generateJWT(user._id.toString(), user.phoneNumber);

      return ctx.json(
        {
          user,
          token,
        },
        StatusCodes.OK
      );
    } catch (err) {
      console.error(err);
      return ctx.json({ error: "Login failed" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

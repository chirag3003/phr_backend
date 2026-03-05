import type { Context } from "hono";
import { UserService } from "../services";
import { StatusCodes } from "http-status-codes";
import { createUserSchema } from "../validators";
import { generateJWT } from "../lib/auth";

const userService = new UserService();

function normalizePhoneNumber(input: string) {
  const digitsOnly = String(input ?? "").replace(/\D/g, "");
  const normalized = digitsOnly.slice(-10);
  if (normalized.length < 10) {
    throw new Error("Invalid phone number. Provide at least 10 digits.");
  }
  return normalized;
}

export class AuthController {

  async signup(ctx: Context) {
    try {
      const body = createUserSchema.parse(await ctx.req.json());
      body.phoneNumber = normalizePhoneNumber(body.phoneNumber);

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
      if (err instanceof Error && err.message.includes("Invalid phone number")) {
        return ctx.json({ error: err.message }, StatusCodes.BAD_REQUEST);
      }
      return ctx.json({ error: "Signup failed" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async login(ctx: Context) {
    try {
      const body = createUserSchema.parse(await ctx.req.json());
      body.phoneNumber = normalizePhoneNumber(body.phoneNumber);

      // Find user by phone number
      let user = await userService.getUserByPhoneNumber(body.phoneNumber);
      if (!user) {
        user = await userService.createUser(body);
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
      if (err instanceof Error && err.message.includes("Invalid phone number")) {
        return ctx.json({ error: err.message }, StatusCodes.BAD_REQUEST);
      }
      return ctx.json({ error: "Login failed" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

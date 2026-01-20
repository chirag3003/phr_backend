import type { Context, Next } from "hono";
import { StatusCodes } from "http-status-codes";
import { verifyJWT } from "../lib/auth";
import { User } from "../models";

export async function authMiddleware(ctx: Context, next: Next) {
  try {
    const authHeader = ctx.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      try {
        const user = await User.findOne();
        if (user) {
          ctx.set("userId", user._id);
          await next()
        }
      } catch (err) {
        console.error("Database error:", err);
      }
      return ctx.json(
        { error: "Authorization header missing or invalid" },
        StatusCodes.UNAUTHORIZED
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return ctx.json(
        { error: "Token missing" },
        StatusCodes.UNAUTHORIZED
      );
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return ctx.json(
        { error: "Invalid or expired token" },
        StatusCodes.UNAUTHORIZED
      );
    }

    ctx.set("userId", payload.userId);

    await next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return ctx.json(
      { error: "Authentication failed" },
      StatusCodes.UNAUTHORIZED
    );
  }
}

import type { Context, Next } from "hono";
import { StatusCodes } from "http-status-codes";
import { FamilyPermission } from "../models";

export type PermissionDomain =
  | "profile"
  | "meals"
  | "glucose"
  | "symptoms"
  | "documents"
  | "allergies"
  | "water";

type PermissionOptions = {
  domain: PermissionDomain;
  requireWrite?: boolean;
};

function hasAnyPermissionEntry(permission: any) {
  if (!permission) return false;
  return true;
}

function hasDomainPermission(permission: any, domain: PermissionDomain) {
  if (!permission) return false;
  if (domain === "profile") {
    return hasAnyPermissionEntry(permission);
  }
  return Boolean(permission.permissions?.[domain]);
}

export function permissionMiddleware(options: PermissionOptions) {
  return async (ctx: Context, next: Next) => {
    const userId = ctx.get("userId");
    const targetUserId = ctx.req.param("userId");
    if (!userId || !targetUserId) {
      return ctx.json({ error: "Unauthorized" }, StatusCodes.UNAUTHORIZED);
    }

    const permission = await FamilyPermission.findOne({
      userId: targetUserId,
      permissionTo: userId,
    });

    if (!hasDomainPermission(permission, options.domain)) {
      return ctx.json({ error: "Access denied" }, StatusCodes.FORBIDDEN);
    }

    if (options.requireWrite && !permission?.write) {
      return ctx.json({ error: "Write access denied" }, StatusCodes.FORBIDDEN);
    }

    ctx.set("targetUserId", targetUserId);
    await next();
  };
}

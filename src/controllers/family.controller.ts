import type { Context } from "hono";
import { FamilyService } from "../services/family.service";
import { StatusCodes } from "http-status-codes";
import { createFamilySchema, updateFamilySchema } from "../validators/family.schema";
import { updateFamilyPermissionSchema } from "../validators/familyPermission.schema";

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
      body.members = [];
      const family = createFamilySchema.parse(body);
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

  async deleteFamily(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      await familyService.deleteFamilyPermissions(id);
      await familyService.deleteFamily(id);
      return ctx.json({ message: "Family deleted" }, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async addMemberToFamily(ctx: Context) {
    try {
      const familyId = ctx.req.param("id");
      const { userId } = await ctx.req.json();
      
      // Get current family to find existing members
      const family = await familyService.getFamilyById(familyId);
      if (!family) {
        return ctx.json({ error: "Family not found" }, StatusCodes.NOT_FOUND);
      }

      // Add member to family
      const updatedFamily = await familyService.addMemberToFamily(familyId, userId);

      // Create permission entries: new member -> all existing members (including admin)
      const allExistingMembers = [family.admin.toString(), ...family.members.map((m: any) => m.toString())];
      for (const existingMemberId of allExistingMembers) {
        await familyService.createPermissionEntry(familyId, userId, existingMemberId);
      }

      // Create permission entries: all existing members -> new member
      for (const existingMemberId of allExistingMembers) {
        await familyService.createPermissionEntry(familyId, existingMemberId, userId);
      }

      return ctx.json(updatedFamily, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async removeMemberFromFamily(ctx: Context) {
    try {
      const familyId = ctx.req.param("id");
      const { userId } = await ctx.req.json();

      // Get current family to find all members
      const family = await familyService.getFamilyById(familyId);
      if (!family) {
        return ctx.json({ error: "Family not found" }, StatusCodes.NOT_FOUND);
      }

      // Delete all permission entries where this user is the grantor (userId)
      await familyService.deletePermissionsByUserId(familyId, userId);

      const updatedFamily = await familyService.removeMemberFromFamily(familyId, userId);
      return ctx.json(updatedFamily, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createPermissionEntry(ctx: Context) {
    try {
      const familyId = ctx.req.param("id");
      const userId = ctx.get("userId");
      const { permissionTo } = await ctx.req.json();
      const permission = await familyService.createPermissionEntry(familyId, userId, permissionTo);
      return ctx.json(permission, StatusCodes.CREATED);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updatePermissionEntry(ctx: Context) {
    try {
      const familyId = ctx.req.param("id");
      const userId = ctx.get("userId");
      const body = await ctx.req.json();
      const { permissionTo, ...data } = body;
      const validatedData = updateFamilyPermissionSchema.parse(data);
      const permission = await familyService.updatePermissionEntry(userId, familyId, permissionTo, validatedData);
      return ctx.json(permission, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getPermissionEntry(ctx: Context) {
    try {
      const familyId = ctx.req.param("id");
      const userId = ctx.get("userId");
      const permissionTo = ctx.req.query("permissionTo") as string;
      const permission = await familyService.getPermissionEntry(userId, familyId, permissionTo);
      return ctx.json(permission, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deletePermissionEntry(ctx: Context) {
    try {
      const familyId = ctx.req.param("id");
      const userId = ctx.get("userId");
      const permissionTo = ctx.req.query("permissionTo") as string;
      await familyService.deletePermissionEntry(userId, familyId, permissionTo);
      return ctx.json({ message: "Permission deleted" }, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

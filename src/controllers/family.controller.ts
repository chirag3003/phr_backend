import type { Context } from "hono";
import { FamilyService } from "../services/family.service";
import { StatusCodes } from "http-status-codes";
import {
	createFamilySchema,
	updateFamilySchema,
} from "../validators/family.schema";
import { updateFamilyPermissionSchema } from "../validators/familyPermission.schema";
import { ProfileService, UserService } from "../services";

const familyService = new FamilyService();
const userService = new UserService();
const profileService = new ProfileService();

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
			if (!family) {
				return ctx.json({ error: "Family not found" }, StatusCodes.NOT_FOUND);
			}
			const userId = ctx.get("userId");
			const isMember =
				family.admin.toString() === userId ||
				family.members.some((member) => member.toString() === userId);
			if (!isMember) {
				return ctx.json({ error: "Access denied" }, StatusCodes.FORBIDDEN);
			}
			return ctx.json(family, StatusCodes.OK);
		} catch (err) {
			console.error(err);
			return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getFamilyWithMembers(ctx: Context) {
		try {
			const id = ctx.req.param("id");
			const family = await familyService.getFamilyWithMembers(id);
			if (!family) {
				return ctx.json({ error: "Family not found" }, StatusCodes.NOT_FOUND);
			}
			const userId = ctx.get("userId");
			const isMember =
				family.admin._id.toString() === userId ||
				family.members.some((member: any) => member._id.toString() === userId);
			if (!isMember) {
				return ctx.json({ error: "Access denied" }, StatusCodes.FORBIDDEN);
			}
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
			const userId = ctx.get("userId");
			const family = await familyService.getFamilyById(id);
			if (!family) {
				return ctx.json({ error: "Family not found" }, StatusCodes.NOT_FOUND);
			}
			if (family.admin.toString() !== userId) {
				return ctx.json({ error: "Access denied" }, StatusCodes.FORBIDDEN);
			}
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
			const userId = ctx.get("userId");
			const family = await familyService.getFamilyById(id);
			if (!family) {
				return ctx.json({ error: "Family not found" }, StatusCodes.NOT_FOUND);
			}
			if (family.admin.toString() !== userId) {
				return ctx.json({ error: "Access denied" }, StatusCodes.FORBIDDEN);
			}
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
			const requesterId = ctx.get("userId");
			const { phoneNumber } = await ctx.req.json();

			// Get user by phone number
			const user = await userService.getUserByPhoneNumber(phoneNumber);
			if (!user) {
				return ctx.json({ error: "User not found" }, StatusCodes.NOT_FOUND);
			}
			const userId = user._id.toString();
			const userProfile = await profileService.getProfileById(userId);
			if (!userProfile) {
				return ctx.json({ error: "User not found" }, StatusCodes.NOT_FOUND);
			}

			// Get current family to find existing members
			const family = await familyService.getFamilyById(familyId);
			if (!family) {
				return ctx.json({ error: "Family not found" }, StatusCodes.NOT_FOUND);
			}
			if (family.admin.toString() !== requesterId) {
				return ctx.json({ error: "Access denied" }, StatusCodes.FORBIDDEN);
			}
			if (family.admin.toString() === userId) {
				return ctx.json({ error: "Admin is already part of the family" }, StatusCodes.BAD_REQUEST);
			}
			if (family.members.some((member) => member.toString() === userId)) {
				return ctx.json({ error: "User already a member" }, StatusCodes.CONFLICT);
			}

			// Add member to family
			const updatedFamily = await familyService.addMemberToFamily(
				familyId,
				userId,
			);

			// Create permission entries: new member -> all existing members (including admin)
			const allExistingMembers = [
				family.admin.toString(),
				...family.members.map((m: any) => m.toString()),
			];
			for (const existingMemberId of allExistingMembers) {
				await familyService.createPermissionEntry(userId, existingMemberId);
			}

			// Create permission entries: all existing members -> new member
			for (const existingMemberId of allExistingMembers) {
				await familyService.createPermissionEntry(existingMemberId, userId);
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
			const requesterId = ctx.get("userId");

			// Get current family to find all members
			const family = await familyService.getFamilyById(familyId);
			if (!family) {
				return ctx.json({ error: "Family not found" }, StatusCodes.NOT_FOUND);
			}
			if (family.admin.toString() === userId) {
				return ctx.json({ error: "Cannot remove admin" }, StatusCodes.BAD_REQUEST);
			}
			const isMember = family.members.some((member) => member.toString() === userId);
			if (!isMember) {
				return ctx.json({ error: "Member not found" }, StatusCodes.NOT_FOUND);
			}
			const isSelf = requesterId === userId;
			if (!isSelf && family.admin.toString() !== requesterId) {
				return ctx.json({ error: "Access denied" }, StatusCodes.FORBIDDEN);
			}

			const updatedFamily = await familyService.removeMemberFromFamily(
				familyId,
				userId,
			);
			return ctx.json(updatedFamily, StatusCodes.OK);
		} catch (err) {
			console.error(err);
			return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async createPermissionEntry(ctx: Context) {
		try {
			const userId = ctx.get("userId");
			const { permissionTo } = await ctx.req.json();
			const permission = await familyService.createPermissionEntry(
				userId,
				permissionTo,
			);
			return ctx.json(permission, StatusCodes.CREATED);
		} catch (err) {
			console.error(err);
			return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async updatePermissionEntry(ctx: Context) {
		try {
			const userId = ctx.get("userId");
			const body = await ctx.req.json();
			const { permissionTo, ...data } = body;
			const validatedData = updateFamilyPermissionSchema.parse(data);
			const permission = await familyService.updatePermissionEntry(
				userId,
				permissionTo,
				validatedData,
			);
			return ctx.json(permission, StatusCodes.OK);
		} catch (err) {
			console.error(err);
			return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getPermissionEntry(ctx: Context) {
		try {
			const userId = ctx.get("userId");
			const permissionTo = ctx.req.query("permissionTo") as string;
			const permission = await familyService.getPermissionEntry(
				userId,
				permissionTo,
			);
			return ctx.json(permission, StatusCodes.OK);
		} catch (err) {
			console.error(err);
			return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async deletePermissionEntry(ctx: Context) {
		try {
			const userId = ctx.get("userId");
			const permissionTo = ctx.req.query("permissionTo") as string;
			await familyService.deletePermissionEntry(userId, permissionTo);
			return ctx.json({ message: "Permission deleted" }, StatusCodes.OK);
		} catch (err) {
			console.error(err);
			return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async leaveFamily(ctx: Context) {
		try {
			const familyId = ctx.req.param("id");
			const userId = ctx.get("userId");
			const family = await familyService.getFamilyById(familyId);
			if (!family) {
				return ctx.json({ error: "Family not found" }, StatusCodes.NOT_FOUND);
			}
			const isAdmin = family.admin.toString() === userId;
			const isMember = family.members.some((member) => member.toString() === userId);
			if (!isAdmin && !isMember) {
				return ctx.json({ error: "Access denied" }, StatusCodes.FORBIDDEN);
			}
			if (isAdmin) {
				if (family.members.length > 0) {
					return ctx.json(
						{ error: "Admin must transfer ownership before leaving" },
						StatusCodes.BAD_REQUEST,
					);
				}
				await familyService.deleteFamily(familyId);
				return ctx.json({ message: "Family deleted" }, StatusCodes.OK);
			}

			const updatedFamily = await familyService.removeMemberFromFamily(
				familyId,
				userId,
			);
			return ctx.json(updatedFamily, StatusCodes.OK);
		} catch (err) {
			console.error(err);
			return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

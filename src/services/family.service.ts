import type {
  CreateFamilyInput,
  FamilyUpdateInput,
} from "../validators/family.schema";
import { Family, FamilyPermission } from "../models";
import type { FamilyPermissionUpdateInput } from "../validators/familyPermission.schema";

export class FamilyService {
  async getFamiliesByUserId(userId: string) {
    return Family.find({ $or: [{ admin: userId }, { members: userId }] });
  }

  async getFamilyById(id: string) {
    return await Family.findById(id);
  }

  async createFamily(family: CreateFamilyInput) {
    return await Family.create(family);
  }

  async updateFamily(id: string, family: FamilyUpdateInput) {
    return await Family.findByIdAndUpdate(id, family);
  }

  async deleteFamily(id: string) {
    return await Family.findByIdAndDelete(id);
  }

  async addMemberToFamily(familyId: string, userId: string) {
    return await Family.findByIdAndUpdate(
      familyId,
      {
        $push: {
          members: userId,
        },
      },
      { new: true },
    );
  }

  async removeMemberFromFamily(familyId: string, userId: string) {
    return await Family.findByIdAndUpdate(
      familyId,
      {
        $pull: {
          members: userId,
        },
      },
      { new: true },
    );
  }

  async createPermissionEntry(
    familyId: string,
    userId: string,
    permissionTo: string,
  ) {
    return await FamilyPermission.create({
      family: familyId,
      userId,
      permissionTo,
    });
  }

  async updatePermissionEntry(
    userId: string,
    familyId: string,
    permissionTo: string,
    data: FamilyPermissionUpdateInput,
  ) {
    return await FamilyPermission.findOneAndUpdate(
      {
        userId,
        family: familyId,
        permissionTo,
      },
      {
        $set: data,
      },
    );
  }

  async getPermissionEntry(
    userId: string,
    familyId: string,
    permissionTo: string,
  ) {
    return await FamilyPermission.findOne({
      userId,
      family: familyId,
      permissionTo,
    });
  }

  async deletePermissionEntry(
    userId: string,
    familyId: string,
    permissionTo: string,
  ) {
    return await FamilyPermission.findOneAndDelete({
      userId,
      family: familyId,
      permissionTo,
    });
  }

  async deleteFamilyPermissions(familyId: string) {
    return await FamilyPermission.deleteMany({
      family: familyId,
    });
  }
}

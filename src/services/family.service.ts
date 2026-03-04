import type {
  CreateFamilyInput,
  FamilyUpdateInput,
} from "../validators/family.schema";
import { Family, FamilyPermission, Profile } from "../models";
import type { FamilyPermissionUpdateInput } from "../validators/familyPermission.schema";

export class FamilyService {
  async getFamiliesByUserId(userId: string) {
    return Family.find({ $or: [{ admin: userId }, { members: userId }] });
  }

  async getFamilyById(id: string) {
    return await Family.findById(id);
  }

  async getFamilyWithMembers(id: string) {
    const family = await Family.findById(id).populate(["admin", "members"]);
    if (!family) return null;

    const familyObj = family.toObject() as any;

    const allUserIds = [
      familyObj.admin._id,
      ...familyObj.members.map((m: any) => m._id),
    ];

    const profiles = await Profile.find({ userId: { $in: allUserIds } }).select(
      "userId firstName lastName profileImage",
    );

    const profileMap = new Map(
      profiles.map((p) => [p.userId.toString(), p]),
    );

    const adminProfile = profileMap.get(familyObj.admin._id.toString());
    familyObj.admin = {
      ...familyObj.admin,
      name: adminProfile
        ? `${adminProfile.firstName} ${adminProfile.lastName}`
        : undefined,
      profileImage: adminProfile?.profileImage,
    };

    familyObj.members = familyObj.members.map((member: any) => {
      const profile = profileMap.get(member._id.toString());
      return {
        ...member,
        name: profile ? `${profile.firstName} ${profile.lastName}` : undefined,
        profileImage: profile?.profileImage,
      };
    });

    return familyObj;
  }

  async createFamily(family: CreateFamilyInput) {
    return await Family.create(family);
  }

  async updateFamily(id: string, family: FamilyUpdateInput) {
    return await Family.findByIdAndUpdate(id, family, { new: true });
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

  async createPermissionEntry(userId: string, permissionTo: string) {
    const entry = await FamilyPermission.findOne({
      userId,
      permissionTo,
    });
    if (entry) {
      return entry;
    }
    return await FamilyPermission.create({
      userId,
      permissionTo,
    });
  }

  async updatePermissionEntry(
    userId: string,
    permissionTo: string,
    data: FamilyPermissionUpdateInput,
  ) {
    return await FamilyPermission.findOneAndUpdate(
      {
        userId,
        permissionTo,
      },
      {
        $set: data,
      },
    );
  }

  async getPermissionEntry(userId: string, permissionTo: string) {
    return await FamilyPermission.findOne({
      userId,
      permissionTo,
    });
  }

  async deletePermissionEntry(
    userId: string,
    permissionTo: string,
  ) {
    return await FamilyPermission.findOneAndDelete({
      userId,
      permissionTo,
    });
  }

  async deletePermissionsByUserId(userId: string) {
    return await FamilyPermission.deleteMany({
      $or: [{ userId }, { permissionTo: userId }],
    });
  }
}

import { Profile } from "../models";
import type { CreateProfileInput, ProfileUpdateInput } from "../validators";

export class ProfileService {
  async getProfile(userId: string) {
    return Profile.findOne({ userId });
  }

  async getProfileById(id: string) {
    return await Profile.findById(id);
  }

  async createProfile(userId: string, profile: CreateProfileInput & { profileImage?: string }) {
    return await Profile.create({ ...profile, userId });
  }

  async updateProfile(id: string, profile: ProfileUpdateInput) {
    return await Profile.findByIdAndUpdate(id, profile);
  }

  async updateProfileByUserId(userId: string, profile: ProfileUpdateInput) {
    return await Profile.findOneAndUpdate({ userId }, profile);
  }

  async updateProfileImage(userId: string, profileImage: string) {
    return await Profile.findOneAndUpdate(
      { userId },
      { profileImage },
      { new: true }
    );
  }

  async deleteProfile(id: string) {
    return await Profile.findByIdAndDelete(id);
  }
}

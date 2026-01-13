import { Allergy } from "../models";
import type { AllergyUpdateInput, CreateAllergyInput } from "../validators";

export class AllergyService {
  async getAllergies(userId: string) {
    return Allergy.find({ userId });
  }

  async getAllergyById(id: string) {
    return await Allergy.findById(id);
  }

  async createAllergy(userId: string, allergy: CreateAllergyInput) {
    return await Allergy.create({ ...allergy, userId });
  }

  async updateAllergy(id: string, allergy: AllergyUpdateInput) {
    return await Allergy.findByIdAndUpdate(id, allergy);
  }

  async deleteAllergy(id: string) {
    return await Allergy.findByIdAndDelete(id);
  }
}

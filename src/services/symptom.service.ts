import { Symptom } from "../models";
import type { CreateSymptomInput, SymptomUpdateInput } from "../validators";

export class SymptomService {
  async getSymptoms(userId: string) {
    return Symptom.find({ userId });
  }

  async getSymptomById(id: string) {
    return await Symptom.findById(id);
  }

  async getSymptomsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return Symptom.find({
      userId,
      dateRecorded: { $gte: startDate, $lte: endDate },
    });
  }

  async createSymptom(userId: string, symptom: CreateSymptomInput) {
    return await Symptom.create({ ...symptom, userId });
  }

  async updateSymptom(id: string, symptom: SymptomUpdateInput) {
    return await Symptom.findByIdAndUpdate(id, symptom);
  }

  async deleteSymptom(id: string) {
    return await Symptom.findByIdAndDelete(id);
  }
}

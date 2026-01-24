import { Glucose } from "../models";
import type { CreateGlucoseInput, UpdateGlucoseInput } from "../validators";

export class GlucoseService {
  async getGlucoseReadings(userId: string) {
    return Glucose.find({ userId }).sort({ dateRecorded: -1, "time.hour": -1, "time.minute": -1 });
  }

  async getGlucoseById(id: string) {
    return Glucose.findById(id);
  }

  async getGlucoseByDateRange(userId: string, startDate: Date, endDate: Date) {
    return Glucose.find({
      userId,
      dateRecorded: { $gte: startDate, $lte: endDate },
    }).sort({ dateRecorded: -1, "time.hour": -1, "time.minute": -1 });
  }

  async getGlucoseByMealContext(userId: string, mealContext: string) {
    return Glucose.find({ userId, mealContext }).sort({ dateRecorded: -1 });
  }

  async getLatestGlucose(userId: string) {
    return Glucose.findOne({ userId }).sort({ dateRecorded: -1, "time.hour": -1, "time.minute": -1 });
  }

  async getGlucoseStats(userId: string, startDate: Date, endDate: Date) {
    const readings = await Glucose.find({
      userId,
      dateRecorded: { $gte: startDate, $lte: endDate },
    });

    if (readings.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0, inRange: 0, belowRange: 0, aboveRange: 0 };
    }

    const values = readings.map((r) => r.value);
    const sum = values.reduce((a, b) => a + b, 0);

    // Target range: 70-180 mg/dL (standard diabetes management range)
    const inRange = values.filter((v) => v >= 70 && v <= 180).length;
    const belowRange = values.filter((v) => v < 70).length;
    const aboveRange = values.filter((v) => v > 180).length;

    return {
      average: Math.round(sum / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
      inRange,
      belowRange,
      aboveRange,
    };
  }

  async createGlucose(userId: string, data: CreateGlucoseInput) {
    return Glucose.create({ ...data, userId });
  }

  async updateGlucose(id: string, data: UpdateGlucoseInput) {
    return Glucose.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteGlucose(id: string) {
    return Glucose.findByIdAndDelete(id);
  }
}

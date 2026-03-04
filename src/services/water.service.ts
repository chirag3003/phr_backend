import { Water } from "../models";
import type { CreateWaterInput, UpdateWaterInput } from "../validators";

export class WaterService {
  async getWaterByUserId(userId: string) {
    return Water.find({ userId }).sort({ dateRecorded: -1 });
  }

  async getWaterById(id: string) {
    return Water.findById(id);
  }

  async getWaterByDate(userId: string, dateRecorded: Date) {
    const start = new Date(dateRecorded);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRecorded);
    end.setHours(23, 59, 59, 999);

    return Water.findOne({
      userId,
      dateRecorded: { $gte: start, $lte: end },
    });
  }

  async getOrCreateWaterByDate(userId: string, dateRecorded: Date) {
    const start = new Date(dateRecorded);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRecorded);
    end.setHours(23, 59, 59, 999);

    const existing = await Water.findOne({
      userId,
      dateRecorded: { $gte: start, $lte: end },
    });

    if (existing) {
      return existing;
    }

    return Water.create({
      userId,
      dateRecorded: start,
      glasses: 0,
    });
  }

  async getWaterByDateRange(userId: string, startDate: Date, endDate: Date) {
    return Water.find({
      userId,
      dateRecorded: { $gte: startDate, $lte: endDate },
    }).sort({ dateRecorded: -1 });
  }

  async getLatestWater(userId: string) {
    return Water.findOne({ userId }).sort({ dateRecorded: -1 });
  }

  async upsertWaterByDate(userId: string, data: CreateWaterInput) {
    const start = new Date(data.dateRecorded);
    start.setHours(0, 0, 0, 0);
    const end = new Date(data.dateRecorded);
    end.setHours(23, 59, 59, 999);

    return Water.findOneAndUpdate(
      { userId, dateRecorded: { $gte: start, $lte: end } },
      { $set: { dateRecorded: start, glasses: data.glasses } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  async updateWater(id: string, data: UpdateWaterInput) {
    return Water.findByIdAndUpdate(id, data, { new: true, upsert: true });
  }

  async deleteWater(id: string) {
    return Water.findByIdAndDelete(id);
  }
}

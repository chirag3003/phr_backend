import { WaterService } from "./water.service";
import { ProfileService } from "./profile.service";
import { Insight } from "../models";
import type { WaterInsightsResponse } from "../validators";
import { generateWaterInsights } from "../lib/insights";
import { getUtcDateKey } from "../utils/date";

export class WaterInsightsService {
  private waterService: WaterService;
  private profileService: ProfileService;

  constructor() {
    this.waterService = new WaterService();
    this.profileService = new ProfileService();
  }

  async getWaterInsights(userId: string): Promise<WaterInsightsResponse> {
    const dateKey = getUtcDateKey();
    const existing = await Insight.findOne({ userId, type: "water", dateKey });
    if (existing) {
      return existing.payload as WaterInsightsResponse;
    }

    const [profile, waterRecords] = await Promise.all([
      this.profileService.getProfile(userId),
      this.waterService.getWaterByUserId(userId),
    ]);

    const payload = await generateWaterInsights({ profile, waterRecords });
    await Insight.create({ userId, type: "water", dateKey, payload });
    return payload;
  }
}

import { WaterService } from "./water.service";
import { ProfileService } from "./profile.service";
import type { WaterInsightsResponse } from "../validators";
import { generateWaterInsights } from "../lib/insights";

export class WaterInsightsService {
  private waterService: WaterService;
  private profileService: ProfileService;

  constructor() {
    this.waterService = new WaterService();
    this.profileService = new ProfileService();
  }

  async getWaterInsights(userId: string): Promise<WaterInsightsResponse> {
    const [profile, waterRecords] = await Promise.all([
      this.profileService.getProfile(userId),
      this.waterService.getWaterByUserId(userId),
    ]);

    return generateWaterInsights({ profile, waterRecords });
  }
}

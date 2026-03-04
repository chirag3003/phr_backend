import { ProfileService } from "./profile.service";
import { AllergyService } from "./allergy.service";
import { MealService } from "./meal.service";
import { SymptomService } from "./symptom.service";
import { GlucoseService } from "./glucose.service";
import { DocumentService } from "./document.service";
import { WaterService } from "./water.service";
import { Insight } from "../models";
import { generateMealInsights, generateGlucoseInsights } from "../lib/insights";
import type { MealInsightsResponse, GlucoseInsightsResponse, UserDataForInsights } from "../validators";
import { getUtcDateKey } from "../utils/date";

export class InsightsService {
  private profileService: ProfileService;
  private allergyService: AllergyService;
  private mealService: MealService;
  private symptomService: SymptomService;
  private glucoseService: GlucoseService;
  private documentService: DocumentService;
  private waterService: WaterService;

  constructor() {
    this.profileService = new ProfileService();
    this.allergyService = new AllergyService();
    this.mealService = new MealService();
    this.symptomService = new SymptomService();
    this.glucoseService = new GlucoseService();
    this.documentService = new DocumentService();
    this.waterService = new WaterService();
  }

  private async gatherUserData(userId: string): Promise<UserDataForInsights> {
    const [profile, allergies, meals, symptoms, glucoseReadings, waterRecords] = await Promise.all([
      this.profileService.getProfile(userId),
      this.allergyService.getAllergies(userId),
      this.mealService.getMeals(userId),
      this.symptomService.getSymptoms(userId),
      this.glucoseService.getGlucoseReadings(userId),
      this.waterService.getWaterByUserId(userId),
    ]);

    return {
      profile: profile
        ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          dob: profile.dob,
          sex: profile.sex,
          diabetesType: profile.diabetesType,
          bloodType: profile.bloodType,
          height: profile.height,
          weight: profile.weight,
        }
        : null,
      waterRecords: waterRecords.map((w) => ({
        dateRecorded: w.dateRecorded,
        glasses: w.glasses,
      })),
      allergies: allergies.map((a) => ({
        name: a.name,
        severity: a.severity,
        notes: a.notes,
      })),
      meals: meals.map((m) => ({
        name: m.name,
        type: m.type,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fiber: m.fiber,
        dateRecorded: m.dateRecorded,
        time: m.time,
      })),
      symptoms: symptoms.map((s) => ({
        symptomName: s.symptomName,
        intensity: s.intensity,
        dateRecorded: s.dateRecorded,
        time: s.time,
        notes: s.notes,
      })),
      glucoseReadings: glucoseReadings.map((g) => ({
        value: g.value,
        unit: g.unit,
        dateRecorded: g.dateRecorded,
        time: g.time,
        mealContext: g.mealContext,
        notes: g.notes,
      })),
    };
  }

  async getMealInsights(userId: string): Promise<MealInsightsResponse> {
    const dateKey = getUtcDateKey();
    const existing = await Insight.findOne({ userId, type: "meal", dateKey });
    if (existing) {
      return existing.payload as MealInsightsResponse;
    }

    const userData = await this.gatherUserData(userId);
    const payload = await generateMealInsights(userData);
    await Insight.create({ userId, type: "meal", dateKey, payload });
    return payload;
  }

  async getGlucoseInsights(userId: string): Promise<GlucoseInsightsResponse> {
    const dateKey = getUtcDateKey();
    const existing = await Insight.findOne({ userId, type: "glucose", dateKey });
    if (existing) {
      return existing.payload as GlucoseInsightsResponse;
    }

    const userData = await this.gatherUserData(userId);
    const payload = await generateGlucoseInsights(userData);
    await Insight.create({ userId, type: "glucose", dateKey, payload });
    return payload;
  }

  async getSummaryData(userId: string, startDate: Date, endDate: Date) {
    const [profile, glucose, symptoms, meals, documents] = await Promise.all([
      this.profileService.getProfile(userId),
      this.glucoseService.getGlucoseByDateRange(userId, startDate, endDate),
      this.symptomService.getSymptomsByDateRange(userId, startDate, endDate),
      this.mealService.getMealsByDateRange(userId, startDate, endDate),
      this.documentService.getDocumentsByDateRange(userId, startDate, endDate),
    ]);

    return {
      profile,
      glucose,
      symptoms,
      meals,
      documents,
      dateRange: { startDate, endDate }
    };
  }
}

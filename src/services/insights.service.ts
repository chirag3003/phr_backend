import { ProfileService } from "./profile.service";
import { AllergyService } from "./allergy.service";
import { MealService } from "./meal.service";
import { SymptomService } from "./symptom.service";
import { GlucoseService } from "./glucose.service";
import { DocumentService } from "./document.service";
import { generateMealInsights, generateGlucoseInsights } from "../lib/insights";
import type { MealInsightsResponse, GlucoseInsightsResponse, UserDataForInsights } from "../validators";

export class InsightsService {
  private profileService: ProfileService;
  private allergyService: AllergyService;
  private mealService: MealService;
  private symptomService: SymptomService;
  private glucoseService: GlucoseService;
  private documentService: DocumentService;

  constructor() {
    this.profileService = new ProfileService();
    this.allergyService = new AllergyService();
    this.mealService = new MealService();
    this.symptomService = new SymptomService();
    this.glucoseService = new GlucoseService();
    this.documentService = new DocumentService();
  }

  private async gatherUserData(userId: string): Promise<UserDataForInsights> {
    const [profile, allergies, meals, symptoms, glucoseReadings] = await Promise.all([
      this.profileService.getProfile(userId),
      this.allergyService.getAllergies(userId),
      this.mealService.getMeals(userId),
      this.symptomService.getSymptoms(userId),
      this.glucoseService.getGlucoseReadings(userId),
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
    const userData = await this.gatherUserData(userId);
    return generateMealInsights(userData);
  }

  async getGlucoseInsights(userId: string): Promise<GlucoseInsightsResponse> {
    const userData = await this.gatherUserData(userId);
    return generateGlucoseInsights(userData);
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

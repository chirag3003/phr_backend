import { ProfileService } from "./profile.service";
import { AllergyService } from "./allergy.service";
import { MealService } from "./meal.service";
import { SymptomService } from "./symptom.service";
import { glucoseService } from "./glucose.service";
import { generateMealInsights, generateGlucoseInsights, MealInsights, GlucoseInsights } from "../lib/insights";

const profileService = new ProfileService();
const allergyService = new AllergyService();
const mealService = new MealService();
const symptomService = new SymptomService();

export const insightsService = {
  async getMealInsights(userId: string): Promise<MealInsights> {
    // Gather all user data in parallel
    const [profile, allergies, meals, symptoms, glucoseReadings] = await Promise.all([
      profileService.getProfile(userId),
      allergyService.getAllergies(userId),
      mealService.getMeals(userId),
      symptomService.getSymptoms(userId),
      glucoseService.findAll(userId),
    ]);

    const userData = {
      profile: profile ? {
        firstName: profile.firstName,
        lastName: profile.lastName,
        dob: profile.dob,
        sex: profile.sex,
        diabetesType: profile.diabetesType,
        bloodType: profile.bloodType,
        height: profile.height,
        weight: profile.weight,
      } : null,
      allergies: allergies.map(a => ({
        name: a.name,
        severity: a.severity,
        notes: a.notes,
      })),
      meals: meals.map(m => ({
        name: m.name,
        type: m.type,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fiber: m.fiber,
        dateRecorded: m.dateRecorded,
        time: m.time,
      })),
      symptoms: symptoms.map(s => ({
        symptomName: s.symptomName,
        intensity: s.intensity,
        dateRecorded: s.dateRecorded,
        time: s.time,
        notes: s.notes,
      })),
      glucoseReadings: glucoseReadings.map(g => ({
        value: g.value,
        unit: g.unit,
        dateRecorded: g.dateRecorded,
        time: g.time,
        mealContext: g.mealContext,
        notes: g.notes,
      })),
    };

    return generateMealInsights(userData);
  },

  async getGlucoseInsights(userId: string): Promise<GlucoseInsights> {
    // Gather all user data in parallel
    const [profile, allergies, meals, symptoms, glucoseReadings] = await Promise.all([
      profileService.getProfile(userId),
      allergyService.getAllergies(userId),
      mealService.getMeals(userId),
      symptomService.getSymptoms(userId),
      glucoseService.findAll(userId),
    ]);

    const userData = {
      profile: profile ? {
        firstName: profile.firstName,
        lastName: profile.lastName,
        dob: profile.dob,
        sex: profile.sex,
        diabetesType: profile.diabetesType,
        bloodType: profile.bloodType,
        height: profile.height,
        weight: profile.weight,
      } : null,
      allergies: allergies.map(a => ({
        name: a.name,
        severity: a.severity,
        notes: a.notes,
      })),
      meals: meals.map(m => ({
        name: m.name,
        type: m.type,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fiber: m.fiber,
        dateRecorded: m.dateRecorded,
        time: m.time,
      })),
      symptoms: symptoms.map(s => ({
        symptomName: s.symptomName,
        intensity: s.intensity,
        dateRecorded: s.dateRecorded,
        time: s.time,
        notes: s.notes,
      })),
      glucoseReadings: glucoseReadings.map(g => ({
        value: g.value,
        unit: g.unit,
        dateRecorded: g.dateRecorded,
        time: g.time,
        mealContext: g.mealContext,
        notes: g.notes,
      })),
    };

    return generateGlucoseInsights(userData);
  },
};

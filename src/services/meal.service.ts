import { Meal } from "../models";
import type { CreateMealInput, MealUpdateInput } from "../validators";

export class MealService {
  async getMeals(userId: string) {
    return Meal.find({ userId });
  }

  async getMealById(id: string) {
    return await Meal.findById(id);
  }

  async getMealsByType(userId: string, type: string) {
    return Meal.find({ userId, type });
  }

  async getMealsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return Meal.find({
      userId,
      dateRecorded: { $gte: startDate, $lte: endDate },
    });
  }

  async createMeal(userId: string, meal: CreateMealInput) {
    return await Meal.create({ ...meal, userId });
  }

  async updateMeal(id: string, meal: MealUpdateInput) {
    return await Meal.findByIdAndUpdate(id, meal);
  }

  async deleteMeal(id: string) {
    return await Meal.findByIdAndDelete(id);
  }
}

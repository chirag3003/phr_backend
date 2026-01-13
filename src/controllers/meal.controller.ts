import type { Context } from "hono";
import { MealService } from "../services";
import { StatusCodes } from "http-status-codes";
import { createMealSchema, updateMealSchema } from "../validators";

const mealService = new MealService();

export class MealController {
  async getMeals(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const meals = await mealService.getMeals(userId);
      return ctx.json(meals, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getMealById(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const meal = await mealService.getMealById(id);
      return ctx.json(meal, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getMealsByType(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const type = ctx.req.query("type") as string;
      const meals = await mealService.getMealsByType(userId, type);
      return ctx.json(meals, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getMealsByDateRange(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const startDate = new Date(ctx.req.query("startDate") as string);
      const endDate = new Date(ctx.req.query("endDate") as string);
      const meals = await mealService.getMealsByDateRange(userId, startDate, endDate);
      return ctx.json(meals, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createMeal(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const body = createMealSchema.parse(await ctx.req.json());
      const createdMeal = await mealService.createMeal(userId, body);
      return ctx.json(createdMeal, StatusCodes.CREATED);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateMeal(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const body = updateMealSchema.parse(await ctx.req.json());
      const updatedMeal = await mealService.updateMeal(id, body);
      return ctx.json(updatedMeal, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteMeal(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      await mealService.deleteMeal(id);
      return ctx.json({}, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

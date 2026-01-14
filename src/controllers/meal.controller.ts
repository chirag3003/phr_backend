import type { Context } from "hono";
import { MealService, UploadService } from "../services";
import { StatusCodes } from "http-status-codes";
import { createMealSchema, updateMealSchema } from "../validators";
import { analyzeMealImage } from "../lib/openai";

const mealService = new MealService();
const uploadService = new UploadService();

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

  async createMealFromImage(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const body = await ctx.req.parseBody();
      const file = body["file"] as File;

      if (!file) {
        return ctx.json({ error: "No file provided" }, StatusCodes.BAD_REQUEST);
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        return ctx.json(
          { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" },
          StatusCodes.BAD_REQUEST
        );
      }

      // Convert file to base64 for OpenAI
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      // Analyze the image using OpenAI
      const mealAnalysis = await analyzeMealImage(base64, file.type);

      // Upload the image to get a URL
      const baseUrl = new URL(ctx.req.url).origin;
      const uploadResult = await uploadService.uploadFile(userId, file, baseUrl);

      // Create the meal with analyzed data
      const now = new Date();
      const mealData = {
        name: mealAnalysis.name,
        detail: mealAnalysis.detail || "",
        type: mealAnalysis.type,
        mealImage: uploadResult.url,
        calories: mealAnalysis.calories,
        protein: mealAnalysis.protein,
        carbs: mealAnalysis.carbs,
        fiber: mealAnalysis.fiber,
        dateRecorded: now,
        time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
        addedBy: "AI Analysis",
        notes: mealAnalysis.notes || "",
      };

      const createdMeal = await mealService.createMeal(userId, mealData);

      return ctx.json(
        {
          meal: createdMeal,
          analysis: mealAnalysis,
        },
        StatusCodes.CREATED
      );
    } catch (err) {
      console.error(err);
      return ctx.json({ error: "Failed to analyze and create meal" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

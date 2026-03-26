import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import {
  AllergyService,
  DocumentService,
  GlucoseService,
  MealService,
  ProfileService,
  SymptomService,
  WaterService,
  InsightsService,
  UploadService,
  WaterInsightsService,
  DocDoctorService,
  StepsService,
} from "../services";
import {
  createAllergySchema,
  updateAllergySchema,
  createMealSchema,
  updateMealSchema,
  createGlucoseSchema,
  updateGlucoseSchema,
  createSymptomSchema,
  updateSymptomSchema,
  createDocumentSchema,
  updateDocumentSchema,
  createWaterSchema,
  updateWaterSchema,
} from "../validators";
import { createDocDoctorSchema } from "../validators/docDoctor.schema";
import { updateDocDoctorSchema } from "../validators/docDoctor.schema";
import { summaryRequestSchema } from "../validators/summary.validator";
import { FamilyPermission } from "../models";

const profileService = new ProfileService();
const mealService = new MealService();
const glucoseService = new GlucoseService();
const symptomService = new SymptomService();
const documentService = new DocumentService();
const allergyService = new AllergyService();
const waterService = new WaterService();
const insightsService = new InsightsService();
const uploadService = new UploadService();
const waterInsightsService = new WaterInsightsService();
const docDoctorService = new DocDoctorService();
const stepsService = new StepsService();

export class SharedController {
  async getProfile(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const profile = await profileService.getProfile(targetUserId);
      return ctx.json(profile, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getMeals(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const meals = await mealService.getMeals(targetUserId);
      return ctx.json(meals, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createMeal(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const body = createMealSchema.parse(await ctx.req.json());
      const created = await mealService.createMeal(targetUserId, body);
      return ctx.json(created, StatusCodes.CREATED);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateMeal(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const body = updateMealSchema.parse(await ctx.req.json());
      const updated = await mealService.updateMeal(id, body);
      return ctx.json(updated, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteMeal(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      await mealService.deleteMeal(id);
      return ctx.json({}, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getGlucose(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const readings = await glucoseService.getGlucoseReadings(targetUserId);
      return ctx.json(readings, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createGlucose(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const body = createGlucoseSchema.parse(await ctx.req.json());
      const created = await glucoseService.createGlucose(targetUserId, body);
      return ctx.json(created, StatusCodes.CREATED);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateGlucose(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const body = updateGlucoseSchema.parse(await ctx.req.json());
      const updated = await glucoseService.updateGlucose(id, body);
      return ctx.json(updated, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteGlucose(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      await glucoseService.deleteGlucose(id);
      return ctx.json({}, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getSymptoms(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const symptoms = await symptomService.getSymptoms(targetUserId);
      return ctx.json(symptoms, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createSymptom(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const body = createSymptomSchema.parse(await ctx.req.json());
      const created = await symptomService.createSymptom(targetUserId, body);
      return ctx.json(created, StatusCodes.CREATED);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateSymptom(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const body = updateSymptomSchema.parse(await ctx.req.json());
      const updated = await symptomService.updateSymptom(id, body);
      return ctx.json(updated, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteSymptom(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      await symptomService.deleteSymptom(id);
      return ctx.json({}, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getDocuments(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const documents = await documentService.getDocuments(targetUserId);
      return ctx.json(documents, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getDocDoctors(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const doctors = await docDoctorService.getDocDoctorsByUserId(targetUserId);
      return ctx.json(doctors, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createDocDoctor(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const body = createDocDoctorSchema.parse(await ctx.req.json());
      const created = await docDoctorService.createDocDoctor(targetUserId, body);
      return ctx.json(created, StatusCodes.CREATED);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return ctx.json({ error: error.issues }, StatusCodes.BAD_REQUEST);
      }
      console.error(error);
      return ctx.json({ error: "Internal server error" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateDocDoctor(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const id = ctx.req.param("id");
      const body = updateDocDoctorSchema.parse(await ctx.req.json());
      const updated = await docDoctorService.updateDocDoctorByUser(targetUserId, id, body);
      if (!updated) {
        return ctx.json({ error: "Doctor not found" }, StatusCodes.NOT_FOUND);
      }
      return ctx.json(updated, StatusCodes.OK);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return ctx.json({ error: error.issues }, StatusCodes.BAD_REQUEST);
      }
      console.error(error);
      return ctx.json({ error: "Internal server error" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteDocDoctor(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const id = ctx.req.param("id");
      const deleted = await docDoctorService.deleteDocDoctorByUser(targetUserId, id);
      if (!deleted) {
        return ctx.json({ error: "Doctor not found" }, StatusCodes.NOT_FOUND);
      }
      await documentService.deleteDocumentsByDoctor(targetUserId, id);
      return ctx.json({}, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({ error: "Internal server error" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createDocument(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const formData = await ctx.req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return ctx.json({ error: "No file provided" }, StatusCodes.BAD_REQUEST);
      }

      const documentType = formData.get("documentType") as string;
      const date = formData.get("date") as string;
      const docDoctorId = formData.get("docDoctorId") as string | null;
      const title = formData.get("title") as string | null;

      const documentData: Record<string, unknown> = { documentType, date };
      if (documentType === "Prescription" && docDoctorId) {
        documentData.docDoctorId = docDoctorId;
      }
      if (documentType === "Report" && title) {
        documentData.title = title;
      }

      const validated = createDocumentSchema.parse(documentData);
      const upload = await uploadService.uploadFile(targetUserId, file, {
        folder: "documents",
      });
      const created = await documentService.createDocument(targetUserId, {
        ...validated,
        fileUrl: upload.url,
        fileSize: formatFileSize(upload.size),
      });

      return ctx.json(created, StatusCodes.CREATED);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateDocument(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const body = updateDocumentSchema.parse(await ctx.req.json());
      const updated = await documentService.updateDocument(id, body);
      return ctx.json(updated, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteDocument(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      await documentService.deleteDocument(id);
      return ctx.json({}, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllergies(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const allergies = await allergyService.getAllergies(targetUserId);
      return ctx.json(allergies, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createAllergy(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const body = createAllergySchema.parse(await ctx.req.json());
      const created = await allergyService.createAllergy(targetUserId, body);
      return ctx.json(created, StatusCodes.CREATED);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateAllergy(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const body = updateAllergySchema.parse(await ctx.req.json());
      const updated = await allergyService.updateAllergy(id, body);
      return ctx.json(updated, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteAllergy(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      await allergyService.deleteAllergy(id);
      return ctx.json({}, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getWater(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const records = await waterService.getWaterByUserId(targetUserId);
      return ctx.json(records, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createWater(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const body = createWaterSchema.parse(await ctx.req.json());
      const created = await waterService.upsertWaterByDate(targetUserId, body);
      return ctx.json(created, StatusCodes.CREATED);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateWater(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const body = updateWaterSchema.parse(await ctx.req.json());
      const updated = await waterService.updateWater(id, body);
      return ctx.json(updated, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteWater(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      await waterService.deleteWater(id);
      return ctx.json({}, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getSharedGlucoseInsights(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const insights = await insightsService.getGlucoseInsights(targetUserId);
      return ctx.json(insights, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getSharedMealInsights(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const insights = await insightsService.getMealInsights(targetUserId);
      return ctx.json(insights, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getSharedWaterInsights(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const insights = await waterInsightsService.getWaterInsights(targetUserId);
      return ctx.json(insights, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getSharedSteps(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const steps = await stepsService.getSteps(targetUserId);
      return ctx.json(steps, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getSharedActivityInsights(ctx: Context) {
    try {
      const targetUserId = ctx.get("targetUserId");
      const insights = await insightsService.getActivityInsights(targetUserId);
      return ctx.json(insights, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async generateSharedSummary(ctx: Context) {
    try {
      const requesterId = ctx.get("userId");
      const targetUserId = ctx.get("targetUserId");
      const body = await ctx.req.json();
      const { startDate, endDate, include } = summaryRequestSchema.parse(body);

      const start = new Date(startDate);
      const end = new Date(endDate);

      const data = await insightsService.getSummaryData(targetUserId, start, end);

      const permission = await FamilyPermission.findOne({
        userId: targetUserId,
        permissionTo: requesterId,
      });

      const permissions = permission?.permissions;
      const effectiveInclude = {
        glucose: Boolean(include.glucose && permissions?.glucose),
        symptoms: Boolean(include.symptoms && permissions?.symptoms),
        meals: Boolean(include.meals && permissions?.meals),
        documents: Boolean(include.documents && permissions?.documents),
        steps: Boolean(include.steps && permissions?.steps),
      };

      if (!effectiveInclude.glucose) data.glucose = [];
      if (!effectiveInclude.symptoms) data.symptoms = [];
      if (!effectiveInclude.meals) data.meals = [];
      if (!effectiveInclude.documents) data.documents = [];
      if (!effectiveInclude.steps) (data as any).steps = [];

      const { AiService } = await import("../services/ai.service");
      const aiService = new AiService();
      const aiSummary = await aiService.generateHealthSummary(data);

      const { PdfService } = await import("../services/pdf.service");
      const pdfService = new PdfService();
      const pdfUrl = await pdfService.generateHealthSummary(data, aiSummary);

      return ctx.json({ url: pdfUrl }, StatusCodes.CREATED);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return ctx.json({ error: error.issues }, StatusCodes.BAD_REQUEST);
      }
      console.error(error);
      return ctx.json({ error: "Internal server error" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

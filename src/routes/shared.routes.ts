import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { permissionMiddleware } from "../middlewares/permission.middleware";
import { SharedController } from "../controllers/shared.controller";

const sharedRoutes = new Hono();
const sharedController = new SharedController();

sharedRoutes.use("*", authMiddleware);

// Profile (read-only, requires any permission entry)
sharedRoutes.get(
  "/:userId/profile",
  permissionMiddleware({ domain: "profile" }),
  (ctx) => sharedController.getProfile(ctx),
);

// Meals
sharedRoutes.get(
  "/:userId/meals",
  permissionMiddleware({ domain: "meals" }),
  (ctx) => sharedController.getMeals(ctx),
);
sharedRoutes.post(
  "/:userId/meals",
  permissionMiddleware({ domain: "meals", requireWrite: true }),
  (ctx) => sharedController.createMeal(ctx),
);
sharedRoutes.put(
  "/:userId/meals/:id",
  permissionMiddleware({ domain: "meals", requireWrite: true }),
  (ctx) => sharedController.updateMeal(ctx),
);
sharedRoutes.delete(
  "/:userId/meals/:id",
  permissionMiddleware({ domain: "meals", requireWrite: true }),
  (ctx) => sharedController.deleteMeal(ctx),
);

// Glucose
sharedRoutes.get(
  "/:userId/glucose",
  permissionMiddleware({ domain: "glucose" }),
  (ctx) => sharedController.getGlucose(ctx),
);
sharedRoutes.post(
  "/:userId/glucose",
  permissionMiddleware({ domain: "glucose", requireWrite: true }),
  (ctx) => sharedController.createGlucose(ctx),
);
sharedRoutes.put(
  "/:userId/glucose/:id",
  permissionMiddleware({ domain: "glucose", requireWrite: true }),
  (ctx) => sharedController.updateGlucose(ctx),
);
sharedRoutes.delete(
  "/:userId/glucose/:id",
  permissionMiddleware({ domain: "glucose", requireWrite: true }),
  (ctx) => sharedController.deleteGlucose(ctx),
);

// Glucose insights (shared)
sharedRoutes.get(
  "/:userId/insights/glucose",
  permissionMiddleware({ domain: "glucose" }),
  (ctx) => sharedController.getSharedGlucoseInsights(ctx),
);

// Symptoms
sharedRoutes.get(
  "/:userId/symptoms",
  permissionMiddleware({ domain: "symptoms" }),
  (ctx) => sharedController.getSymptoms(ctx),
);
sharedRoutes.post(
  "/:userId/symptoms",
  permissionMiddleware({ domain: "symptoms", requireWrite: true }),
  (ctx) => sharedController.createSymptom(ctx),
);
sharedRoutes.put(
  "/:userId/symptoms/:id",
  permissionMiddleware({ domain: "symptoms", requireWrite: true }),
  (ctx) => sharedController.updateSymptom(ctx),
);
sharedRoutes.delete(
  "/:userId/symptoms/:id",
  permissionMiddleware({ domain: "symptoms", requireWrite: true }),
  (ctx) => sharedController.deleteSymptom(ctx),
);

// Documents
sharedRoutes.get(
  "/:userId/documents",
  permissionMiddleware({ domain: "documents" }),
  (ctx) => sharedController.getDocuments(ctx),
);
sharedRoutes.post(
  "/:userId/documents",
  permissionMiddleware({ domain: "documents", requireWrite: true }),
  (ctx) => sharedController.createDocument(ctx),
);
sharedRoutes.put(
  "/:userId/documents/:id",
  permissionMiddleware({ domain: "documents", requireWrite: true }),
  (ctx) => sharedController.updateDocument(ctx),
);
sharedRoutes.delete(
  "/:userId/documents/:id",
  permissionMiddleware({ domain: "documents", requireWrite: true }),
  (ctx) => sharedController.deleteDocument(ctx),
);

// Allergies
sharedRoutes.get(
  "/:userId/allergies",
  permissionMiddleware({ domain: "allergies" }),
  (ctx) => sharedController.getAllergies(ctx),
);
sharedRoutes.post(
  "/:userId/allergies",
  permissionMiddleware({ domain: "allergies", requireWrite: true }),
  (ctx) => sharedController.createAllergy(ctx),
);
sharedRoutes.put(
  "/:userId/allergies/:id",
  permissionMiddleware({ domain: "allergies", requireWrite: true }),
  (ctx) => sharedController.updateAllergy(ctx),
);
sharedRoutes.delete(
  "/:userId/allergies/:id",
  permissionMiddleware({ domain: "allergies", requireWrite: true }),
  (ctx) => sharedController.deleteAllergy(ctx),
);

// Water
sharedRoutes.get(
  "/:userId/water",
  permissionMiddleware({ domain: "water" }),
  (ctx) => sharedController.getWater(ctx),
);
sharedRoutes.post(
  "/:userId/water",
  permissionMiddleware({ domain: "water", requireWrite: true }),
  (ctx) => sharedController.createWater(ctx),
);
sharedRoutes.put(
  "/:userId/water/:id",
  permissionMiddleware({ domain: "water", requireWrite: true }),
  (ctx) => sharedController.updateWater(ctx),
);
sharedRoutes.delete(
  "/:userId/water/:id",
  permissionMiddleware({ domain: "water", requireWrite: true }),
  (ctx) => sharedController.deleteWater(ctx),
);

// Water insights (shared)
sharedRoutes.get(
  "/:userId/insights/water",
  permissionMiddleware({ domain: "water" }),
  (ctx) => sharedController.getSharedWaterInsights(ctx),
);

export default sharedRoutes;

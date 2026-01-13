import { Hono } from "hono";
import { MealController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const mealController = new MealController();
const mealRoutes = new Hono();

mealRoutes.get("/", authMiddleware, mealController.getMeals);
mealRoutes.get("/type", authMiddleware, mealController.getMealsByType);
mealRoutes.get("/range", authMiddleware, mealController.getMealsByDateRange);
mealRoutes.get("/:id", authMiddleware, mealController.getMealById);
mealRoutes.post("/", authMiddleware, mealController.createMeal);
mealRoutes.put("/:id", authMiddleware, mealController.updateMeal);
mealRoutes.delete("/:id", authMiddleware, mealController.deleteMeal);

export default mealRoutes;

import { Hono } from "hono";
import { SymptomController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const symptomController = new SymptomController();
const symptomRoutes = new Hono();

symptomRoutes.get("/", authMiddleware, symptomController.getSymptoms);
symptomRoutes.get("/range", authMiddleware, symptomController.getSymptomsByDateRange);
symptomRoutes.get("/:id", authMiddleware, symptomController.getSymptomById);
symptomRoutes.post("/", authMiddleware, symptomController.createSymptom);
symptomRoutes.put("/:id", authMiddleware, symptomController.updateSymptom);
symptomRoutes.delete("/:id", authMiddleware, symptomController.deleteSymptom);

export default symptomRoutes;

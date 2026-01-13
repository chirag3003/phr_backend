import { Hono } from "hono";
import { AllergyController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const allergyController = new AllergyController();
const allergyRoutes = new Hono()


allergyRoutes.get("/", authMiddleware, allergyController.getAllergies);
allergyRoutes.get("/:id", authMiddleware, allergyController.getAllergyById);
allergyRoutes.post("/", authMiddleware,  allergyController.createAllergy);
allergyRoutes.put("/:id", authMiddleware, allergyController.updateAllergy);

export default allergyRoutes;
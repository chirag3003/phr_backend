import { Hono } from "hono";
import { FamilyController } from "../controllers/family.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const familyController = new FamilyController();
const familyRoutes = new Hono();

familyRoutes.get("/", authMiddleware, familyController.getFamiliesByUserId);

export default familyRoutes;

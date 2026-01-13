import { Hono } from "hono";
import { ProfileController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const profileController = new ProfileController();
const profileRoutes = new Hono();

profileRoutes.get("/", authMiddleware, profileController.getProfile);
profileRoutes.get("/:id", authMiddleware, profileController.getProfileById);
profileRoutes.post("/", authMiddleware, profileController.createProfile);
profileRoutes.put("/", authMiddleware, profileController.updateProfile);
profileRoutes.delete("/:id", authMiddleware, profileController.deleteProfile);

export default profileRoutes;

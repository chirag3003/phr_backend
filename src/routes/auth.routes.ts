import { Hono } from "hono";
import { AuthController } from "../controllers";

const authController = new AuthController();
const authRoutes = new Hono();

authRoutes.post("/signup", authController.signup);
authRoutes.post("/login", authController.login);

export default authRoutes;

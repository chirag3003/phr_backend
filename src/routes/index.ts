import { Hono } from "hono";
import authRoutes from "./auth.routes";
import allergyRoutes from "./allergy.routes";
import profileRoutes from "./profile.routes";
import symptomRoutes from "./symptom.routes";
import mealRoutes from "./meal.routes";
import documentRoutes from "./document.routes";

const app = new Hono();

app.route("/auth", authRoutes);
app.route("/allergies", allergyRoutes);
app.route("/profile", profileRoutes);
app.route("/symptoms", symptomRoutes);
app.route("/meals", mealRoutes);
app.route("/documents", documentRoutes);

export default app;

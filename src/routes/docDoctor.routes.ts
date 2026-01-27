import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { DocDoctorController } from "../controllers/docDoctor.controller";

const docDoctorController = new DocDoctorController();
const docDoctorRoutes = new Hono();

docDoctorRoutes.get("/", authMiddleware, docDoctorController.getDocDoctorsByUserId);
docDoctorRoutes.get("/:id", authMiddleware, docDoctorController.getDocDoctorById);
docDoctorRoutes.post("/", authMiddleware, docDoctorController.createDocDoctor);
docDoctorRoutes.put("/:id", authMiddleware, docDoctorController.updateDocDoctor);
docDoctorRoutes.delete("/:id", authMiddleware, docDoctorController.deleteDocDoctor);

export default docDoctorRoutes;

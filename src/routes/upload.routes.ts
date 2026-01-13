import { Hono } from "hono";
import { UploadController } from "../controllers/upload.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const uploadController = new UploadController();
const uploadRoutes = new Hono();

uploadRoutes.post("/", authMiddleware, uploadController.uploadImage);
uploadRoutes.post("/bulk", authMiddleware, uploadController.uploadBulkImages);
uploadRoutes.get("/", authMiddleware, uploadController.getUploads);
uploadRoutes.get("/:id", authMiddleware, uploadController.getUploadById);
uploadRoutes.delete("/:id", authMiddleware, uploadController.deleteUpload);

export default uploadRoutes;

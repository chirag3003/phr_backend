import { Hono } from "hono";
import { DocumentController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const documentController = new DocumentController();
const documentRoutes = new Hono();

documentRoutes.get("/", authMiddleware, documentController.getDocuments);
documentRoutes.get("/type", authMiddleware, documentController.getDocumentsByType);
documentRoutes.get("/:id", authMiddleware, documentController.getDocumentById);
documentRoutes.post("/", authMiddleware, documentController.createDocument);
documentRoutes.put("/:id", authMiddleware, documentController.updateDocument);
documentRoutes.delete("/:id", authMiddleware, documentController.deleteDocument);

export default documentRoutes;

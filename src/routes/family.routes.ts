import { Hono } from "hono";
import { FamilyController } from "../controllers/family.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const familyController = new FamilyController();
const familyRoutes = new Hono();

// Family CRUD
familyRoutes.get("/", authMiddleware, familyController.getFamiliesByUserId);
familyRoutes.get("/:id", authMiddleware, familyController.getFamilyById);
familyRoutes.post("/", authMiddleware, familyController.createFamily);
familyRoutes.put("/:id", authMiddleware, familyController.updateFamily);
familyRoutes.delete("/:id", authMiddleware, familyController.deleteFamily);

// Member management
familyRoutes.post("/:id/members", authMiddleware, familyController.addMemberToFamily);
familyRoutes.delete("/:id/members", authMiddleware, familyController.removeMemberFromFamily);

// Permission management
familyRoutes.get("/permissions", authMiddleware, familyController.getPermissionEntry);
familyRoutes.post("/permissions", authMiddleware, familyController.createPermissionEntry);
familyRoutes.put("/:id/permissions", authMiddleware, familyController.updatePermissionEntry);
familyRoutes.delete("/:id/permissions", authMiddleware, familyController.deletePermissionEntry);

export default familyRoutes;

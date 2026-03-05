import { Hono } from "hono";
import { FamilyController } from "../controllers/family.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const familyController = new FamilyController();
const familyRoutes = new Hono();

// Permission management
familyRoutes.get("/permissions", authMiddleware, familyController.getPermissionEntry);
familyRoutes.get("/permissionsFrom", authMiddleware, familyController.getPermissionFromEntry);
familyRoutes.post("/permissions", authMiddleware, familyController.createPermissionEntry);
familyRoutes.put("/:id/permissions", authMiddleware, familyController.updatePermissionEntry);
familyRoutes.delete("/permissions", authMiddleware, familyController.deletePermissionEntry);

// Family CRUD
familyRoutes.get("/", authMiddleware, familyController.getFamiliesByUserId);
familyRoutes.get("/:id", authMiddleware, familyController.getFamilyById);
familyRoutes.get("/:id/members", authMiddleware, familyController.getFamilyWithMembers);
familyRoutes.post("/", authMiddleware, familyController.createFamily);
familyRoutes.put("/:id", authMiddleware, familyController.updateFamily);
familyRoutes.delete("/:id", authMiddleware, familyController.deleteFamily);

// Member management
familyRoutes.post("/:id/members", authMiddleware, familyController.addMemberToFamily);
familyRoutes.delete("/:id/members", authMiddleware, familyController.removeMemberFromFamily);
familyRoutes.post("/:id/leave", authMiddleware, familyController.leaveFamily);

export default familyRoutes;

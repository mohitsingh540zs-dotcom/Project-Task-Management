import express from "express";
import {
  assignProjectManager,
  assignTeamMembers,
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  updateProject,
} from "../controllers/project.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizedRoles } from "../middleware/roleMiddleware.js";

const projectRouter = express.Router();

projectRouter.post(
  "/create-project",
  authMiddleware,
  authorizedRoles("admin", "projectManager"),
  createProject,
);

projectRouter.get("/getProjects", authMiddleware, getAllProjects);

projectRouter.get("/:id", authMiddleware, getProjectById);

projectRouter.get("/:id", authMiddleware, updateProject);

projectRouter.patch(
  "/:id/manager",
  authMiddleware,
  authorizedRoles("admin"),
  assignProjectManager,
);

projectRouter.patch(
  "/:id/members",
  authMiddleware,
  authorizedRoles("admin", "project_manager"),
  assignTeamMembers,
);

projectRouter.delete("/:id", authMiddleware, deleteProject);

export default projectRouter;

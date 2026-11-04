import express from "express";
import {
  createProject,
  getAllProjects,
} from "../controllers/project.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizedRoles } from "../middleware/roleMiddleware.js";

const projectRouter = express.Router();

projectRouter.get("/getProjects", authMiddleware, getAllProjects);

projectRouter.post(
  "/create-project",
  authMiddleware,
  authorizedRoles("admin", "projectManager"),
  createProject,
);

export default projectRouter;

import express from "express";
import {
  createProject,
  getProject,
  listProjects,
  semanticSearchProjects,
  updateProject,
} from "../controllers/projectController.js";
import { authenticate, authorize, optionalAuth } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { USER_ROLES } from "../constants/enums.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/", optionalAuth, asyncHandler(listProjects));
router.post("/", authenticate, authorize(USER_ROLES.FOUNDER, USER_ROLES.ADMIN), asyncHandler(createProject));
router.get("/search/semantic", asyncHandler(semanticSearchProjects));
router.post("/search/semantic", asyncHandler(semanticSearchProjects));
router.get("/:projectId", optionalAuth, validateObjectId("projectId"), asyncHandler(getProject));
router.patch(
  "/:projectId",
  authenticate,
  validateObjectId("projectId"),
  authorize(USER_ROLES.FOUNDER, USER_ROLES.ADMIN),
  asyncHandler(updateProject)
);

export default router;

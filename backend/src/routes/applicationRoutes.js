import express from "express";
import {
  applyToProject,
  listMyApplications,
  listProjectApplications,
  reviewApplication,
} from "../controllers/applicationController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { USER_ROLES } from "../constants/enums.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/me", authenticate, authorize(USER_ROLES.CONTRIBUTOR, USER_ROLES.ADMIN), asyncHandler(listMyApplications));
router.patch(
  "/:applicationId",
  authenticate,
  validateObjectId("applicationId"),
  authorize(USER_ROLES.FOUNDER, USER_ROLES.ADMIN),
  asyncHandler(reviewApplication)
);
router.post(
  "/projects/:projectId",
  authenticate,
  validateObjectId("projectId"),
  authorize(USER_ROLES.CONTRIBUTOR, USER_ROLES.ADMIN),
  asyncHandler(applyToProject)
);
router.get(
  "/projects/:projectId",
  authenticate,
  validateObjectId("projectId"),
  authorize(USER_ROLES.FOUNDER, USER_ROLES.ADMIN),
  asyncHandler(listProjectApplications)
);

export default router;

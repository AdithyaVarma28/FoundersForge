import express from "express";
import { getMyResumes, uploadContributorResume } from "../controllers/resumeController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { uploadResume } from "../middleware/upload.js";
import { USER_ROLES } from "../constants/enums.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/me", authenticate, authorize(USER_ROLES.CONTRIBUTOR, USER_ROLES.ADMIN), asyncHandler(getMyResumes));
router.post(
  "/upload",
  authenticate,
  authorize(USER_ROLES.CONTRIBUTOR, USER_ROLES.ADMIN),
  uploadResume.single("resume"),
  asyncHandler(uploadContributorResume)
);

export default router;

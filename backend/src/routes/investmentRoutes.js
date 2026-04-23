import express from "express";
import { createInvestment, listMyInvestments, listProjectInvestments } from "../controllers/investmentController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { USER_ROLES } from "../constants/enums.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/me", authenticate, authorize(USER_ROLES.INVESTOR, USER_ROLES.ADMIN), asyncHandler(listMyInvestments));
router.post(
  "/projects/:projectId",
  authenticate,
  validateObjectId("projectId"),
  authorize(USER_ROLES.INVESTOR, USER_ROLES.ADMIN),
  asyncHandler(createInvestment)
);
router.get(
  "/projects/:projectId",
  authenticate,
  validateObjectId("projectId"),
  authorize(USER_ROLES.FOUNDER, USER_ROLES.ADMIN),
  asyncHandler(listProjectInvestments)
);

export default router;

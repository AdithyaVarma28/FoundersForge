import express from "express";
import { contributorDashboard, founderDashboard, investorDashboard } from "../controllers/dashboardController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { USER_ROLES } from "../constants/enums.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/founder", authenticate, authorize(USER_ROLES.FOUNDER, USER_ROLES.ADMIN), asyncHandler(founderDashboard));
router.get("/investor", authenticate, authorize(USER_ROLES.INVESTOR, USER_ROLES.ADMIN), asyncHandler(investorDashboard));
router.get("/contributor", authenticate, authorize(USER_ROLES.CONTRIBUTOR, USER_ROLES.ADMIN), asyncHandler(contributorDashboard));

export default router;

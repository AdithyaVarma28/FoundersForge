import express from "express";
import { getMyProfile, getProfileByUserId, updateMyProfile } from "../controllers/profileController.js";
import { authenticate } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/me", authenticate, asyncHandler(getMyProfile));
router.patch("/me", authenticate, asyncHandler(updateMyProfile));
router.get("/:userId", authenticate, validateObjectId("userId"), asyncHandler(getProfileByUserId));

export default router;

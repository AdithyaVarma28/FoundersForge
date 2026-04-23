import express from "express";
import { getProjectMessages, sendProjectMessage } from "../controllers/messageController.js";
import { authenticate } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/projects/:projectId", authenticate, validateObjectId("projectId"), asyncHandler(getProjectMessages));
router.post("/projects/:projectId", authenticate, validateObjectId("projectId"), asyncHandler(sendProjectMessage));

export default router;

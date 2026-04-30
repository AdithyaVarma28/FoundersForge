import express from "express";
import { queryGroq } from "../groq_handler.js";
import { structureProjectIdea } from "../services/aiService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { USER_ROLES } from "../constants/enums.js";

const router = express.Router();

// POST /api/chat — general AI chat
router.post(
  "/chat",
  asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "message is required" });
    }
    const reply = await queryGroq(message);
    res.json({ success: true, reply });
  })
);

// POST /api/ai/structure-idea — preview AI project structuring without saving
router.post(
  "/ai/structure-idea",
  authenticate,
  authorize(USER_ROLES.FOUNDER, USER_ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const { rawIdea } = req.body;
    if (!rawIdea || rawIdea.trim().length < 20) {
      return res.status(400).json({ success: false, message: "rawIdea must be at least 20 characters" });
    }
    const structured = await structureProjectIdea(rawIdea);
    res.json({ success: true, structured });
  })
);

export default router;

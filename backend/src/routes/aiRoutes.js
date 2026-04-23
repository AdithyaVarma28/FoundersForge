import express from "express";
import { queryGroq } from "../groq_handler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

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

export default router;

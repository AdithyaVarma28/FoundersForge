import express from "express";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import investmentRoutes from "./routes/investmentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const router = express.Router();

router.use("/", aiRoutes);
router.use("/auth", authRoutes);
router.use("/profiles", profileRoutes);
router.use("/projects", projectRoutes);
router.use("/resumes", resumeRoutes);
router.use("/applications", applicationRoutes);
router.use("/investments", investmentRoutes);
router.use("/messages", messageRoutes);
router.use("/dashboards", dashboardRoutes);
router.use("/admin", adminRoutes);

export default router;

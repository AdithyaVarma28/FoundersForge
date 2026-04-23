import express from "express";
import { adminOverview, listUsers, updateUser } from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { USER_ROLES } from "../constants/enums.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));
router.get("/overview", asyncHandler(adminOverview));
router.get("/users", asyncHandler(listUsers));
router.patch("/users/:userId", validateObjectId("userId"), asyncHandler(updateUser));

export default router;

import User from "../models/User.js";
import Project from "../models/Project.js";
import Application from "../models/Application.js";
import Investment from "../models/Investment.js";
import { USER_ROLES, USER_STATUSES } from "../constants/enums.js";
import { ApiError } from "../utils/apiError.js";

export async function listUsers(req, res) {
  const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
}

export async function updateUser(req, res) {
  const payload = {};

  if (req.body.status !== undefined) {
    if (!Object.values(USER_STATUSES).includes(req.body.status)) {
      throw new ApiError(400, "Invalid user status");
    }
    payload.status = req.body.status;
  }

  if (req.body.role !== undefined) {
    if (!Object.values(USER_ROLES).includes(req.body.role)) {
      throw new ApiError(400, "Invalid user role");
    }
    payload.role = req.body.role;
  }

  const user = await User.findByIdAndUpdate(req.params.userId, payload, { new: true, runValidators: true }).select("-passwordHash");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json({ success: true, user });
}

export async function adminOverview(req, res) {
  const [users, projects, applications, investments] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Application.countDocuments(),
    Investment.countDocuments(),
  ]);

  const totalInvestmentTracked = await Investment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);

  res.json({
    success: true,
    overview: {
      users,
      projects,
      applications,
      investments,
      totalInvestmentTracked: totalInvestmentTracked[0]?.total || 0,
    },
  });
}

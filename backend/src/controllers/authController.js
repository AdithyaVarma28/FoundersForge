import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { USER_ROLES } from "../constants/enums.js";
import { ApiError } from "../utils/apiError.js";

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET || "foundersforge-dev-secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function authResponse(user) {
  return {
    user: user.toSafeObject ? user.toSafeObject() : user,
    token: signToken(user),
  };
}

export async function register(req, res) {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    throw new ApiError(400, "fullName, email, password, and role are required");
  }

  if (!Object.values(USER_ROLES).includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    fullName,
    email,
    passwordHash,
    role,
  });

  await Profile.create({ user: user._id });

  res.status(201).json({
    success: true,
    ...authResponse(user),
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");

  if (!user || !(await user.verifyPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    success: true,
    ...authResponse(user),
  });
}

export async function getMe(req, res) {
  const profile = await Profile.findOne({ user: req.user._id });

  res.json({
    success: true,
    user: req.user.toSafeObject(),
    profile,
  });
}

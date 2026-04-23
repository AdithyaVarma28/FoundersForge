import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { USER_ROLES, USER_STATUSES } from "../constants/enums.js";
import { ApiError } from "../utils/apiError.js";

function getToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return req.cookies?.token;
}

export async function authenticate(req, res, next) {
  try {
    const token = getToken(req);

    if (!token) {
      throw new ApiError(401, "Authentication token is required");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "foundersforge-dev-secret");
    const user = await User.findById(payload.sub).select("+passwordHash");

    if (!user || user.status !== USER_STATUSES.ACTIVE) {
      throw new ApiError(401, "User session is no longer valid");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.name === "JsonWebTokenError" ? new ApiError(401, "Invalid authentication token") : error);
  }
}

export function optionalAuth(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return next();
  }
  return authenticate(req, res, next);
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication is required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to perform this action"));
    }

    next();
  };
}

export function isAdmin(user) {
  return user?.role === USER_ROLES.ADMIN;
}

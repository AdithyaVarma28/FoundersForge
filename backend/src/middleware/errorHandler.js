import { ApiError } from "../utils/apiError.js";

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || error.status || 500;
  const response = {
    success: false,
    message: error.message || "Internal server error",
  };

  if (error.details) {
    response.details = error.details;
  }

  if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
}

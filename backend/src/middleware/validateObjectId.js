import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

export function validateObjectId(paramName) {
  return (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
      return next(new ApiError(400, `Invalid ${paramName}`));
    }
    next();
  };
}

import mongoose from "mongoose";
import { APPLICATION_STATUSES } from "../constants/enums.js";

const applicationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    contributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: { type: String, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUSES),
      default: APPLICATION_STATUSES.PENDING,
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    reviewNote: { type: String, trim: true, maxlength: 1200 },
  },
  { timestamps: true }
);

applicationSchema.index({ project: 1, contributor: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model("Application", applicationSchema);

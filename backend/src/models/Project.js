import mongoose from "mongoose";
import { MEMBERSHIP_ROLES, PROJECT_STATUSES } from "../constants/enums.js";

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: Object.values(MEMBERSHIP_ROLES), required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    rawIdea: { type: String, required: true, trim: true },
    summary: { type: String, trim: true, maxlength: 1200 },
    problem: { type: String, trim: true },
    solution: { type: String, trim: true },
    objectives: [{ type: String, trim: true }],
    requiredSkills: [{ type: String, trim: true }],
    rolesNeeded: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUSES),
      default: PROJECT_STATUSES.PUBLISHED,
      index: true,
    },
    fundingGoal: { type: Number, min: 0, default: 0 },
    fundingRaised: { type: Number, min: 0, default: 0 },
    structuredVersion: {
      provider: { type: String, default: "local" },
      generatedAt: Date,
      originalResponse: mongoose.Schema.Types.Mixed,
    },
    embedding: [{ type: Number }],
    members: [memberSchema],
  },
  { timestamps: true }
);

projectSchema.index({
  title: "text",
  summary: "text",
  problem: "text",
  solution: "text",
  requiredSkills: "text",
});
projectSchema.index({ founder: 1, status: 1 });
projectSchema.index({ requiredSkills: 1 });

export default mongoose.models.Project || mongoose.model("Project", projectSchema);

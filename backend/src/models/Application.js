import mongoose from "mongoose";
import { APPLICATION_STATUSES } from "../constants/enums.js";

const resumeSnapshotSchema = new mongoose.Schema(
  {
    skills: [String],
    technologies: [String],
    experience: [
      {
        title: String,
        company: String,
        duration: String,
        summary: String,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        year: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        year: String,
      },
    ],
    bio: String,
    location: String,
    phone: String,
    links: [{ label: String, url: String }],
  },
  { _id: false }
);

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
    // Snapshot of contributor's parsed resume at time of application
    resumeSnapshot: resumeSnapshotSchema,
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

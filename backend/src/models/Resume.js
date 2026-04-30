import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalFile: {
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      path: String,
    },
    extractedText: { type: String, trim: true },
    parsed: {
      skills: [{ type: String, trim: true }],
      technologies: [{ type: String, trim: true }],
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
    },
    embedding: [{ type: Number }],
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ "parsed.skills": 1 });
resumeSchema.index({ "parsed.technologies": 1 });

export default mongoose.models.Resume || mongoose.model("Resume", resumeSchema);

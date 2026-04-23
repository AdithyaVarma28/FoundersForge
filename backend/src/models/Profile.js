import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false }
);

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    level: { type: String, trim: true },
    years: Number,
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    headline: { type: String, trim: true, maxlength: 160 },
    bio: { type: String, trim: true, maxlength: 2000 },
    avatarUrl: { type: String, trim: true },
    location: { type: String, trim: true },
    links: [linkSchema],
    founder: {
      projectHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
      focusAreas: [{ type: String, trim: true }],
    },
    contributor: {
      skills: [skillSchema],
      extractedSkills: [{ type: String, trim: true }],
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
      resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
    },
    investor: {
      investmentFocus: [{ type: String, trim: true }],
      supportedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    },
  },
  { timestamps: true }
);

profileSchema.index({ user: 1 }, { unique: true });
profileSchema.index({ "contributor.extractedSkills": 1 });
profileSchema.index({ "contributor.technologies": 1 });

export default mongoose.models.Profile || mongoose.model("Profile", profileSchema);

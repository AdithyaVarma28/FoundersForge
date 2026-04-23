import Resume from "../models/Resume.js";
import Profile from "../models/Profile.js";
import { ApiError } from "../utils/apiError.js";
import { parseResumeText } from "../services/aiService.js";
import { generateEmbedding, resumeEmbeddingText } from "../services/embeddingService.js";
import { extractTextFromResume } from "../services/resumeFileService.js";

export async function uploadContributorResume(req, res) {
  if (!req.file) {
    throw new ApiError(400, "Resume file is required");
  }

  const extractedText = await extractTextFromResume(req.file);
  const parsed = await parseResumeText(extractedText);
  const embedding = generateEmbedding(resumeEmbeddingText(parsed, extractedText));

  const resume = await Resume.create({
    user: req.user._id,
    originalFile: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    },
    extractedText,
    parsed,
    embedding,
  });

  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    {
      $set: {
        "contributor.resume": resume._id,
        "contributor.extractedSkills": parsed.skills,
        "contributor.technologies": parsed.technologies,
        "contributor.experience": parsed.experience,
        "contributor.education": parsed.education,
      },
      $setOnInsert: { user: req.user._id },
    },
    { upsert: true, new: true }
  );

  res.status(201).json({ success: true, resume, profile });
}

export async function getMyResumes(req, res) {
  const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: resumes.length, resumes });
}

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

  const updateSet = {
    "contributor.resume": resume._id,
  };

  if (parsed.skills && parsed.skills.length > 0) updateSet["contributor.extractedSkills"] = parsed.skills;
  if (parsed.technologies && parsed.technologies.length > 0) updateSet["contributor.technologies"] = parsed.technologies;
  if (parsed.experience && parsed.experience.length > 0) updateSet["contributor.experience"] = parsed.experience;
  if (parsed.education && parsed.education.length > 0) updateSet["contributor.education"] = parsed.education;
  if (parsed.certifications && parsed.certifications.length > 0) updateSet["contributor.certifications"] = parsed.certifications;

  if (parsed.personalDetails) {
    if (parsed.personalDetails.bio) updateSet.bio = parsed.personalDetails.bio;
    if (parsed.personalDetails.location) updateSet.location = parsed.personalDetails.location;
    
    // Convert github and linkedin to links if present
    const newLinks = [];
    if (parsed.personalDetails.github) newLinks.push({ label: 'GitHub', url: parsed.personalDetails.github });
    if (parsed.personalDetails.linkedin) newLinks.push({ label: 'LinkedIn', url: parsed.personalDetails.linkedin });
    if (newLinks.length > 0) updateSet.links = newLinks;
  }

  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    {
      $set: updateSet,
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

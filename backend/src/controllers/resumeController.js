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

  // ── Step 1: Extract raw text from file ──────────────────────────────────
  const extractedText = await extractTextFromResume(req.file);

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║           RESUME EXTRACTION RESULT                  ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`Extracted ${extractedText.length} characters from resume`);
  console.log("\n─── RAW EXTRACTED TEXT (first 1500 chars) ───");
  console.log(extractedText.slice(0, 1500));
  console.log("─────────────────────────────────────────────\n");

  if (!extractedText || extractedText.trim().length < 30) {
    throw new ApiError(422, "Could not extract readable text from the uploaded file. Please upload a text-based PDF, not a scanned image.");
  }

  // ── Step 2: Parse with AI ───────────────────────────────────────────────
  const parsed = await parseResumeText(extractedText);

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║           RESUME PARSED OUTPUT (FINAL)              ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`\n📋 PERSONAL DETAILS:`);
  console.log(`   Bio: ${parsed.personalDetails?.bio || "N/A"}`);
  console.log(`   Location: ${parsed.personalDetails?.location || "N/A"}`);
  console.log(`   Phone: ${parsed.personalDetails?.phone || "N/A"}`);
  console.log(`   GitHub: ${parsed.personalDetails?.github || "N/A"}`);
  console.log(`   LinkedIn: ${parsed.personalDetails?.linkedin || "N/A"}`);

  console.log(`\n🛠️  SKILLS (${parsed.skills?.length || 0}):`);
  console.log(`   ${(parsed.skills || []).join(", ") || "None"}`);

  console.log(`\n💻 TECHNOLOGIES (${parsed.technologies?.length || 0}):`);
  console.log(`   ${(parsed.technologies || []).join(", ") || "None"}`);

  console.log(`\n💼 EXPERIENCE (${parsed.experience?.length || 0} entries):`);
  (parsed.experience || []).forEach((exp, i) => {
    console.log(`   [${i + 1}] ${exp.title || "?"} at ${exp.company || "?"} (${exp.duration || "?"})`);
    if (exp.summary) console.log(`       → ${exp.summary.slice(0, 120)}`);
  });

  console.log(`\n🎓 EDUCATION (${parsed.education?.length || 0} entries):`);
  (parsed.education || []).forEach((edu, i) => {
    console.log(`   [${i + 1}] ${edu.degree || "?"} — ${edu.institution || "?"} (${edu.year || "?"})`);
  });

  console.log(`\n🏆 CERTIFICATIONS (${parsed.certifications?.length || 0}):`);
  (parsed.certifications || []).forEach((cert, i) => {
    console.log(`   [${i + 1}] ${cert.name || "?"} by ${cert.issuer || "?"} (${cert.year || "?"})`);
  });
  console.log("\n══════════════════════════════════════════════════════\n");

  // ── Step 3: Save Resume document ────────────────────────────────────────
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

  // ── Step 4: Update contributor profile ──────────────────────────────────
  const updateSet = {
    "contributor.resume": resume._id,
  };

  if (parsed.skills?.length > 0)        updateSet["contributor.extractedSkills"] = parsed.skills;
  if (parsed.technologies?.length > 0)  updateSet["contributor.technologies"] = parsed.technologies;
  if (parsed.experience?.length > 0)    updateSet["contributor.experience"] = parsed.experience;
  if (parsed.education?.length > 0)     updateSet["contributor.education"] = parsed.education;
  if (parsed.certifications?.length > 0) updateSet["contributor.certifications"] = parsed.certifications;

  if (parsed.personalDetails) {
    if (parsed.personalDetails.bio)      updateSet.bio = parsed.personalDetails.bio;
    if (parsed.personalDetails.location) updateSet.location = parsed.personalDetails.location;
    if (parsed.personalDetails.phone)    updateSet["contributor.phone"] = parsed.personalDetails.phone;

    const newLinks = [];
    if (parsed.personalDetails.github)
      newLinks.push({ label: "GitHub", url: parsed.personalDetails.github.startsWith("http") ? parsed.personalDetails.github : `https://github.com/${parsed.personalDetails.github}` });
    if (parsed.personalDetails.linkedin)
      newLinks.push({ label: "LinkedIn", url: parsed.personalDetails.linkedin.startsWith("http") ? parsed.personalDetails.linkedin : `https://linkedin.com/in/${parsed.personalDetails.linkedin}` });
    if (newLinks.length > 0) updateSet.links = newLinks;
  }

  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    {
      $set: updateSet,
      $setOnInsert: { user: req.user._id },
    },
    { upsert: true, new: true, returnDocument: "after" }
  );

  console.log(`[Resume] Profile updated for user ${req.user._id}`);
  console.log(`[Resume] Skills saved: ${profile.contributor?.extractedSkills?.length || 0}`);
  console.log(`[Resume] Experience entries: ${profile.contributor?.experience?.length || 0}`);

  res.status(201).json({ success: true, resume, profile });
}

export async function getMyResumes(req, res) {
  const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: resumes.length, resumes });
}

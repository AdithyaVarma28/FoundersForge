import { queryGroq } from "../groq_handler.js";

// ─── JSON Utilities ─────────────────────────────────────────────────────────

/**
 * Robustly extracts a JSON object from any LLM response string.
 * Handles markdown fences, trailing garbage, partial objects.
 */
function extractJsonObject(raw) {
  if (!raw || typeof raw !== "string") return null;

  // Strip markdown code fences (```json ... ```)
  let text = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

  // Find the first { and last } to extract the JSON block
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    console.error("[AI] extractJsonObject: No JSON object boundaries found in response.");
    return null;
  }

  const jsonStr = text.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("[AI] extractJsonObject: JSON.parse failed:", e.message);
    console.error("[AI] Attempted to parse:", jsonStr.slice(0, 500));
    return null;
  }
}

function ensureArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((v) => v.trim()).filter(Boolean);
  return [];
}

// ─── Project Structuring ─────────────────────────────────────────────────────

function localProjectFallback(rawIdea) {
  const sentences = String(rawIdea)
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const skillRegex =
    /\b(react|node|express|mongodb|python|ai|ml|machine learning|nlp|design|figma|flutter|android|ios|aws|devops|blockchain|data|analytics|sql|postgresql|docker|kubernetes|java|c\+\+|c#|typescript|javascript|vue|angular|svelte|nextjs|nestjs|graphql|firebase|supabase|django|fastapi|spring|redis|kafka|elasticsearch)\b/gi;
  const skillMatches = [...new Set((rawIdea.match(skillRegex) || []).map((s) => s.toLowerCase()))];

  const title = sentences[0]?.slice(0, 80) || "Untitled FoundersForge Project";

  return {
    title,
    tagline: `A startup project: ${title}`,
    summary: sentences.slice(0, 2).join(". "),
    problem: sentences[0] || rawIdea,
    solution: sentences[1] || "Build a focused product to solve this problem.",
    targetAudience: "General users",
    objectives: sentences.slice(2, 6),
    requiredSkills: skillMatches.slice(0, 10),
    rolesNeeded: ["Full-Stack Developer", "Product Manager"],
    revenueModel: "To be defined",
    provider: "local",
    originalResponse: null,
  };
}

function normalizeProject(rawIdea, ai, provider, originalResponse) {
  const fb = localProjectFallback(rawIdea);
  return {
    title: ai?.title || fb.title,
    tagline: ai?.tagline || fb.tagline,
    summary: ai?.summary || ai?.descriptionSummary || fb.summary,
    problem: ai?.problem || ai?.problemStatement || fb.problem,
    solution: ai?.solution || ai?.proposedSolution || fb.solution,
    targetAudience: ai?.targetAudience || ai?.audience || fb.targetAudience,
    objectives: ensureArray(ai?.objectives || fb.objectives),
    requiredSkills: ensureArray(ai?.requiredSkills || ai?.skills || fb.requiredSkills),
    rolesNeeded: ensureArray(ai?.rolesNeeded || ai?.requiredRoles || ai?.roles || fb.rolesNeeded),
    revenueModel: ai?.revenueModel || ai?.businessModel || fb.revenueModel,
    provider,
    originalResponse,
  };
}

export async function structureProjectIdea(rawIdea) {
  const prompt = `You are FoundersForge's AI project analyst. Transform the raw founder idea below into a structured startup brief.

OUTPUT ONLY a single valid JSON object. No extra text, no markdown, no explanation.

Required JSON keys and types:
{
  "title": "string — catchy, memorable project name (4-8 words max)",
  "tagline": "string — one-sentence elevator pitch under 140 chars",
  "summary": "string — 3-4 sentence overview of the project",
  "problem": "string — specific problem being solved",
  "solution": "string — how the product solves this problem",
  "targetAudience": "string — who will use this product",
  "objectives": ["array of 3-5 concrete milestones or goals"],
  "requiredSkills": ["array of 6-12 technical/non-technical skills required"],
  "rolesNeeded": ["array of 3-6 job roles to recruit (e.g. Backend Developer, UX Designer)"],
  "revenueModel": "string — how the business will make money"
}

RULES:
- If skills are not mentioned, infer them intelligently from the domain (e.g. fintech → Stripe API, Node.js, SQL).
- Title must be creative, NOT just the first sentence.
- requiredSkills MUST include at least 5 items.
- rolesNeeded MUST include at least 3 roles.
- All array fields must be arrays of strings, never a single string.

RAW FOUNDER IDEA:
${rawIdea}`;

  console.log("\n========== [AI] structureProjectIdea ==========");
  console.log("[AI] Raw idea:", rawIdea.slice(0, 200));
  console.log("[AI] Sending to LLM...");

  try {
    const response = await queryGroq(prompt, { temperature: 0.4, maxTokens: 1500 });

    console.log("\n[AI] === RAW LLM RESPONSE (Project Structuring) ===");
    console.log(response);
    console.log("[AI] === END OF RAW RESPONSE ===\n");

    const parsed = extractJsonObject(response);

    if (!parsed || !parsed.title) {
      throw new Error("LLM returned invalid or empty JSON for project structuring");
    }

    console.log("[AI] === PARSED PROJECT JSON ===");
    console.log(JSON.stringify(parsed, null, 2));
    console.log("[AI] === END PARSED JSON ===\n");

    return normalizeProject(rawIdea, parsed, "groq", response);
  } catch (error) {
    console.error("[AI] structureProjectIdea FAILED:", error.message);
    console.warn("[AI] Falling back to local regex-based structuring.");
    return normalizeProject(rawIdea, null, "local", null);
  }
}

// ─── Resume Parsing ──────────────────────────────────────────────────────────

function localResumeFallback(text) {
  const skillRegex =
    /\b(javascript|typescript|react|node|express|mongodb|sql|postgresql|python|java|c\+\+|c#|html|css|figma|aws|azure|gcp|docker|kubernetes|git|machine learning|nlp|data analysis|flutter|react native|swift|kotlin|go|rust|ruby|django|fastapi|spring boot|redis|kafka|elasticsearch|graphql|rest api|ci\/cd|agile|scrum)\b/gi;
  const skillMatches = [...new Set((text.match(skillRegex) || []).map((s) => s.toLowerCase()))];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  return {
    skills: skillMatches,
    technologies: skillMatches,
    experience: lines
      .filter((l) => /\b(intern|developer|engineer|designer|analyst|manager|lead|architect)\b/i.test(l))
      .slice(0, 5)
      .map((l) => ({ title: l.slice(0, 80), company: "Extracted", duration: "", summary: l })),
    education: lines
      .filter((l) => /\b(university|college|b\.?tech|degree|school|bachelor|master|phd|b\.e\.|m\.e\.)\b/i.test(l))
      .slice(0, 3)
      .map((l) => ({ institution: l.slice(0, 100), degree: "Degree", year: "" })),
    certifications: [],
    personalDetails: {
      bio: "Experienced professional with skills in technology and development.",
      location: "",
      phone: "",
      github: "",
      linkedin: "",
    },
  };
}

function normalizeResume(text, ai) {
  const fb = localResumeFallback(text);
  return {
    skills: ensureArray(ai?.skills?.length ? ai.skills : fb.skills),
    technologies: ensureArray(ai?.technologies?.length ? ai.technologies : ai?.tools?.length ? ai.tools : fb.technologies),
    experience: Array.isArray(ai?.experience) && ai.experience.length ? ai.experience : fb.experience,
    education: Array.isArray(ai?.education) && ai.education.length ? ai.education : fb.education,
    certifications: Array.isArray(ai?.certifications) ? ai.certifications : fb.certifications,
    personalDetails: ai?.personalDetails || fb.personalDetails,
  };
}

export async function parseResumeText(text) {
  const truncated = text.slice(0, 12000);

  const prompt = `You are FoundersForge's AI resume parser. Extract structured data from the resume text below.

OUTPUT ONLY a single valid JSON object. No extra text, no markdown, no explanation.

Required JSON structure:
{
  "skills": ["array of ALL hard and soft skills mentioned or clearly implied (e.g. Leadership, React, SQL)"],
  "technologies": ["array of tools, frameworks, platforms, and languages used"],
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "e.g. Jan 2022 - Dec 2023 or 2 years",
      "summary": "1-2 sentence summary of responsibilities and impact"
    }
  ],
  "education": [
    {
      "institution": "University or college name",
      "degree": "Degree and field (e.g. B.Tech Computer Science)",
      "year": "Graduation year or expected year"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "year": "Year obtained"
    }
  ],
  "personalDetails": {
    "bio": "A 2-3 sentence professional summary of this person based on the resume",
    "location": "City, Country if found",
    "phone": "Phone number if found",
    "github": "GitHub URL or username if found",
    "linkedin": "LinkedIn URL or username if found"
  }
}

RULES:
- skills must have at least 5 items if the resume is non-empty.
- technologies must list frameworks and tools separately from skills.
- If a field is not found, use an empty string "" or empty array [].
- Never omit required keys.

RESUME TEXT:
${truncated}`;

  console.log("\n========== [AI] parseResumeText ==========");
  console.log(`[AI] Resume text length: ${text.length} chars (using first ${truncated.length})`);
  console.log("[AI] Resume preview (first 500 chars):");
  console.log(text.slice(0, 500));
  console.log("[AI] Sending to LLM...");

  try {
    const response = await queryGroq(prompt, { temperature: 0.2, maxTokens: 2000 });

    console.log("\n[AI] === RAW LLM RESPONSE (Resume Parse) ===");
    console.log(response);
    console.log("[AI] === END OF RAW RESPONSE ===\n");

    const parsed = extractJsonObject(response);

    if (!parsed) {
      throw new Error("LLM returned no parseable JSON for resume");
    }

    if (!parsed.skills || !Array.isArray(parsed.skills)) {
      throw new Error("Resume JSON missing 'skills' array");
    }

    console.log("[AI] === PARSED RESUME JSON ===");
    console.log(JSON.stringify(parsed, null, 2));
    console.log("[AI] === END PARSED JSON ===\n");

    console.log(`[AI] Extracted: ${parsed.skills.length} skills, ${parsed.technologies?.length || 0} technologies, ${parsed.experience?.length || 0} experience entries, ${parsed.education?.length || 0} education entries`);

    return normalizeResume(text, parsed);
  } catch (error) {
    console.error("[AI] parseResumeText FAILED:", error.message);
    console.warn("[AI] Falling back to local regex-based resume parsing.");
    return normalizeResume(text, null);
  }
}

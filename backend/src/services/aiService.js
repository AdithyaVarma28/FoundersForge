import { queryGroq } from "../groq_handler.js";

function parseJsonObject(value) {
  // Try to find markdown json block first
  const match = value.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonString = match ? match[1] : value;
  
  const firstBrace = jsonString.indexOf("{");
  const lastBrace = jsonString.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    return null;
  }

  try {
    return JSON.parse(jsonString.slice(firstBrace, lastBrace + 1));
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return null;
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
}

function localProjectStructure(rawIdea) {
  const sentences = String(rawIdea)
    .split(/[.!?\n]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const title = sentences[0]?.slice(0, 80) || "Untitled FoundersForge Project";
  const skillRegex = /\b(react|node|express|mongodb|python|ai|ml|machine learning|nlp|design|figma|flutter|android|ios|aws|devops|blockchain|data|analytics|sql|postgresql|docker|kubernetes|java|c\+\+|c#|typescript|javascript|vue|angular|svelte|nextjs|nestjs|graphql)\b/gi;
  const skillMatches = rawIdea.match(skillRegex) || [];

  return {
    title,
    summary: sentences.slice(0, 2).join(". "),
    problem: sentences[0] || rawIdea,
    solution: sentences[1] || "Build a focused product team to validate and implement the idea.",
    objectives: sentences.slice(2, 6),
    requiredSkills: unique(skillMatches).slice(0, 12),
    rolesNeeded: ["Contributor", "Product Builder"],
    provider: "local",
    originalResponse: null,
  };
}

function normalizeProjectStructure(rawIdea, structured, provider, originalResponse = null) {
  const fallback = localProjectStructure(rawIdea);

  return {
    title: structured?.title || fallback.title,
    summary: structured?.summary || structured?.descriptionSummary || fallback.summary,
    problem: structured?.problem || structured?.problemDescription || fallback.problem,
    solution: structured?.solution || fallback.solution,
    objectives: unique(structured?.objectives || fallback.objectives),
    requiredSkills: unique(structured?.requiredSkills || structured?.skills || fallback.requiredSkills),
    rolesNeeded: unique(structured?.rolesNeeded || structured?.requiredRoles || structured?.roles || fallback.rolesNeeded),
    provider,
    originalResponse,
  };
}

export async function structureProjectIdea(rawIdea) {
  const prompt = [
    "You are the FoundersForge backend LLM service. Your ONLY job is to output a single, valid JSON object without any conversational text or formatting outside of the JSON block.",
    "Convert the raw founder idea into strict JSON with these exact keys: title, summary, problem, solution, objectives, requiredSkills, rolesNeeded.",
    "Rules:",
    "- objectives, requiredSkills, and rolesNeeded MUST be arrays of strings.",
    "- If skills are not explicitly mentioned, intelligently infer the required skills (e.g. if they mention an iOS app, include 'Swift' or 'React Native').",
    "- Output ONLY raw JSON.",
    `Raw idea: ${rawIdea}`,
  ].join("\n");

  try {
    const response = await queryGroq(prompt);
    const parsed = parseJsonObject(response);
    if (!parsed) throw new Error("Invalid JSON");
    return normalizeProjectStructure(rawIdea, parsed, "groq", response);
  } catch (error) {
    console.error("LLM Project Structuring Failed:", error);
    return normalizeProjectStructure(rawIdea, null, "local", null);
  }
}

function localResumeParse(text) {
  const skillRegex = /\b(javascript|typescript|react|node|express|mongodb|sql|postgresql|python|java|c\+\+|c#|html|css|figma|aws|azure|gcp|docker|kubernetes|git|machine learning|nlp|data analysis|flutter|react native|swift|kotlin|go|rust|ruby)\b/gi;
  const skillMatches = text.match(skillRegex) || [];
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    skills: unique(skillMatches),
    technologies: unique(skillMatches),
    experience: lines
      .filter((line) => /\b(intern|developer|engineer|designer|analyst|experience|manager|lead)\b/i.test(line))
      .slice(0, 5)
      .map((line) => ({ title: line, company: "Extracted Experience", duration: "", summary: line })),
    education: lines
      .filter((line) => /\b(university|college|b\.?tech|degree|school|education|bachelor|master|phd)\b/i.test(line))
      .slice(0, 5)
      .map((line) => ({ institution: line, degree: "Extracted Degree", year: "" })),
    certifications: [],
    personalDetails: { bio: "Extracted via regex fallback.", location: "", phone: "", github: "", linkedin: "" }
  };
}

function normalizeResumeParse(text, parsed) {
  const fallback = localResumeParse(text);

  return {
    skills: unique(parsed?.skills?.length ? parsed.skills : fallback.skills),
    technologies: unique(parsed?.technologies?.length ? parsed.technologies : parsed?.tools?.length ? parsed.tools : fallback.technologies),
    experience: Array.isArray(parsed?.experience) && parsed.experience.length ? parsed.experience : fallback.experience,
    education: Array.isArray(parsed?.education) && parsed.education.length ? parsed.education : fallback.education,
    certifications: Array.isArray(parsed?.certifications) ? parsed.certifications : fallback.certifications,
    personalDetails: parsed?.personalDetails || fallback.personalDetails
  };
}

export async function parseResumeText(text) {
  const prompt = [
    "You are the FoundersForge AI resume parser. Your ONLY job is to output a single, valid JSON object without any conversational text or formatting outside of the JSON block.",
    "Extract the contributor resume data as strict JSON with exactly these keys: skills, technologies, experience, education, certifications, personalDetails.",
    "Rules:",
    "- 'skills' and 'technologies' MUST be arrays of strings. Extract as many explicit and implicit skills/technologies as possible from the text.",
    "- 'experience' items MUST include: title, company, duration, summary.",
    "- 'education' items MUST include: institution, degree, year.",
    "- 'certifications' items MUST include: name, issuer, year.",
    "- 'personalDetails' MUST be an object with keys: bio (a 2 sentence summary of the person), location, phone, github, linkedin.",
    "- Output ONLY raw JSON.",
    `Resume text: ${text.slice(0, 15000)}`,
  ].join("\n");

  try {
    const response = await queryGroq(prompt);
    const parsed = parseJsonObject(response);
    if (!parsed || !parsed.skills) throw new Error("Invalid Resume JSON");
    return normalizeResumeParse(text, parsed);
  } catch (error) {
    console.error("LLM Resume Parsing Failed:", error);
    return normalizeResumeParse(text, null);
  }
}

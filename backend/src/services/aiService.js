import { queryGroq } from "../groq_handler.js";

function parseJsonObject(value) {
  const firstBrace = value.indexOf("{");
  const lastBrace = value.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    return null;
  }

  try {
    return JSON.parse(value.slice(firstBrace, lastBrace + 1));
  } catch {
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
  const skillMatches = rawIdea.match(/\b(react|node|express|mongodb|python|ai|ml|machine learning|nlp|design|figma|flutter|android|ios|aws|devops|blockchain|data|analytics)\b/gi) || [];

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
    "You are the FoundersForge backend LLM service.",
    "Convert the raw founder idea into strict JSON with keys: title, summary, problem, solution, objectives, requiredSkills, rolesNeeded.",
    "Use arrays for objectives, requiredSkills, and rolesNeeded. Return only JSON.",
    `Raw idea: ${rawIdea}`,
  ].join("\n");

  try {
    const response = await queryGroq(prompt);
    const parsed = parseJsonObject(response);
    return normalizeProjectStructure(rawIdea, parsed, "groq", response);
  } catch {
    return normalizeProjectStructure(rawIdea, null, "local", null);
  }
}

function localResumeParse(text) {
  const skillMatches = text.match(/\b(javascript|typescript|react|node|express|mongodb|sql|python|java|c\+\+|html|css|figma|aws|docker|kubernetes|git|machine learning|nlp|data analysis|flutter)\b/gi) || [];
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    skills: unique(skillMatches),
    technologies: unique(skillMatches),
    experience: lines
      .filter((line) => /\b(intern|developer|engineer|designer|analyst|experience)\b/i.test(line))
      .slice(0, 5)
      .map((line) => ({ title: line, company: "", duration: "", summary: line })),
    education: lines
      .filter((line) => /\b(university|college|b\.?tech|degree|school|education)\b/i.test(line))
      .slice(0, 5)
      .map((line) => ({ institution: line, degree: "", year: "" })),
  };
}

function normalizeResumeParse(text, parsed) {
  const fallback = localResumeParse(text);

  return {
    skills: unique(parsed?.skills || fallback.skills),
    technologies: unique(parsed?.technologies || parsed?.tools || fallback.technologies),
    experience: Array.isArray(parsed?.experience) ? parsed.experience : fallback.experience,
    education: Array.isArray(parsed?.education) ? parsed.education : fallback.education,
  };
}

export async function parseResumeText(text) {
  const prompt = [
    "You are the FoundersForge resume parser.",
    "Extract contributor resume data as strict JSON with keys: skills, technologies, experience, education.",
    "experience items should include title, company, duration, summary. education items should include institution, degree, year.",
    "Return only JSON.",
    `Resume text: ${text.slice(0, 12000)}`,
  ].join("\n");

  try {
    const response = await queryGroq(prompt);
    return normalizeResumeParse(text, parseJsonObject(response));
  } catch {
    return normalizeResumeParse(text, null);
  }
}

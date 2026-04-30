/**
 * embeddingService.js
 * 
 * Term-frequency (TF) vectorizer for semantic similarity search.
 * Produces a 512-dimensional normalized vector from text.
 * Works without any external API — pure math.
 */

const VECTOR_DIM = 512;

// ─── Text Builders ────────────────────────────────────────────────────────────

/**
 * Builds a rich text document from a project for embedding.
 * Repeats title/skills to give them higher weight in the TF vector.
 */
export function projectEmbeddingText(project) {
  const title = project.title || "";
  const tagline = project.tagline || "";
  const summary = project.summary || "";
  const problem = project.problem || "";
  const solution = project.solution || "";
  const audience = project.targetAudience || "";
  const skills = Array.isArray(project.requiredSkills) ? project.requiredSkills.join(" ") : "";
  const roles = Array.isArray(project.rolesNeeded) ? project.rolesNeeded.join(" ") : "";
  const objectives = Array.isArray(project.objectives) ? project.objectives.join(" ") : "";

  // Repeat title and skills to boost their weight in TF vector
  return [
    title, title, title,         // high weight
    tagline, tagline,             // medium weight
    skills, skills,              // high weight — skills are key match drivers
    roles,
    summary,
    problem,
    solution,
    audience,
    objectives,
  ].join(" ").trim();
}

/**
 * Builds a text document from a parsed resume for embedding.
 */
export function resumeEmbeddingText(parsedResume, extractedText) {
  const skills = Array.isArray(parsedResume?.skills) ? parsedResume.skills.join(" ") : "";
  const tech = Array.isArray(parsedResume?.technologies) ? parsedResume.technologies.join(" ") : "";
  const experience = Array.isArray(parsedResume?.experience)
    ? parsedResume.experience.map((e) => `${e.title || ""} ${e.company || ""} ${e.summary || ""}`).join(" ")
    : "";
  const education = Array.isArray(parsedResume?.education)
    ? parsedResume.education.map((e) => `${e.institution || ""} ${e.degree || ""}`).join(" ")
    : "";
  const bio = parsedResume?.personalDetails?.bio || "";

  return [skills, skills, tech, experience, education, bio, extractedText?.slice(0, 800) || ""]
    .join(" ")
    .trim();
}

// ─── Embedding Generator ──────────────────────────────────────────────────────

/**
 * Generates a deterministic 512-dim L2-normalized TF vector.
 * Uses a FNV-1a-like hash to distribute words across dimensions.
 */
export function generateEmbedding(text) {
  const vec = new Array(VECTOR_DIM).fill(0);
  if (!text || typeof text !== "string") return vec;

  const words = text.toLowerCase().match(/\w+/g) || [];

  for (const word of words) {
    // FNV-1a-inspired hash for better distribution
    let hash = 2166136261;
    for (let i = 0; i < word.length; i++) {
      hash ^= word.charCodeAt(i);
      hash = (hash * 16777619) >>> 0; // unsigned 32-bit
    }
    const idx = hash % VECTOR_DIM;
    vec[idx] += 1;
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < VECTOR_DIM; i++) norm += vec[i] * vec[i];
  if (norm > 0) {
    const sqrtNorm = Math.sqrt(norm);
    for (let i = 0; i < VECTOR_DIM; i++) vec[i] /= sqrtNorm;
  }

  return vec;
}

// ─── Similarity ───────────────────────────────────────────────────────────────

export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

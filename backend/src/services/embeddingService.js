import crypto from "crypto";

const VECTOR_SIZE = Number(process.env.EMBEDDING_VECTOR_SIZE || 128);

function hashToken(token) {
  const digest = crypto.createHash("sha256").update(token).digest();
  return digest.readUInt32BE(0);
}

export function generateEmbedding(input = "") {
  const vector = Array.from({ length: VECTOR_SIZE }, () => 0);
  const tokens = String(input)
    .toLowerCase()
    .match(/[a-z0-9+#.-]+/g) || [];

  for (const token of tokens) {
    const hash = hashToken(token);
    const index = hash % VECTOR_SIZE;
    vector[index] += hash % 2 === 0 ? 1 : -1;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}

export function cosineSimilarity(a = [], b = []) {
  const length = Math.min(a.length, b.length);
  if (length === 0) {
    return 0;
  }

  let dot = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;

  for (let index = 0; index < length; index += 1) {
    dot += a[index] * b[index];
    aMagnitude += a[index] * a[index];
    bMagnitude += b[index] * b[index];
  }

  if (!aMagnitude || !bMagnitude) {
    return 0;
  }

  return dot / (Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude));
}

export function projectEmbeddingText(project) {
  return [
    project.title,
    project.summary,
    project.problem,
    project.solution,
    ...(project.objectives || []),
    ...(project.requiredSkills || []),
    ...(project.rolesNeeded || []),
  ]
    .filter(Boolean)
    .join(" ");
}

export function resumeEmbeddingText(parsed = {}, extractedText = "") {
  return [
    extractedText,
    ...(parsed.skills || []),
    ...(parsed.technologies || []),
    ...(parsed.experience || []).map((item) => [item.title, item.company, item.summary].filter(Boolean).join(" ")),
    ...(parsed.education || []).map((item) => [item.institution, item.degree].filter(Boolean).join(" ")),
  ]
    .filter(Boolean)
    .join(" ");
}

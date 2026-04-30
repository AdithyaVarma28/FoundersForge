export function generateProjectEmbeddingText(project) {
  const title = project.title || "";
  const summary = project.summary || "";
  const problem = project.problem || "";
  const solution = project.solution || "";
  const requiredSkills = Array.isArray(project.requiredSkills) ? project.requiredSkills.join(", ") : "";

  // Combine details into a single dense document string for vectorization
  return `Title: ${title}. Summary: ${summary}. Problem: ${problem}. Solution: ${solution}. Required Skills: ${requiredSkills}.`;
}

export function resumeEmbeddingText(parsedResume, extractedText) {
  const skills = Array.isArray(parsedResume?.skills) ? parsedResume.skills.join(", ") : "";
  const tech = Array.isArray(parsedResume?.technologies) ? parsedResume.technologies.join(", ") : "";
  const experience = Array.isArray(parsedResume?.experience) 
    ? parsedResume.experience.map(e => e.title + " at " + e.company).join(", ") 
    : "";

  return `Skills: ${skills}. Technologies: ${tech}. Experience: ${experience}. Raw Context: ${extractedText?.slice(0, 500) || ""}`;
}

export function generateEmbedding(text) {
  // If an actual vector database (like Pinecone) or embedding API (like OpenAI) is integrated,
  // this is where the call to create the embedding array would go.
  // For now, returning a mock vector of 1536 dimensions as a placeholder for a real vector search
  console.log(`Generated embedding for text snippet: "${text.substring(0, 50)}..."`);
  return Array.from({ length: 1536 }, () => Math.random() - 0.5);
}

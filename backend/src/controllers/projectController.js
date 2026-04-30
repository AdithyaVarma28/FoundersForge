import Project from "../models/Project.js";
import ChatRoom from "../models/ChatRoom.js";
import { PROJECT_STATUSES, USER_ROLES } from "../constants/enums.js";
import { ApiError } from "../utils/apiError.js";
import { isAdmin } from "../middleware/auth.js";
import { structureProjectIdea } from "../services/aiService.js";
import { cosineSimilarity, generateEmbedding, projectEmbeddingText } from "../services/embeddingService.js";

function canManageProject(user, project) {
  return Boolean(user) && (isAdmin(user) || String(project.founder) === String(user._id));
}

function projectPayloadFromBody(body) {
  const allowed = [
    "title", "tagline", "summary", "problem", "solution", "targetAudience",
    "objectives", "requiredSkills", "rolesNeeded", "revenueModel", "status", "fundingGoal",
  ];
  return allowed.reduce((payload, field) => {
    if (body[field] !== undefined) payload[field] = body[field];
    return payload;
  }, {});
}

export async function createProject(req, res) {
  const { rawIdea, fundingGoal, status } = req.body;

  if (!rawIdea || rawIdea.trim().length < 20) {
    throw new ApiError(400, "rawIdea must be at least 20 characters long");
  }

  console.log(`\n[Project] createProject called by user: ${req.user._id}`);
  const structured = await structureProjectIdea(rawIdea);

  console.log("[Project] AI structured result:", JSON.stringify({
    title: structured.title,
    provider: structured.provider,
    skillsCount: structured.requiredSkills?.length,
    rolesCount: structured.rolesNeeded?.length,
  }));

  const projectDraft = {
    founder: req.user._id,
    rawIdea,
    title: req.body.title || structured.title,
    tagline: req.body.tagline || structured.tagline,
    summary: req.body.summary || structured.summary,
    problem: req.body.problem || structured.problem,
    solution: req.body.solution || structured.solution,
    targetAudience: req.body.targetAudience || structured.targetAudience,
    objectives: req.body.objectives || structured.objectives,
    requiredSkills: req.body.requiredSkills || structured.requiredSkills,
    rolesNeeded: req.body.rolesNeeded || structured.rolesNeeded,
    revenueModel: req.body.revenueModel || structured.revenueModel,
    status: status || PROJECT_STATUSES.PUBLISHED,
    fundingGoal: fundingGoal || 0,
    structuredVersion: {
      provider: structured.provider,
      generatedAt: new Date(),
      originalResponse: structured.originalResponse,
    },
    members: [{ user: req.user._id, role: "founder" }],
  };

  const embText = projectEmbeddingText(projectDraft);
  console.log("[Project] Embedding text preview:", embText.slice(0, 200));
  projectDraft.embedding = generateEmbedding(embText);
  console.log(`[Project] Embedding generated: ${projectDraft.embedding.length}-dim vector`);

  const project = await Project.create(projectDraft);
  await ChatRoom.create({ project: project._id, members: [req.user._id] });

  console.log(`[Project] Created project: ${project._id} — "${project.title}"`);
  res.status(201).json({ success: true, project });
}

export async function listProjects(req, res) {
  const { status, skill, q, founder } = req.query;
  const filter = {};

  if (status) {
    filter.status = status;
  } else if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
    filter.status = PROJECT_STATUSES.PUBLISHED;
  }

  if (skill) {
    filter.requiredSkills = { $regex: skill, $options: "i" };
  }

  if (founder) {
    filter.founder = founder;
  }

  if (q) {
    filter.$text = { $search: q };
  }

  const projects = await Project.find(filter)
    .populate("founder", "fullName email role")
    .sort(q ? { score: { $meta: "textScore" } } : { createdAt: -1 })
    .limit(Number(req.query.limit || 50));

  res.json({ success: true, count: projects.length, projects });
}

export async function getProject(req, res) {
  const project = await Project.findById(req.params.projectId)
    .populate("founder", "fullName email role")
    .populate("members.user", "fullName email role");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.status !== PROJECT_STATUSES.PUBLISHED && !canManageProject(req.user, project)) {
    throw new ApiError(403, "You do not have access to this project");
  }

  res.json({ success: true, project });
}

export async function updateProject(req, res) {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!canManageProject(req.user, project)) {
    throw new ApiError(403, "Only the founder or admin can update this project");
  }

  Object.assign(project, projectPayloadFromBody(req.body));
  project.embedding = generateEmbedding(projectEmbeddingText(project));
  await project.save();

  res.json({ success: true, project });
}

export async function semanticSearchProjects(req, res) {
  const query = req.query.q || req.body?.query;

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  console.log(`\n[SemanticSearch] Query: "${query}"`);

  const queryEmbedding = generateEmbedding(query);
  console.log(`[SemanticSearch] Query embedding: ${queryEmbedding.length}-dim vector`);

  const candidateLimit = Number(req.query.candidateLimit || 200);
  const candidates = await Project.find({ status: PROJECT_STATUSES.PUBLISHED })
    .populate("founder", "fullName email role")
    .limit(candidateLimit);

  console.log(`[SemanticSearch] Fetched ${candidates.length} candidate projects from DB`);

  let recomputedCount = 0;
  const scored = candidates.map((project) => {
    let projEmb = project.embedding;

    // Recompute embedding if missing or wrong dimension (old 128 or 1536 or any non-512)
    if (!projEmb || projEmb.length !== 512) {
      projEmb = generateEmbedding(projectEmbeddingText(project));
      recomputedCount++;
    }

    const similarity = cosineSimilarity(queryEmbedding, projEmb);
    return { project, similarity };
  });

  if (recomputedCount > 0) {
    console.log(`[SemanticSearch] Recomputed embeddings for ${recomputedCount} projects (old/missing vectors)`);
  }

  const sorted = scored
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, Number(req.query.limit || 10));

  console.log("[SemanticSearch] Top results:");
  sorted.slice(0, 5).forEach(({ project, similarity }, i) => {
    console.log(`  [${i + 1}] "${project.title}" — similarity: ${similarity.toFixed(4)}`);
  });

  const projects = sorted.map(({ project, similarity }) => ({
    id: project._id,
    title: project.title,
    tagline: project.tagline,
    summary: project.summary,
    requiredSkills: project.requiredSkills,
    rolesNeeded: project.rolesNeeded,
    founder: project.founder,
    status: project.status,
    fundingGoal: project.fundingGoal,
    similarity: Number(similarity.toFixed(4)),
  }));

  res.json({ success: true, query, count: projects.length, projects });
}

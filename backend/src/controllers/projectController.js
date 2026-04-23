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
  const allowed = ["title", "summary", "problem", "solution", "objectives", "requiredSkills", "rolesNeeded", "status", "fundingGoal"];
  return allowed.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
    return payload;
  }, {});
}

export async function createProject(req, res) {
  const { rawIdea, fundingGoal, status } = req.body;

  if (!rawIdea || rawIdea.trim().length < 20) {
    throw new ApiError(400, "rawIdea must be at least 20 characters long");
  }

  const structured = await structureProjectIdea(rawIdea);
  const projectDraft = {
    founder: req.user._id,
    rawIdea,
    title: req.body.title || structured.title,
    summary: req.body.summary || structured.summary,
    problem: req.body.problem || structured.problem,
    solution: req.body.solution || structured.solution,
    objectives: req.body.objectives || structured.objectives,
    requiredSkills: req.body.requiredSkills || structured.requiredSkills,
    rolesNeeded: req.body.rolesNeeded || structured.rolesNeeded,
    status: status || PROJECT_STATUSES.PUBLISHED,
    fundingGoal: fundingGoal || 0,
    structuredVersion: {
      provider: structured.provider,
      generatedAt: new Date(),
      originalResponse: structured.originalResponse,
    },
    members: [{ user: req.user._id, role: "founder" }],
  };

  projectDraft.embedding = generateEmbedding(projectEmbeddingText(projectDraft));
  const project = await Project.create(projectDraft);
  await ChatRoom.create({ project: project._id, members: [req.user._id] });

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

  const queryEmbedding = generateEmbedding(query);
  const candidates = await Project.find({ status: PROJECT_STATUSES.PUBLISHED })
    .populate("founder", "fullName email role")
    .limit(Number(req.query.candidateLimit || 200));

  const projects = candidates
    .map((project) => ({
      project,
      similarity: cosineSimilarity(queryEmbedding, project.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, Number(req.query.limit || 10))
    .map(({ project, similarity }) => ({
      id: project._id,
      title: project.title,
      summary: project.summary,
      requiredSkills: project.requiredSkills,
      founder: project.founder,
      similarity: Number(similarity.toFixed(4)),
    }));

  res.json({ success: true, query, count: projects.length, projects });
}

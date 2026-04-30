import Application from "../models/Application.js";
import Project from "../models/Project.js";
import ChatRoom from "../models/ChatRoom.js";
import { APPLICATION_STATUSES, MEMBERSHIP_ROLES } from "../constants/enums.js";
import { ApiError } from "../utils/apiError.js";
import { isAdmin } from "../middleware/auth.js";

function canReview(user, project) {
  return isAdmin(user) || String(project.founder) === String(user._id);
}

async function addContributorToProject(project, contributorId) {
  if (!project.members.some((member) => String(member.user) === String(contributorId))) {
    project.members.push({ user: contributorId, role: MEMBERSHIP_ROLES.CONTRIBUTOR });
    await project.save();
  }

  await ChatRoom.findOneAndUpdate(
    { project: project._id },
    { $addToSet: { members: contributorId }, $setOnInsert: { project: project._id } },
    { upsert: true, new: true }
  );
}

export async function applyToProject(req, res) {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (String(project.founder) === String(req.user._id)) {
    throw new ApiError(400, "Founders cannot apply to their own projects");
  }

  const existingApplication = await Application.findOne({
    project: project._id,
    contributor: req.user._id,
  });

  if (existingApplication && existingApplication.status !== APPLICATION_STATUSES.WITHDRAWN) {
    throw new ApiError(409, "You have already applied to this project");
  }

  const application = existingApplication || new Application({ project: project._id, contributor: req.user._id });
  application.message = req.body.message || application.message;
  application.status = APPLICATION_STATUSES.PENDING;
  application.reviewedBy = undefined;
  application.reviewedAt = undefined;
  application.reviewNote = undefined;
  await application.save();

  res.status(existingApplication ? 200 : 201).json({ success: true, application });
}

export async function listProjectApplications(req, res) {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!canReview(req.user, project)) {
    throw new ApiError(403, "Only the founder or admin can review applications");
  }

  const applications = await Application.find({ project: project._id })
    .populate("contributor", "fullName email role")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: applications.length, applications });
}

export async function reviewApplication(req, res) {
  const { status, reviewNote } = req.body;

  if (![APPLICATION_STATUSES.ACCEPTED, APPLICATION_STATUSES.REJECTED].includes(status)) {
    throw new ApiError(400, "status must be accepted or rejected");
  }

  const application = await Application.findById(req.params.applicationId);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const project = await Project.findById(application.project);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!canReview(req.user, project)) {
    throw new ApiError(403, "Only the founder or admin can review applications");
  }

  application.status = status;
  application.reviewedBy = req.user._id;
  application.reviewedAt = new Date();
  application.reviewNote = reviewNote;
  await application.save();

  if (status === APPLICATION_STATUSES.ACCEPTED) {
    await addContributorToProject(project, application.contributor);
  }

  res.json({ success: true, application });
}

export async function listMyApplications(req, res) {
  const applications = await Application.find({ contributor: req.user._id })
    .populate("project", "title summary status requiredSkills founder")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: applications.length, applications });
}

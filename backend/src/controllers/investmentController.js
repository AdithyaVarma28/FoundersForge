import Investment from "../models/Investment.js";
import Project from "../models/Project.js";
import Profile from "../models/Profile.js";
import ChatRoom from "../models/ChatRoom.js";
import { MEMBERSHIP_ROLES } from "../constants/enums.js";
import { ApiError } from "../utils/apiError.js";

export async function createInvestment(req, res) {
  const { amount, currency, transactionDate, notes } = req.body;

  if (!amount || Number(amount) <= 0) {
    throw new ApiError(400, "amount must be greater than zero");
  }

  const project = await Project.findById(req.params.projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const investment = await Investment.create({
    investor: req.user._id,
    project: project._id,
    amount,
    currency,
    transactionDate,
    notes,
  });

  project.fundingRaised += Number(amount);
  if (!project.members.some((member) => String(member.user) === String(req.user._id))) {
    project.members.push({ user: req.user._id, role: MEMBERSHIP_ROLES.INVESTOR });
  }
  await project.save();

  await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $addToSet: { "investor.supportedProjects": project._id }, $setOnInsert: { user: req.user._id } },
    { upsert: true, new: true }
  );

  await ChatRoom.findOneAndUpdate(
    { project: project._id },
    { $addToSet: { members: req.user._id }, $setOnInsert: { project: project._id } },
    { upsert: true }
  );

  res.status(201).json({ success: true, investment, project });
}

export async function listMyInvestments(req, res) {
  const investments = await Investment.find({ investor: req.user._id })
    .populate("project", "title summary founder fundingGoal fundingRaised")
    .sort({ transactionDate: -1 });

  res.json({ success: true, count: investments.length, investments });
}

export async function listProjectInvestments(req, res) {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (String(project.founder) !== String(req.user._id) && req.user.role !== "admin") {
    throw new ApiError(403, "Only the founder or admin can view project investments");
  }

  const investments = await Investment.find({ project: project._id })
    .populate("investor", "fullName email role")
    .sort({ transactionDate: -1 });

  res.json({ success: true, count: investments.length, investments });
}

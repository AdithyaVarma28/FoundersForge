import Investment from "../models/Investment.js";
import Project from "../models/Project.js";
import Application from "../models/Application.js";
import { APPLICATION_STATUSES } from "../constants/enums.js";

export async function founderDashboard(req, res) {
  const projects = await Project.find({ founder: req.user._id }).sort({ createdAt: -1 });
  const projectIds = projects.map((project) => project._id);
  const investments = await Investment.find({ project: { $in: projectIds } })
    .populate("investor", "fullName email")
    .populate("project", "title")
    .sort({ transactionDate: -1 });
  const applications = await Application.find({ project: { $in: projectIds } })
    .populate("contributor", "fullName email")
    .populate("project", "title")
    .sort({ createdAt: -1 });

  const totalFundsReceived = investments.reduce((sum, investment) => sum + investment.amount, 0);

  res.json({
    success: true,
    dashboard: {
      totalProjects: projects.length,
      totalFundsReceived,
      activeApplications: applications.filter((item) => item.status === APPLICATION_STATUSES.PENDING).length,
      projects,
      investments,
      applications,
    },
  });
}

export async function investorDashboard(req, res) {
  const investments = await Investment.find({ investor: req.user._id })
    .populate("project", "title summary founder fundingGoal fundingRaised")
    .sort({ transactionDate: -1 });
  const totalInvested = investments.reduce((sum, investment) => sum + investment.amount, 0);
  const fundedProjectIds = [...new Set(investments.map((investment) => String(investment.project?._id)).filter(Boolean))];

  res.json({
    success: true,
    dashboard: {
      totalInvested,
      fundedProjectsCount: fundedProjectIds.length,
      investments,
    },
  });
}

export async function contributorDashboard(req, res) {
  const applications = await Application.find({ contributor: req.user._id })
    .populate("project", "title summary requiredSkills status founder")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    dashboard: {
      totalApplications: applications.length,
      acceptedApplications: applications.filter((item) => item.status === APPLICATION_STATUSES.ACCEPTED).length,
      pendingApplications: applications.filter((item) => item.status === APPLICATION_STATUSES.PENDING).length,
      applications,
    },
  });
}

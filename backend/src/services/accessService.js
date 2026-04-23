import Application from "../models/Application.js";
import Investment from "../models/Investment.js";
import Project from "../models/Project.js";
import { APPLICATION_STATUSES, USER_ROLES } from "../constants/enums.js";

export async function canAccessProjectChat(user, projectId) {
  if (!user) {
    return false;
  }

  if (user.role === USER_ROLES.ADMIN) {
    return true;
  }

  const project = await Project.findById(projectId).select("founder members");

  if (!project) {
    return false;
  }

  if (String(project.founder) === String(user._id)) {
    return true;
  }

  if (project.members.some((member) => String(member.user) === String(user._id))) {
    return true;
  }

  const acceptedApplication = await Application.exists({
    project: projectId,
    contributor: user._id,
    status: APPLICATION_STATUSES.ACCEPTED,
  });

  if (acceptedApplication) {
    return true;
  }

  return Boolean(await Investment.exists({ project: projectId, investor: user._id }));
}

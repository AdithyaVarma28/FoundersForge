import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";
import Project from "../models/Project.js";
import { ApiError } from "../utils/apiError.js";
import { canAccessProjectChat } from "../services/accessService.js";

async function getOrCreateRoom(projectId, userId) {
  return ChatRoom.findOneAndUpdate(
    { project: projectId },
    { $addToSet: { members: userId }, $setOnInsert: { project: projectId } },
    { upsert: true, new: true }
  );
}

export async function getProjectMessages(req, res) {
  const allowed = await canAccessProjectChat(req.user, req.params.projectId);

  if (!allowed) {
    throw new ApiError(403, "You do not have access to this project chat");
  }

  const room = await getOrCreateRoom(req.params.projectId, req.user._id);
  const messages = await Message.find({ room: room._id })
    .populate("sender", "fullName email role")
    .sort({ createdAt: -1 })
    .limit(Number(req.query.limit || 50));

  res.json({ success: true, room, messages: messages.reverse() });
}

export async function sendProjectMessage(req, res) {
  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Message content is required");
  }

  const project = await Project.findById(req.params.projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const allowed = await canAccessProjectChat(req.user, project._id);

  if (!allowed) {
    throw new ApiError(403, "You do not have access to this project chat");
  }

  const room = await getOrCreateRoom(project._id, req.user._id);
  const message = await Message.create({
    room: room._id,
    project: project._id,
    sender: req.user._id,
    content,
  });

  await message.populate("sender", "fullName email role");

  res.status(201).json({ success: true, message });
}

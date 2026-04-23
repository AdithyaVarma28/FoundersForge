import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import User from "../models/User.js";
import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";
import Project from "../models/Project.js";
import { canAccessProjectChat } from "../services/accessService.js";

async function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new Error("Authentication token is required");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "foundersforge-dev-secret");
    const user = await User.findById(payload.sub);

    if (!user) {
      throw new Error("User not found");
    }

    socket.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

async function getOrCreateRoom(projectId, userId) {
  return ChatRoom.findOneAndUpdate(
    { project: projectId },
    { $addToSet: { members: userId }, $setOnInsert: { project: projectId } },
    { upsert: true, new: true }
  );
}

export function attachChatSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    socket.on("project:join", async ({ projectId }, callback) => {
      try {
        const allowed = await canAccessProjectChat(socket.user, projectId);

        if (!allowed) {
          throw new Error("You do not have access to this project chat");
        }

        const room = await getOrCreateRoom(projectId, socket.user._id);
        socket.join(String(room._id));
        callback?.({ success: true, roomId: String(room._id) });
      } catch (error) {
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on("project:message", async ({ projectId, content }, callback) => {
      try {
        if (!content || !content.trim()) {
          throw new Error("Message content is required");
        }

        const [project, allowed] = await Promise.all([
          Project.findById(projectId),
          canAccessProjectChat(socket.user, projectId),
        ]);

        if (!project) {
          throw new Error("Project not found");
        }

        if (!allowed) {
          throw new Error("You do not have access to this project chat");
        }

        const room = await getOrCreateRoom(project._id, socket.user._id);
        const message = await Message.create({
          room: room._id,
          project: project._id,
          sender: socket.user._id,
          content,
        });

        await message.populate("sender", "fullName email role");
        io.to(String(room._id)).emit("project:message", message);
        callback?.({ success: true, message });
      } catch (error) {
        callback?.({ success: false, message: error.message });
      }
    });
  });

  return io;
}

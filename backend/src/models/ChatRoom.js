import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

chatRoomSchema.index({ project: 1 }, { unique: true });

export default mongoose.models.ChatRoom || mongoose.model("ChatRoom", chatRoomSchema);

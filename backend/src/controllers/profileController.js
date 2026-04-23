import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { isAdmin } from "../middleware/auth.js";

const allowedProfileFields = ["headline", "bio", "avatarUrl", "location", "links", "founder", "contributor", "investor"];

function sanitizeProfilePayload(body) {
  return allowedProfileFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
    return payload;
  }, {});
}

export async function getMyProfile(req, res) {
  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id } },
    { upsert: true, new: true }
  ).populate("user", "fullName email role status");

  res.json({ success: true, profile });
}

export async function updateMyProfile(req, res) {
  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $set: sanitizeProfilePayload(req.body), $setOnInsert: { user: req.user._id } },
    { upsert: true, new: true, runValidators: true }
  ).populate("user", "fullName email role status");

  res.json({ success: true, profile });
}

export async function getProfileByUserId(req, res) {
  const user = await User.findById(req.params.userId).select("fullName email role status");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!isAdmin(req.user) && user.status !== "active") {
    throw new ApiError(404, "User not found");
  }

  const profile = await Profile.findOne({ user: req.params.userId }).populate("user", "fullName email role status");
  res.json({ success: true, profile });
}

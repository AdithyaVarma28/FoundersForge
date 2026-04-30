import path from "path";
import multer from "multer";
import { ApiError } from "../utils/apiError.js";

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
]);

const storage = multer.diskStorage({
  destination: "uploads/resumes",
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_RESUME_UPLOAD_BYTES || 5 * 1024 * 1024),
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedExtension = [".pdf", ".doc", ".docx", ".txt"].includes(extension);

    if (!allowedMimeTypes.has(file.mimetype) && !allowedExtension) {
      cb(new ApiError(400, "Resume must be a PDF, DOC, DOCX, or TXT file"));
      return;
    }

    cb(null, true);
  },
});

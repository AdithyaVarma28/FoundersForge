import fs from "fs/promises";
import path from "path";

function decodeDocxLikeBuffer(buffer) {
  return buffer
    .toString("utf8")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractTextFromResume(file) {
  if (!file) {
    return "";
  }

  const buffer = await fs.readFile(file.path);
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension === ".txt" || file.mimetype === "text/plain") {
    return buffer.toString("utf8");
  }

  // This lightweight fallback keeps PDF/DOCX uploads reviewable without adding
  // heavyweight parsers; the AI layer can be swapped for richer extraction later.
  return decodeDocxLikeBuffer(buffer);
}

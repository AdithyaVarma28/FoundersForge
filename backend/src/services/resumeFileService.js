import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

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

  if (extension === ".pdf" || file.mimetype === "application/pdf") {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (err) {
      console.error("PDF parsing failed", err);
      return decodeDocxLikeBuffer(buffer);
    }
  }

  return decodeDocxLikeBuffer(buffer);
}

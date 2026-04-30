import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { fromPath } from "pdf2pic";
import Tesseract from "tesseract.js";

function decodeDocxLikeBuffer(buffer) {
  return buffer
    .toString("utf8")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function performOcrOnPdf(filePath) {
  try {
    const options = {
      density: 300,
      saveFilename: "ocr_page",
      savePath: path.dirname(filePath),
      format: "png",
      width: 2550,
      height: 3300
    };
    const storeAsImage = fromPath(filePath, options);
    
    const pageToConvertAsImage = 1;
    const resolved = await storeAsImage(pageToConvertAsImage);
    
    if (resolved && resolved.path) {
      const ocrResult = await Tesseract.recognize(resolved.path, 'eng');
      await fs.unlink(resolved.path).catch(() => {});
      return ocrResult.data.text;
    }
    return "";
  } catch (error) {
    console.error("OCR Failed (Ghostscript might be missing):", error.message);
    return "";
  }
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
      if (data.text.trim().length < 50) {
        console.warn("PDF text too short, might be scanned. Attempting OCR...");
        const ocrText = await performOcrOnPdf(file.path);
        if (ocrText && ocrText.trim().length > 50) {
          return ocrText;
        }
      }
      return data.text;
    } catch (err) {
      console.error("PDF parsing failed", err);
      const ocrText = await performOcrOnPdf(file.path);
      if (ocrText) return ocrText;
      return decodeDocxLikeBuffer(buffer);
    }
  }

  return decodeDocxLikeBuffer(buffer);
}

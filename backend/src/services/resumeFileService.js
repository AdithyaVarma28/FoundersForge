import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// ─── PDF Text Extraction ──────────────────────────────────────────────────────

/**
 * Method 1: pdfjs-dist — pure JS, no native deps, most reliable for modern PDFs.
 * Reads each page and concatenates text content with proper spacing.
 */
async function extractWithPdfJs(buffer) {
  try {
    // pdfjs-dist v4+ ESM — load via dynamic import
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs").catch(() => null)
      || await import("pdfjs-dist").catch(() => null);

    if (!pdfjsLib) throw new Error("pdfjs-dist not available");

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;

    console.log(`[PDF] pdfjs-dist: ${pdf.numPages} page(s) found`);

    let fullText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      // Reconstruct text with smart spacing
      let lastY = null;
      let pageText = "";
      for (const item of content.items) {
        if ("str" in item) {
          const y = item.transform?.[5];
          if (lastY !== null && Math.abs(y - lastY) > 5) {
            pageText += "\n";
          } else if (pageText.length > 0 && !pageText.endsWith(" ") && item.str && !item.str.startsWith(" ")) {
            pageText += " ";
          }
          pageText += item.str;
          lastY = y;
        }
      }
      fullText += pageText + "\n\n";
    }

    const cleaned = fullText.replace(/\n{3,}/g, "\n\n").trim();
    console.log(`[PDF] pdfjs-dist extracted ${cleaned.length} chars`);
    return cleaned;
  } catch (err) {
    console.warn(`[PDF] pdfjs-dist failed: ${err.message}`);
    return null;
  }
}

/**
 * Method 2: pdf-parse — battle-tested fallback.
 */
async function extractWithPdfParse(buffer) {
  try {
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    const text = data.text?.trim() || "";
    console.log(`[PDF] pdf-parse extracted ${text.length} chars`);
    return text || null;
  } catch (err) {
    console.warn(`[PDF] pdf-parse failed: ${err.message}`);
    return null;
  }
}

/**
 * Method 3: Raw buffer decode for DOCX/other binary formats.
 */
function extractFromBuffer(buffer) {
  return buffer
    .toString("utf8")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export async function extractTextFromResume(file) {
  if (!file) return "";

  console.log(`\n[ResumeExtract] File: ${file.originalname} (${file.mimetype}, ${Math.round(file.size / 1024)}KB)`);

  const buffer = await fs.readFile(file.path);
  const extension = path.extname(file.originalname).toLowerCase();

  // Plain text — just return as-is
  if (extension === ".txt" || file.mimetype === "text/plain") {
    const text = buffer.toString("utf8");
    console.log(`[ResumeExtract] Plain text: ${text.length} chars`);
    return text;
  }

  // PDF — try pdfjs first, then pdf-parse
  if (extension === ".pdf" || file.mimetype === "application/pdf") {
    console.log("[ResumeExtract] Trying pdfjs-dist...");
    const pdfjsText = await extractWithPdfJs(buffer);
    if (pdfjsText && pdfjsText.length > 80) {
      console.log("[ResumeExtract] ✅ pdfjs-dist succeeded");
      return pdfjsText;
    }

    console.log("[ResumeExtract] pdfjs short/failed, trying pdf-parse...");
    const pdfParseText = await extractWithPdfParse(buffer);
    if (pdfParseText && pdfParseText.length > 80) {
      console.log("[ResumeExtract] ✅ pdf-parse succeeded");
      return pdfParseText;
    }

    // Both failed — return whatever we got or raw buffer
    const best = (pdfjsText?.length || 0) > (pdfParseText?.length || 0) ? pdfjsText : pdfParseText;
    if (best) {
      console.warn("[ResumeExtract] ⚠️ PDF text is very short — might be scanned/image-based PDF");
      return best;
    }

    console.error("[ResumeExtract] ❌ All PDF extraction methods failed — using raw buffer decode");
    return extractFromBuffer(buffer);
  }

  // DOCX / other — raw decode
  console.log("[ResumeExtract] Non-PDF: using buffer decode");
  return extractFromBuffer(buffer);
}

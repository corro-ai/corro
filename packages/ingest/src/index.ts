import * as fs from "fs";
import * as path from "path";
import { IngestResult, DialogueTurn } from "./types";

// --- VTT Parser ---
// VTT is the standard Zoom transcript format.
// It contains timestamps and speaker names already.
function parseVTT(content: string, filename: string): IngestResult {
  const turns: DialogueTurn[] = [];
  const blocks = content.split("\n\n").filter(Boolean);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    // A valid block looks like:
    // 1
    // 00:00:01.000 --> 00:00:05.000
    // Speaker Name: What they said
    if (lines.length < 3) continue;

    const timeLine = lines.find((l) => l.includes("-->"));
    if (!timeLine) continue;

    const [startStr, endStr] = timeLine.split("-->").map((s) => s.trim());
    const textLine = lines[lines.length - 1];

    const colonIndex = textLine.indexOf(":");
    const speaker =
      colonIndex > -1 ? textLine.substring(0, colonIndex).trim() : "Unknown";
    const text =
      colonIndex > -1
        ? textLine.substring(colonIndex + 1).trim()
        : textLine.trim();

    turns.push({
      speaker,
      text,
      startMs: timeToMs(startStr),
      endMs: timeToMs(endStr),
    });
  }

  return {
    filename,
    type: "transcript",
    turns,
    rawText: content,
  };
}

// --- SRT Parser ---
// SRT is a common subtitle format, similar to VTT but no speaker names.
function parseSRT(content: string, filename: string): IngestResult {
  const turns: DialogueTurn[] = [];
  const blocks = content.split("\n\n").filter(Boolean);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;

    const timeLine = lines.find((l) => l.includes("-->"));
    if (!timeLine) continue;

    const [startStr, endStr] = timeLine
      .split("-->")
      .map((s) => s.trim().replace(",", "."));
    const text = lines.slice(2).join(" ").trim();

    turns.push({
      speaker: "Unknown",
      text,
      startMs: timeToMs(startStr),
      endMs: timeToMs(endStr),
    });
  }

  return { filename, type: "transcript", turns, rawText: content };
}

// --- TXT Parser ---
// Plain text has no timestamps. We assign 0 for both.
function parseTXT(content: string, filename: string): IngestResult {
  const turns: DialogueTurn[] = [
    {
      speaker: "Unknown",
      text: content.trim(),
      startMs: 0,
      endMs: 0,
    },
  ];
  return { filename, type: "txt", turns, rawText: content };
}

// --- Helper: Convert "00:01:23.456" to milliseconds ---
function timeToMs(timeStr: string): number {
  const parts = timeStr.split(":");
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    return Math.round((hours * 3600 + minutes * 60 + seconds) * 1000);
  }
  return 0;
}

// --- Main Export: The "ingest" function ---
// This is the single function the CLI will call.
// It figures out the file type and picks the right parser.
export async function ingest(filePath: string): Promise<IngestResult> {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);
  const content = fs.readFileSync(filePath, "utf-8");

  switch (ext) {
    case ".vtt":
      return parseVTT(content, filename);
    case ".srt":
      return parseSRT(content, filename);
    case ".txt":
      return parseTXT(content, filename);
    case ".docx": {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ path: filePath });
      return parseTXT(result.value, filename);
    }
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

export * from "./types";
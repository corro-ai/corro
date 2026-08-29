import * as fs from "fs";
import * as path from "path";
import { IngestResult, DialogueTurn } from "./types";

// --- VTT Parser ---
// VTT is the standard Zoom transcript format.
// It contains timestamps and speaker names already.
function parseVTT(content: string, filename: string): IngestResult {
  const turns: DialogueTurn[] = [];
  const blocks = content.split(/\n\n+/).filter(Boolean);

  for (const block of blocks) {
    if (block.trim() === "WEBVTT") continue;

    const lines = block.trim().split("\n");
    
    // 1. Find the anchor: the timing line
    const timeLineIndex = lines.findIndex((l) => l.includes("-->"));
    if (timeLineIndex === -1) continue;

    // 2. Parse timestamps
    const timeLine = lines[timeLineIndex];
    const [startStr, endStr] = timeLine.split("-->").map((s) => s.trim());

    // 3. Extract all text *after* the timing line
    let rawText = lines.slice(timeLineIndex + 1).join(" ").trim();
    
    // 4. Extract speaker using Regex for <v Name> or Name:
    let speaker = "Unknown";
    let text = rawText;

    const voiceTagMatch = rawText.match(/^<v\s+([^>]+)>(.*)/i);
    if (voiceTagMatch) {
      speaker = voiceTagMatch[1].trim();
      text = voiceTagMatch[2].trim();
    } else {
      const colonIndex = rawText.indexOf(":");
      if (colonIndex > -1 && colonIndex < 30) {
        speaker = rawText.substring(0, colonIndex).trim();
        text = rawText.substring(colonIndex + 1).trim();
      }
    }

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
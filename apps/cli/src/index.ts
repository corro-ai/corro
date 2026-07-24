import { Command } from "commander";
import * as path from "path";
import * as dotenv from "dotenv";
import { ingest } from "@corro/ingest";
import { transcribe } from "@corro/transcribe";
import { chunk } from "@corro/chunk";
import { IngestResult } from "@corro/ingest";

// Load environment variables from root .env
dotenv.config({ path: "../../.env" });

// Audio file extensions that need transcription first
const AUDIO_FORMATS = [".mp3", ".mp4", ".m4a", ".wav", ".webm", ".ogg"];

// Create the CLI program
const program = new Command();

program
  .name("corro")
  .description("The evidence pipeline for spec-driven development")
  .version("0.1.0");

// --- The "ingest" command ---
program
  .command("ingest <file>")
  .description("Ingest a transcript or audio file into the evidence pipeline")
  .requiredOption("--project <id>", "The project ID to associate this file with")
  .action(async (file: string, options: { project: string }) => {
    try {
      const filePath = path.resolve(file);
      const ext = path.extname(filePath).toLowerCase();

      console.log(`\n🚀 Corro Evidence Pipeline`);
      console.log(`📁 File: ${filePath}`);
      console.log(`📂 Project: ${options.project}\n`);

      let ingestResult: IngestResult;

      // --- Path A: Audio file → transcribe first, then ingest ---
      if (AUDIO_FORMATS.includes(ext)) {
        console.log(`🎙️  Detected audio file (${ext})`);

        // Step 1: Transcribe audio → text
        const transcribeResult = await transcribe(filePath);

        // Step 2: Convert TranscribeResult → IngestResult
        ingestResult = {
          filename: transcribeResult.filename,
          type: "audio",
          rawText: transcribeResult.text,
          turns: [
            {
              speaker: "Unknown",
              text: transcribeResult.text,
              startMs: 0,
              endMs: Math.round(transcribeResult.duration * 1000),
            },
          ],
        };
      }
      // --- Path B: Text file → ingest directly ---
      else {
        console.log(`📄 Detected text file (${ext})`);
        ingestResult = await ingest(filePath);
      }

      console.log(`📊 Parsed ${ingestResult.turns.length} turns\n`);

      // --- Step 3: Chunk and save to Supabase ---
      const result = await chunk(ingestResult, options.project);

      // --- Final Summary ---
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`✅ Pipeline complete!`);
      console.log(`   Source ID: ${result.sourceId}`);
      console.log(`   Chunks saved: ${result.totalChunks}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    } catch (error) {
      console.error(`\n❌ Error: ${(error as Error).message}\n`);
      process.exit(1);
    }
  });

  import { extract } from "@corro/extract";

// --- The "extract" command ---
  program
    .command("extract")
    .description("Extract insights from chunks using Gemini Flash")
    .requiredOption("--project <id>", "The project ID to extract insights from")
    .action(async (options: { project: string }) => {
      try {
        await extract(options.project);
      } catch (error) {
        console.error(`\n❌ Error: ${(error as Error).message}\n`);
        process.exit(1);
      }
    });

program.parse();
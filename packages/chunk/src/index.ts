import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv"
import { IngestResult, DialogueTurn } from "@corro/ingest";
import { ChunkResult, SaveSourceInput } from "./types";

// Load environment variables from root .env
dotenv.config({ path: "../../.env" });

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
// --- Save Source ---
// Saves the file metadata into the `sources` table
// Returns the UUID that Supabase assigned to it
async function saveSource(input: SaveSourceInput): Promise<string> {
    const { data, error } = await supabase
      .from("sources")
      .insert({
        project_id: input.projectId,
        filename: input.filename,
        type: input.type,
        metadata: input.metadata ?? {},
      })
      .select("id")
      .single();
    if (error) throw new Error(`Failed to save source: ${error.message}`);
    return data.id;
  }

 // --- Build Context Window ---
// Takes the current turn and adds ±1 surrounding turns as context
// This is the key to the "dialogue-aware" chunking the roadmap requires
function buildContextWindow(
  turns: DialogueTurn[],
  currentIndex: number
): string {
  const contextParts: string[] = [];
  // Add the previous turn as context (if it exists)
  if (currentIndex > 0) {
    const prev = turns[currentIndex - 1];
    contextParts.push(`[Context] ${prev.speaker}: ${prev.text}`);
  }
  // Add the current turn (the main content)
  const current = turns[currentIndex];
  contextParts.push(`${current.speaker}: ${current.text}`);
  // Add the next turn as context (if it exists)
  if (currentIndex < turns.length - 1) {
    const next = turns[currentIndex + 1];
    contextParts.push(`[Context] ${next.speaker}: ${next.text}`);
  }
  return contextParts.join("\n");
}
// --- Main Export: chunk() ---
// Takes an IngestResult and saves everything to Supabase
export async function chunk(
  ingestResult: IngestResult,
  projectId: string
): Promise<ChunkResult> {
  console.log(`💾 Saving source: ${ingestResult.filename}`);
  // Step 1: Save the source file to Supabase
  const sourceId = await saveSource({
    projectId,
    filename: ingestResult.filename,
    type: ingestResult.type,
  });
  console.log(`✂️  Chunking ${ingestResult.turns.length} turns...`);
  // Step 2: Loop through every turn and save it as a chunk
  let totalChunks = 0;
  for (let i = 0; i < ingestResult.turns.length; i++) {
    const turn = ingestResult.turns[i];
    // Skip empty turns
    if (!turn.text.trim()) continue;
    // Build the text with ±1 context window
    const textWithContext = buildContextWindow(ingestResult.turns, i);
    // Save this chunk to Supabase
    const { error } = await supabase.from("chunks").insert({
      source_id: sourceId,
      speaker: turn.speaker,
      text: textWithContext,
      start_ms: turn.startMs,
      end_ms: turn.endMs,
    });
    if (error) throw new Error(`Failed to save chunk: ${error.message}`);
    totalChunks++;
  }
  console.log(`✅ Saved ${totalChunks} chunks to Supabase!`);
  return { sourceId, totalChunks };
}
export * from "./types";
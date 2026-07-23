import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { Insight, InsightKind, ExtractResult } from "./types";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";

// Load environment variables from root .env
dotenv.config({ path: "../../.env" });

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Extract insights from a single chunk ---
async function extractFromChunk(
  chunkId: string,
  chunkText: string
): Promise<Insight[]> {
  const userPrompt = buildUserPrompt(chunkText);

  // Call Groq (Llama 3.3 70B)
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.1,   // Low temperature = more deterministic, better for JSON
    response_format: { type: "json_object" },  // Forces valid JSON output
  });

  const responseText = completion.choices[0]?.message?.content?.trim() ?? "";

  // Parse the JSON response
  let parsed: any;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    console.warn(`⚠️  Groq returned invalid JSON for chunk ${chunkId}, skipping.`);
    return [];
  }

  // Groq with json_object mode sometimes wraps in {insights: [...]} — handle both
  const rawInsights: any[] = Array.isArray(parsed) ? parsed : (parsed.insights ?? []);

  if (!Array.isArray(rawInsights)) {
    console.warn(`⚠️  Groq returned non-array for chunk ${chunkId}, skipping.`);
    return [];
  }

  // Convert raw objects into typed Insight objects
  const insights: Insight[] = rawInsights.map((raw: any) => ({
    kind: raw.kind as InsightKind,
    statement: raw.statement,
    severity: raw.severity,
    confidence: raw.confidence,
    quote: raw.quote,
    chunkId,
  }));

  return insights;
}

// --- Main Export: extract() ---
// Reads all chunks for a project, sends each to Groq (Llama 3.3 70B), saves insights to Supabase
export async function extract(projectId: string): Promise<ExtractResult> {

  console.log(`\n🧠 Starting extraction for project: ${projectId}\n`);

  // Step 1: Fetch all chunks for this project (join through sources table)
  const { data: chunks, error: fetchError } = await supabase
    .from("chunks")
    .select(`
      id,
      text,
      speaker,
      source_id,
      sources!inner(project_id)
    `)
    .eq("sources.project_id", projectId);

  if (fetchError) throw new Error(`Failed to fetch chunks: ${fetchError.message}`);
  if (!chunks || chunks.length === 0) {
    console.log("No chunks found for this project.");
    return { totalInsights: 0, totalChunksProcessed: 0, hallucinated: 0, byKind: { pain: 0, request: 0, praise: 0, confusion: 0 } };
  }

  console.log(`📦 Found ${chunks.length} chunks to process\n`);

  // Step 2: Process each chunk
  let totalInsights = 0;
  let hallucinated = 0;
  const byKind = { pain: 0, request: 0, praise: 0, confusion: 0 };

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`  [${i + 1}/${chunks.length}] Processing chunk by ${chunk.speaker}...`);

    // Small delay to be polite to the API (Groq free tier is 30 req/min)
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Call Groq to extract insights from this chunk
    const insights = await extractFromChunk(chunk.id, chunk.text);

    // Step 3: Validate and save each insight
    for (const insight of insights) {

      // FAITHFULNESS CHECK: Does the quote actually exist in the chunk text?
      if (!chunk.text.includes(insight.quote)) {
        console.log(`    ❌ Hallucinated quote discarded: "${insight.quote.substring(0, 50)}..."`);
        hallucinated++;
        continue;
      }

      // Save valid insight to Supabase
      const { error: insertError } = await supabase.from("insights").insert({
        chunk_id: chunk.id,
        kind: insight.kind,
        statement: insight.statement,
        severity: insight.severity,
        confidence: insight.confidence,
      });

      if (insertError) {
        console.error(`    ⚠️  Failed to save insight: ${insertError.message}`);
        continue;
      }

      byKind[insight.kind]++;
      totalInsights++;
      console.log(`    ✅ ${insight.kind}: "${insight.statement}" (severity: ${insight.severity})`);
    }
  }

  // Step 4: Print summary
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🧠 Extraction complete!`);
  console.log(`   Chunks processed: ${chunks.length}`);
  console.log(`   Insights saved: ${totalInsights}`);
  console.log(`   Hallucinated (discarded): ${hallucinated}`);
  console.log(`   Pain: ${byKind.pain} | Request: ${byKind.request} | Praise: ${byKind.praise} | Confusion: ${byKind.confusion}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  return { totalInsights, totalChunksProcessed: chunks.length, hallucinated, byKind };
}

export * from "./types";
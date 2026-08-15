import { createClient } from "@supabase/supabase-js";
import { embed } from "@corro/embed";
import { RetrievedChunk } from "./type";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Function 1: Keyword Search (BM25) ---
// Uses the GIN index we just created to find chunks by exact words
async function keywordSearch(
  query: string,
  projectId: string,
  limit: number = 5
): Promise<RetrievedChunk[]> {
  // Convert the query into Postgres tsquery format
  // "onboarding problems" becomes "onboarding & problems"
  const tsquery = query.trim().split(/\s+/).join(" & ");

  const { data, error } = await supabase
    .from("chunks")
    .select("id, text, speaker, source_id, sources!inner(filename, project_id)")
    .eq("sources.project_id", projectId)
    .textSearch("text", tsquery)
    .limit(limit);

  if (error) throw new Error(`Keyword search failed: ${error.message}`);

  return (data || []).map((row: any) => ({
    id: row.id,
    text: row.text,
    speaker: row.speaker,
    source_filename: row.sources.filename,
    score: 0.5, // keyword matches get a flat score
    method: "keyword" as const,
  }));
}

// --- Function 2: Semantic Search (Vector Similarity) ---
// Uses the match_chunks function we created in Supabase
async function semanticSearch(
  query: string,
  projectId: string,
  limit: number = 5
): Promise<RetrievedChunk[]> {
  // Step 1: Convert the PM's question into a vector
  const { embedding } = await embed(query);

  // Step 2: Call our custom Postgres function
  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: embedding,
    match_project_id: projectId,
    match_threshold: 0.3,
    match_count: limit,
  });

  if (error) throw new Error(`Semantic search failed: ${error.message}`);

  // Step 3: We need the filename, so fetch it for each source_id
  const results: RetrievedChunk[] = [];
  for (const row of data || []) {
    const { data: source } = await supabase
      .from("sources")
      .select("filename")
      .eq("id", row.source_id)
      .single();

    results.push({
      id: row.id,
      text: row.text,
      speaker: row.speaker,
      source_filename: source?.filename || "unknown",
      score: row.similarity,
      method: "semantic" as const,
    });
  }

  return results;
}

// --- Function 3: Hybrid Retrieve (The Main Export) ---
// Calls BOTH searches, merges, deduplicates, and returns the best chunks
export async function retrieve(
  query: string,
  projectId: string,
  limit: number = 10
): Promise<RetrievedChunk[]> {
  console.log(`🔍 Searching for: "${query}"`);

  // Run both searches in parallel
  const [keywordResults, semanticResults] = await Promise.all([
    keywordSearch(query, projectId, limit),
    semanticSearch(query, projectId, limit),
  ]);

  console.log(`   📝 Keyword hits: ${keywordResults.length}`);
  console.log(`   🧠 Semantic hits: ${semanticResults.length}`);

  // Merge and deduplicate
  const seen = new Set<string>();
  const merged: RetrievedChunk[] = [];

  // Add semantic results first (they have real similarity scores)
  for (const chunk of semanticResults) {
    if (!seen.has(chunk.id)) {
      seen.add(chunk.id);
      merged.push(chunk);
    }
  }

  // Add keyword results that weren't already found semantically
  for (const chunk of keywordResults) {
    if (!seen.has(chunk.id)) {
      seen.add(chunk.id);
      merged.push(chunk);
    } else {
      // Found by BOTH methods — boost the score and mark as hybrid
      const existing = merged.find((c) => c.id === chunk.id)!;
      existing.score = Math.min(existing.score + 0.2, 1.0);
      existing.method = "hybrid";
    }
  }

  // Sort by score (highest first) and return top results
  merged.sort((a, b) => b.score - a.score);
  const final = merged.slice(0, limit);

  console.log(`   ✅ Returning ${final.length} chunks`);
  return final;
}

export * from "./type";
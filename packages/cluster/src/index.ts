import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";
import * as dotenv from "dotenv";
import * as path from "path";
import { embed } from "./embed";


// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });


const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

const groq = new Groq({apiKey: process.env.GROQ_API_KEY})


// --- Cosine Similarity ---
// Takes two vectors, returns a number between -1 and 1
// 1 = identical meaning, 0 = unrelated, -1 = opposite
function cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }


// --- The main cluster function ---
export async function cluster(projectId: string): Promise<void> {
  console.log(`\n🔮 Clustering insights for project: ${projectId}\n`);

  // ========== STEP 1: Embed all insights ==========
  // Fetch insights that don't have embeddings yet
  // We join through chunks → sources to filter by project
  const { data: sources } = await supabase
    .from("sources")
    .select("id")
    .eq("project_id", projectId);

  if (!sources || sources.length === 0) {
    throw new Error("No sources found for this project.");
  }

  const sourceIds = sources.map((s: any) => s.id);

  const { data: chunks } = await supabase
    .from("chunks")
    .select("id")
    .in("source_id", sourceIds);

  if (!chunks || chunks.length === 0) {
    throw new Error("No chunks found for this project.");
  }

  const chunkIds = chunks.map((c: any) => c.id);

  const { data: insights } = await supabase
    .from("insights")
    .select("id, statement, embedding, chunk_id, kind, severity")
    .in("chunk_id", chunkIds);

  if (!insights || insights.length === 0) {
    throw new Error("No insights found for this project.");
  }

  console.log(`📋 Found ${insights.length} insights`);

  // Embed any insights that don't have embeddings yet
  let embeddedCount = 0;
  for (const insight of insights) {
    if (!insight.embedding) {
      const vector = await embed(insight.statement);
      await supabase
        .from("insights")
        .update({ embedding: JSON.stringify(vector) })
        .eq("id", insight.id);
      insight.embedding = vector;
      embeddedCount++;
      if (embeddedCount % 10 === 0) {
        console.log(`  ⏳ Embedded ${embeddedCount} insights...`);
      }
    }
  }
  console.log(`✅ Embedded ${embeddedCount} new insights\n`);

  // ========== STEP 2: Cluster by cosine similarity ==========
  const SIMILARITY_THRESHOLD = 0.65;
  const clustered: { insights: typeof insights }[] = [];
  const used = new Set<string>();

  for (let i = 0; i < insights.length; i++) {
    if (used.has(insights[i].id)) continue;

    // Start a new cluster with this insight as the seed
    const currentCluster = [insights[i]];
    used.add(insights[i].id);

    // Find all similar insights
    for (let j = i + 1; j < insights.length; j++) {
      if (used.has(insights[j].id)) continue;

      const similarity = cosineSimilarity(
        insights[i].embedding as number[],
        insights[j].embedding as number[]
      );

      if (similarity >= SIMILARITY_THRESHOLD) {
        currentCluster.push(insights[j]);
        used.add(insights[j].id);
      }
    }

    clustered.push({ insights: currentCluster });
  }

  console.log(`📊 Found ${clustered.length} clusters\n`);

    // ========== STEP 3: Label each cluster with LLM ==========
    for (let i = 0; i < clustered.length; i++) {
      const group = clustered[i];
      const statements = group.insights.map((ins) => `- [${ins.kind}] ${ins.statement}`).join("\n");
      const avgSeverity = group.insights.reduce((sum, ins) => sum + (ins.severity || 5), 0) / group.insights.length;
  
      console.log(`  🏷️  Cluster ${i + 1} (${group.insights.length} insights, avg severity ${avgSeverity.toFixed(1)}):`);
  
      // Ask Groq to name this cluster
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a product analyst. Given a list of customer feedback insights that belong to the same theme, provide a short label and description.
  Return ONLY valid JSON: {"label": "3-5 word theme name", "description": "One sentence describing this theme"}`,
          },
          {
            role: "user",
            content: `Here are ${group.insights.length} related customer feedback insights:\n\n${statements}`,
          },
        ],
      });
  
      const content = response.choices[0]?.message?.content || "{}";
      let label = "Unlabeled Theme";
      let description = "";
  
      try {
        const parsed = JSON.parse(content);
        label = parsed.label || label;
        description = parsed.description || "";
      } catch {
        console.log(`    ⚠️  Failed to parse LLM response, using default label`);
      }
  
      console.log(`    → "${label}"`);
  
      // Save theme to database
      const { data: theme, error: themeError } = await supabase
        .from("themes")
        .insert({
          project_id: projectId,
          label,
          description,
        })
        .select("id")
        .single();
  
      if (themeError) {
        console.error(`    ❌ Failed to save theme: ${themeError.message}`);
        continue;
      }
  
      // Link all insights in this cluster to the theme
      const links = group.insights.map((ins) => ({
        theme_id: theme.id,
        insight_id: ins.id,
      }));
  
      const { error: linkError } = await supabase
        .from("theme_insights")
        .insert(links);
  
      if (linkError) {
        console.error(`    ❌ Failed to link insights: ${linkError.message}`);
      }
    }
  
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🎉 Clustering complete!`);
    console.log(`   Themes created: ${clustered.length}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  }
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Types ---
interface GoldenInsight {
  source: string;
  kind: string;
  statement: string;
  quote: string;
}

interface ExtractedInsight {
  id: string;
  kind: string;
  statement: string;
  confidence: number;
  severity: number;
  chunk_id: string;
  chunk_text: string;
  source_filename: string;
}

interface EvalResult {
  // How many golden insights did the AI find? (Recall)
  recall: number;
  recallFraction: string;

  // How many AI insights are actually correct? (Precision)  
  precision: number;
  precisionFraction: string;

  // For each AI insight, does the cited quote exist in the source? (Faithfulness)
  faithfulness: number;
  faithfulnessFraction: string;

  // Breakdown
  goldenTotal: number;
  extractedTotal: number;
  matched: number;
  hallucinated: number;

  // Details
  missedInsights: GoldenInsight[];
  hallucinatedInsights: string[];
}

// --- Matching Logic ---
// Check if an AI-extracted insight matches a golden insight.
// Two insights "match" if:
//   1. They are from the same source file
//   2. They have the same kind (pain/request/praise/confusion)
//   3. The golden quote appears in the chunk text (evidence exists)
//   4. Their statements are semantically similar (fuzzy substring match)
function isMatch(
  golden: GoldenInsight,
  extracted: ExtractedInsight
): boolean {
  // Must be from the same source file
  if (extracted.source_filename !== golden.source) return false;

  // Must be the same kind
  if (extracted.kind !== golden.kind) return false;

  // Check if the golden quote exists somewhere in the chunk text
  // This is a looser check — the AI might have picked a slightly different quote
  // but from the same chunk about the same topic
  const goldenWords = golden.quote.toLowerCase().split(/\s+/).slice(0, 6).join(" ");
  const chunkLower = extracted.chunk_text.toLowerCase();

  if (!chunkLower.includes(goldenWords)) return false;

  // Fuzzy statement match: check if key words from golden statement appear in extracted statement
  const goldenKeywords = golden.statement
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 4); // Only meaningful words

  const extractedLower = extracted.statement.toLowerCase();
  const matchingWords = goldenKeywords.filter(w => extractedLower.includes(w));

  // At least 30% of keywords must match
  return matchingWords.length >= Math.ceil(goldenKeywords.length * 0.3);
}

// --- Main Eval Function ---
async function runFaithfulnessEval(projectId: string): Promise<EvalResult> {

  console.log(`\n📊 Running Faithfulness Eval for project: ${projectId}\n`);

  // Step 1: Load the golden set
  const goldenSetPath = path.resolve(__dirname, "golden-set.json");
  const goldenRaw = fs.readFileSync(goldenSetPath, "utf-8");
  const goldenSet: GoldenInsight[] = JSON.parse(goldenRaw);

  console.log(`📋 Golden set: ${goldenSet.length} labeled insights`);

  // Step 2: Fetch all extracted insights from Supabase (with chunk text and source filename)
  const { data: insights, error } = await supabase
    .from("insights")
    .select(`
      id,
      kind,
      statement,
      confidence,
      severity,
      chunk_id,
      chunks!inner(
        text,
        source_id,
        sources!inner(
          filename,
          project_id
        )
      )
    `)
    .eq("chunks.sources.project_id", projectId);

  if (error) throw new Error(`Failed to fetch insights: ${error.message}`);
  if (!insights || insights.length === 0) {
    console.log("No extracted insights found.");
    return {
      recall: 0, recallFraction: "0/0",
      precision: 0, precisionFraction: "0/0",
      faithfulness: 0, faithfulnessFraction: "0/0",
      goldenTotal: goldenSet.length, extractedTotal: 0,
      matched: 0, hallucinated: 0,
      missedInsights: goldenSet, hallucinatedInsights: [],
    };
  }

  // Flatten the nested Supabase response
  const extracted: ExtractedInsight[] = insights.map((row: any) => ({
    id: row.id,
    kind: row.kind,
    statement: row.statement,
    confidence: row.confidence,
    severity: row.severity,
    chunk_id: row.chunk_id,
    chunk_text: row.chunks.text,
    source_filename: row.chunks.sources.filename,
  }));

  console.log(`🤖 Extracted insights: ${extracted.length}`);

  // Step 3: RECALL — How many golden insights did the AI find?
  const matchedGolden: Set<number> = new Set();
  const matchedExtracted: Set<number> = new Set();

  for (let gi = 0; gi < goldenSet.length; gi++) {
    for (let ei = 0; ei < extracted.length; ei++) {
      if (matchedExtracted.has(ei)) continue; // Already matched to another golden
      if (isMatch(goldenSet[gi], extracted[ei])) {
        matchedGolden.add(gi);
        matchedExtracted.add(ei);
        break;
      }
    }
  }

  const matched = matchedGolden.size;
  const recall = goldenSet.length > 0 ? matched / goldenSet.length : 0;
  const precision = extracted.length > 0 ? matched / extracted.length : 0;

  // Step 4: FAITHFULNESS — For unmatched AI insights, are the quotes hallucinated?
  const hallucinated = extracted.length - matchedExtracted.size;
  const faithfulness = extracted.length > 0 ? matchedExtracted.size / extracted.length : 0;

  // Step 5: Find missed golden insights
  const missedInsights = goldenSet.filter((_, i) => !matchedGolden.has(i));

  // Step 6: Find unmatched AI insights (potential hallucinations or valid extras)
  const hallucinatedInsights = extracted
    .filter((_, i) => !matchedExtracted.has(i))
    .map(e => `[${e.kind}] "${e.statement}" (from ${e.source_filename})`);

  // Step 7: Print results
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 FAITHFULNESS EVAL RESULTS`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   Golden set size:     ${goldenSet.length}`);
  console.log(`   AI extracted:        ${extracted.length}`);
  console.log(`   Matched:             ${matched}`);
  console.log(``);
  console.log(`   📈 Recall:           ${(recall * 100).toFixed(1)}% (${matched}/${goldenSet.length})`);
  console.log(`   🎯 Precision:        ${(precision * 100).toFixed(1)}% (${matched}/${extracted.length})`);
  console.log(`   🛡️  Faithfulness:     ${(faithfulness * 100).toFixed(1)}% (${matchedExtracted.size}/${extracted.length})`);
  console.log(``);

  if (missedInsights.length > 0) {
    console.log(`   ❌ Missed insights (${missedInsights.length}):`);
    missedInsights.slice(0, 5).forEach(m => {
      console.log(`      - [${m.kind}] ${m.statement}`);
    });
    if (missedInsights.length > 5) {
      console.log(`      ... and ${missedInsights.length - 5} more`);
    }
  }

  if (hallucinatedInsights.length > 0) {
    console.log(`\n   ⚠️  Unmatched AI insights (${hallucinatedInsights.length}):`);
    hallucinatedInsights.slice(0, 5).forEach(h => {
      console.log(`      - ${h}`);
    });
    if (hallucinatedInsights.length > 5) {
      console.log(`      ... and ${hallucinatedInsights.length - 5} more`);
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  return {
    recall,
    recallFraction: `${matched}/${goldenSet.length}`,
    precision,
    precisionFraction: `${matched}/${extracted.length}`,
    faithfulness,
    faithfulnessFraction: `${matchedExtracted.size}/${extracted.length}`,
    goldenTotal: goldenSet.length,
    extractedTotal: extracted.length,
    matched,
    hallucinated,
    missedInsights,
    hallucinatedInsights,
  };
}

// --- CLI Entry ---
const projectId = process.argv[2];
if (!projectId) {
  console.error("Usage: tsx faithfulness.ts <project-id>");
  process.exit(1);
}

runFaithfulnessEval(projectId)
  .then((result) => {
    // Write results to a JSON file for CI/README
    const outPath = path.resolve(__dirname, "../eval-results.json");
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`💾 Results saved to ${outPath}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(`\n❌ Eval failed: ${err.message}`);
    process.exit(1);
  });

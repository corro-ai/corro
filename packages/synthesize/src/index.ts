import { createClient } from "@supabase/supabase-js"
import { OpenRouter } from "@openrouter/sdk";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({path: path.resolve(__dirname, "../../../.env")})

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!

)

// Initialize Groq
const openrouter = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });

// --- Helper: format milliseconds into MM:SS ---
function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  


// Report generator — we will build this in Step 2
export async function synthesize(projectId: string): Promise<string> {
    console.log(`📝 Generating report for project: ${projectId}`);
    
    const {data : themes, error: themesError} =  await supabase
      .from("themes")
      .select("id, label, description")
      .eq("project_id", projectId) 

    if (themesError) {
      throw new Error(`Failed to fetch themes: ${themesError.message}`);
    }

    if (!themes || themes.length === 0) throw new Error("No themes found. Run 'corro cluster' first.");

    console.log(`Found ${themes.length} themes for project ${projectId}`);

    const enrichmentThemes: {

        label: string;
        description: string;
        insights: {
            statement: string; 
            kind: string; 
            severity: number; 
            speaker: string; 
            filename: string; 
            startMs: number; 
            chunkText: string;
        }[];
    }[] = []


    for (const theme of themes){
        // get insight IDs linked to that theme 

        const { data: links } = await supabase
        .from("theme_insights")
        .select("insight_id")
        .eq("theme_id", theme.id);

        if (!links || links.length === 0) continue;

        const insightIds = links.map((l:any)=> l.insight_id)

        // Get the actual insights
        const { data: insights } = await supabase
        .from("insights")
        .select("statement, kind, severity, chunk_id")
        .in("id", insightIds);

        if (!insights || insights.length === 0) continue;

        // Bulk fetch all chunks and sources (instead of 1 query per insight)
        const chunkIds = [...new Set(insights.map(i => i.chunk_id))];
        const { data: chunksData } = await supabase
          .from("chunks")
          .select("id, speaker, text, start_ms, source_id")
          .in("id", chunkIds);

        const chunkMap = new Map((chunksData || []).map(c => [c.id, c]));

        const sourceIds = [...new Set((chunksData || []).map(c => c.source_id))];
        const { data: sourcesData } = sourceIds.length > 0
          ? await supabase.from("sources").select("id, filename").in("id", sourceIds)
          : { data: [] };

        const sourceMap = new Map((sourcesData || []).map(s => [s.id, s]));

        const enrichedInsights = insights.map(insight => {
          const chunk = chunkMap.get(insight.chunk_id);
          const source = chunk ? sourceMap.get(chunk.source_id) : null;
          return {
            statement: insight.statement,
            kind: insight.kind,
            severity: insight.severity,
            speaker: chunk?.speaker || "unknown",
            filename: source?.filename || "unknown",
            startMs: chunk?.start_ms || 0,
            chunkText: chunk?.text || "",
          };
        }).filter(i => i.speaker !== "unknown");

        enrichmentThemes.push({
          label: theme.label,
          description: theme.description,
          insights: enrichedInsights,
        });
    }

   // ========== STEP 3: Rank themes by frequency × severity ==========
   const ranked = enrichmentThemes
     .map((theme) => {
      const avgSeverity = 
      theme.insights.reduce((sum, ins) => sum + (ins.severity || 5), 0) /
        theme.insights.length;
      const score = theme.insights.length * avgSeverity;
      return { ...theme, avgSeverity, score };
     })
     .sort((a, b) => b.score - a.score);
  
    console.log(`📋 Ranked ${ranked.length} themes by impact score\n`);

    // ========== STEP 4: Build the Markdown report ==========
    const now = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    let citationIndex = 1;
    const citations: string[] = [];
    let markdown = "";
    // --- Header ---
    markdown += `# 📊 Customer Insight Report\n`;
    markdown += `**Project ID:** ${projectId}\n`;
    markdown += `**Generated:** ${now}\n`;
    markdown += `**Themes:** ${ranked.length} | **Total Insights:** ${ranked.reduce((sum, t) => sum + t.insights.length, 0)}\n\n`;
    markdown += `---\n\n`;
    // --- Executive Summary ---
    markdown += `## Executive Summary\n\n`;
    const topThemes = ranked.slice(0, 3);
    const summaryText = topThemes
      .map((t, i) => `${i + 1}. **${t.label}** (${t.insights.length} mentions, avg severity ${t.avgSeverity.toFixed(1)})`)
      .join("\n");
    // Ask LLM to write a short executive summary (with retry)
    let summaryContent = "No summary available.";
    try {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const stream = await openrouter.chat.send({
            chatRequest: {
              model: "google/gemma-4-31b-it:free",
              temperature: 0.4,
              messages: [
                {
                  role: "system",
                  content: "You are a product analyst. Write a 2-3 sentence executive summary of the top customer feedback themes. Be direct and actionable. Do not use bullet points.",
                },
                {
                  role: "user",
                  content: `Top themes from customer interviews:\n${summaryText}`,
                },
              ],
              stream: true
            }
          });
          
          summaryContent = "";
          for await (const chunk of stream as any) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              summaryContent += content;
            }
            if (chunk.usage) {
              console.log("\nReasoning tokens:", chunk.usage.completionTokensDetails?.reasoningTokens);
            }
          }

          if (!summaryContent || summaryContent.trim() === "") {
            throw new Error("AI returned empty response");
          }
          console.log(`📝 [Synthesize] Executive summary generated successfully`);
          break; // Success
        } catch (err: any) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.warn(`    ⚠️  Attempt ${attempt}/3 failed: ${err.message}. Retrying in ${waitTime / 1000}s...`);
          if (attempt === 3) {
            console.warn(`    ⚠️  All retries failed for executive summary, using default`);
            summaryContent = "No summary available.";
          }
          await new Promise(r => setTimeout(r, waitTime));
        }
      }
    } catch (err: any) {
      console.warn(`    ⚠️  Executive summary generation failed: ${err.message}`);
    }

    markdown += `${summaryContent}\n\n`;
    markdown += `---\n\n`;
    // --- Theme Sections ---
    for (const theme of ranked) {
      // Severity badge
      let badge = "🟢";
      if (theme.avgSeverity >= 8) badge = "🔴";
      else if (theme.avgSeverity >= 5) badge = "🟡";
      markdown += `## ${badge} ${theme.label}\n`;
      markdown += `**Mentions:** ${theme.insights.length} | **Avg Severity:** ${theme.avgSeverity.toFixed(1)} | **Impact Score:** ${theme.score.toFixed(1)}\n\n`;
      if (theme.description) {
        markdown += `${theme.description}\n\n`;
      }
      markdown += `**Evidence:**\n\n`;
      for (const insight of theme.insights) {
        const timestamp = formatTime(insight.startMs);
        markdown += `- "${insight.statement}" — *${insight.speaker}*, ${insight.filename} [${timestamp}] ^[${citationIndex}]^\n`;
        // Save citation for the appendix
        citations.push(
          `[${citationIndex}] **${insight.speaker}** in *${insight.filename}* at ${timestamp}: "${insight.statement}"`
        );
        citationIndex++;
      }
      markdown += `\n---\n\n`;
    }
    // --- Citations Appendix ---
    markdown += `## 📎 Citations\n\n`;
    for (const citation of citations) {
      markdown += `${citation}\n\n`;
    }
    // --- Footer ---
    markdown += `---\n`;
    markdown += `*Generated by [Corro](https://github.com/corro-ai/corro) — The evidence layer for spec-driven development.*\n`;
    console.log(`✅ Report generated (${citations.length} citations)\n`);
    return markdown;
  

}

  
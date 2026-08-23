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

        // For each insight, get the chunk and source (for speaker, filename, timestamp)
        const enrichedInsights = [];
        for (const insight of insights) {

          const { data: chunk } = await supabase
            .from("chunks")
            .select("speaker, text, start_ms, source_id")
            .eq("id", insight.chunk_id)
            .single()

          if (!chunk) continue;

          const { data: source } = await supabase
            .from("sources")
            .select("filename")
            .eq("id", chunk.source_id)
            .single();

          enrichedInsights.push({
            statement: insight.statement,
            kind: insight.kind,
            severity: insight.severity,
            speaker: chunk.speaker,
            filename: source?.filename || "unknown",
            startMs: chunk.start_ms,
            chunkText: chunk.text,
          });
          
        }
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
    // Ask Groq to write a short executive summary
    const stream = await openrouter.chat.send({
      chatRequest: {
        model: "nvidia/nemotron-3-ultra-550b-a55b:free",
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
    
    let summaryContent = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        summaryContent += content;
        process.stdout.write(content);
      }
      if (chunk.usage) {
        console.log("\nReasoning tokens:", chunk.usage.completionTokensDetails?.reasoningTokens);
      }
    }
    
    const summaryResponse = { choices: [{ message: { content: summaryContent } }] };
    markdown += `${summaryResponse.choices[0]?.message?.content || "No summary available."}\n\n`;
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

  
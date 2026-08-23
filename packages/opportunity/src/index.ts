import { OpenRouter } from "@openrouter/sdk";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const openrouter = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function scoreOpportunities(projectId: string) {
  console.log("🧠 Starting Opportunity Engine...");

  // 1. Fetch Quantitative Data (CSV Metrics)
  const { data: metrics } = await supabase
    .from("metrics")
    .select("id, name, value, dimension, period")
    .eq("project_id", projectId);

  // 2. Fetch Qualitative Data (Interview Insights)
  const { data: insights } = await supabase
    .from("insights")
    .select("id, statement, severity, chunk_id, chunks!inner(source_id, sources!inner(project_id))")
    .eq("chunks.sources.project_id", projectId);

  if (!metrics || metrics.length === 0 || !insights || insights.length === 0) {
    console.log("⚠️ Need both metrics and insights to generate opportunities.");
    return;
  }

  // 3. Build the prompt for the AI
  const prompt = `
    You are an expert Product Manager. Your goal is to identify what features we should build next.
    I will provide Quantitative data (metrics) and Qualitative data (user quotes).
    Find overlaps where users are complaining about the same thing that is failing in the metrics.

    Quantitative Metrics:
    ${JSON.stringify(metrics, null, 2)}

    Qualitative Insights (Complaints):
    ${JSON.stringify(insights.map(i => ({ id: i.id, statement: i.statement, severity: i.severity })), null, 2)}

    Respond in valid JSON with an array of opportunities:
    {
      "opportunities": [
        {
          "title": "Short name of feature to build",
          "description": "Why we should build it based on the data",
          "score": 85, // RICE score from 1-100 (100 is most urgent)
          "supporting_metric_ids": ["uuid-here"],
          "supporting_insight_ids": ["uuid-here"]
        }
      ]
    }
  `;

  const stream = await openrouter.chat.send({
    chatRequest: {
      model: "nvidia/nemotron-3-ultra-550b-a55b:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      stream: true
    }
  });

  let responseContent = "";
  for await (const chunk of stream as any) {
    const chunkContent = chunk.choices[0]?.delta?.content;
    if (chunkContent) {
      responseContent += chunkContent;
      process.stdout.write(chunkContent);
    }
    if (chunk.usage) {
      console.log("\\nReasoning tokens:", chunk.usage.completionTokensDetails?.reasoningTokens);
    }
  }

  // Parse JSON robustly
  let parsed: any = {};
  try {
    let cleanText = responseContent.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleanText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(cleanText);
    }
  } catch (e) {
    console.log("Failed to parse JSON opportunities");
  }
  const opportunities = parsed.opportunities || [];

  // 5. Save the generated opportunities to the database
  for (const opp of opportunities) {
    const { data: insertedOpp } = await supabase.from("opportunities").insert({
      project_id: projectId,
      title: opp.title,
      description: opp.description,
      score: opp.score,
    }).select().single();

    if (insertedOpp) {
      // Save the evidence links (glue table)
      const evidenceData = [
        ...opp.supporting_metric_ids.map((mId: string) => ({
          opportunity_id: insertedOpp.id,
          type: "metric",
          metric_id: mId
        })),
        ...opp.supporting_insight_ids.map((iId: string) => ({
          opportunity_id: insertedOpp.id,
          type: "insight",
          insight_id: iId
        }))
      ];
      
      if (evidenceData.length > 0) {
        await supabase.from("opportunity_evidence").insert(evidenceData);
      }
      
      console.log(`✅ Saved Opportunity: ${opp.title} (Score: ${opp.score})`);
    }
  }
}
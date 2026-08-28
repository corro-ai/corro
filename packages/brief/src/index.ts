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

export async function generateBrief(opportunityId: string) {
  console.log(`📝 Generating Feature Brief for Opportunity: ${opportunityId}`);

  // 1. Fetch the Opportunity
  const { data: opp } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", opportunityId)
    .single();

  if (!opp) throw new Error("Opportunity not found");

  // 2. Fetch the Evidence (The "Glue")
  const { data: evidence } = await supabase
    .from("opportunity_evidence")
    .select(`
      type,
      metric_id,
      insight_id
    `)
    .eq("opportunity_id", opportunityId);

  if (!evidence) throw new Error("No evidence found for this opportunity");

  // Fetch actual Metric and Insight data based on the evidence IDs
  const metricIds = evidence.filter(e => e.type === "metric").map(e => e.metric_id);
  const insightIds = evidence.filter(e => e.type === "insight").map(e => e.insight_id);

  const { data: metrics } = metricIds.length > 0 ? await supabase.from("metrics").select("*").in("id", metricIds) : { data: [] };
  const { data: insights } = insightIds.length > 0 ? await supabase.from("insights").select("*").in("id", insightIds) : { data: [] };

  // 3. Build the Spec Prompt
  const prompt = `
    You are an expert Technical Product Manager.
    Write a Feature Brief (PRD) for the following Opportunity:
    Title: ${opp.title}
    Description: ${opp.description}

    Use this strict evidence to justify your decisions:
    Quantitative Data: ${JSON.stringify(metrics, null, 2)}
    Qualitative Quotes: ${JSON.stringify(insights?.map(i => i.quote), null, 2)}

    Format the output as a Markdown document with these exact headers:
    # Feature Brief: [Title]
    ## Problem Statement
    (Include exact quotes and metrics here to prove the problem)
    ## Proposed UI Changes
    ## Proposed Data-Model Changes
    ## Proposed Workflow Changes
    ## Success Metrics
    ## Risks & Open Questions
  `;

  const stream = await openrouter.chat.send({
    chatRequest: {
      model: "nvidia/nemotron-3.5-lightning:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      stream: true
    }
  });

  let markdownContent = "";
  for await (const chunk of stream as any) {
    if (chunk.error) {
      console.error("OpenRouter API Error:", chunk.error);
      throw new Error(`OpenRouter API Error: ${chunk.error.message || JSON.stringify(chunk.error)}`);
    }
    const chunkContent = chunk.choices?.[0]?.delta?.content;
    if (chunkContent) {
      markdownContent += chunkContent;
      process.stdout.write(chunkContent);
    }
    if (chunk.usage) {
      console.log("\\nReasoning tokens:", chunk.usage.completionTokensDetails?.reasoningTokens);
    }
  }

  if (!markdownContent || markdownContent.trim() === "") {
    throw new Error("AI returned an empty response. This is usually due to free tier rate limits.");
  }

  // 5. Calculate the next version number
  const { data: existingBriefs } = await supabase
    .from("feature_briefs")
    .select("version")
    .eq("opportunity_id", opportunityId)
    .order("version", { ascending: false })
    .limit(1);

  const nextVersion = existingBriefs && existingBriefs.length > 0 
    ? (existingBriefs[0].version || 1) + 1 
    : 1;

  // 6. Save the new version to the database
  const { error } = await supabase.from("feature_briefs").insert({
    opportunity_id: opportunityId,
    content_md: markdownContent,
    version: nextVersion
  });

  if (error) {
    console.error("❌ Failed to save Feature Brief:", error.message);
    throw new Error(`Failed to save Feature Brief: ${error.message}`);
  } else {
    console.log(`✅ Feature Brief v${nextVersion} generated and saved successfully!`);
  }
}
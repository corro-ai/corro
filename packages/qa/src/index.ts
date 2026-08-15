import Groq from "groq-sdk";
import { retrieve } from "@corro/retrieval";
import { AnswerResult, Citation } from "./types";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const QA_SYSTEM_PROMPT = `You are a product research assistant. Your job is to answer the user's question using ONLY the provided transcript chunks.

STRICT RULES:
1. Every claim you make MUST include a citation like [1], [2], etc.
2. Citations refer to the chunk numbers provided in the context.
3. If the chunks do NOT contain enough information to answer the question, respond with: "Insufficient evidence — the uploaded transcripts do not contain information about this topic."
4. NEVER make up information. NEVER use knowledge outside the provided chunks.
5. Use direct customer quotes when possible, formatted in quotation marks.
6. Keep your answer concise and actionable for a Product Manager.`;


export async function ask(
    question: string,
    projectId: string
  ): Promise<AnswerResult> {
    console.log(`💬 Question: "${question}"`);
  
    // Step 1: Retrieve the most relevant chunks
    const chunks = await retrieve(question, projectId);
  
    // Step 2: If no chunks found, return insufficient evidence
    if (chunks.length === 0) {
      return {
        answer: "Insufficient evidence — the uploaded transcripts do not contain information about this topic.",
        citations: [],
        confidence: "low",
        sourceCount: 0,
      };
    }
  
    // Step 3: Format chunks into numbered context for the LLM
    const context = chunks
      .map((chunk, i) => `[${i + 1}] (${chunk.source_filename}, ${chunk.speaker}):\n"${chunk.text}"`)
      .join("\n\n");
  
    // Step 4: Call Groq LLM with the context + question
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: QA_SYSTEM_PROMPT },
        { role: "user", content: `CONTEXT:\n${context}\n\nQUESTION: ${question}` },
      ],
      temperature: 0.2,
    });
  
    const answer = completion.choices[0]?.message?.content || "No response generated.";
  
    // Step 5: Build the citation map
    const citations: Citation[] = chunks.map((chunk, i) => ({
      index: i + 1,
      chunk,
    }));
  
    // Step 6: Calculate confidence
    const uniqueSources = new Set(chunks.map((c) => c.source_filename)).size;
    const avgScore = chunks.reduce((sum, c) => sum + c.score, 0) / chunks.length;
  
    let confidence: "high" | "medium" | "low";
    if (uniqueSources >= 3 && avgScore > 0.5) {
      confidence = "high";
    } else if (uniqueSources >= 2 || avgScore > 0.4) {
      confidence = "medium";
    } else {
      confidence = "low";
    }
  
    console.log(`✅ Answer generated (${confidence} confidence, ${uniqueSources} sources)`);
  
    return { answer, citations, confidence, sourceCount: uniqueSources };
  }
  
export * from "./types";
import { ChatMessage } from "@/src/types/chat";

export async function askQuestion(
  question: string,
  projectId: string
): Promise<ChatMessage> {
  const res = await fetch("/api/qa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, projectId }),
  });

  if (!res.ok) throw new Error("Failed to get answer");

  const data = await res.json();

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: data.answer,
    citations: data.citations,
    confidence: data.confidence,
    sourceCount: data.sourceCount,
    timestamp: new Date(),
  };
}

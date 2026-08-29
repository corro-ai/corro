import { EmbeddingResult } from "./type";

// Use Hugging Face's Inference API for embeddings instead of local onnxruntime.
// Model: BAAI/bge-small-en-v1.5 (384-dim, same as previous all-MiniLM-L6-v2)

const HF_API_URL = "https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5";

// --- Generate embedding for a single chunk of text ---
export async function embed(text: string): Promise<EmbeddingResult> {
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.HF_TOKEN}`,
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding API failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const embedding = result as number[];

  return {
    text,
    embedding,
  };
}

// --- Generate embeddings for multiple chunks ---
export async function embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
  const results: EmbeddingResult[] = [];
  for (const text of texts) {
    const result = await embed(text);
    results.push(result);
  }
  return results;
}

export * from "./type";
// Use Hugging Face's Inference API for embeddings instead of local onnxruntime.
// Model: BAAI/bge-small-en-v1.5 (384-dim, same as previous all-MiniLM-L6-v2)
// This works on Vercel because it's just an HTTP call — no native binaries needed.

const HF_API_URL =
  "https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5";

export async function embed(text: string): Promise<number[]> {
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

  // API returns a flat array [0.1, 0.2, ...] for single input
  return result as number[];
}
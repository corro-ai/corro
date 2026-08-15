import { pipeline, env } from "@xenova/transformers";
import { EmbeddingResult } from "./type";

// Configure Transformers.js to not use local cache if it causes issues, 
// though by default it caches models in `./node_modules/.cache/`
env.allowLocalModels = false;
env.useBrowserCache = false;

// Singleton to ensure we only load the model into memory once
let embedderPipeline: any = null;

async function getEmbedder() {
  if (!embedderPipeline) {
    // This will download the model on the very first run (approx 80MB)
    embedderPipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedderPipeline;
}

// --- Generate embedding for a single chunk of text ---
export async function embed(text: string): Promise<EmbeddingResult> {
  const embedder = await getEmbedder();
  
  // Generate the embeddings
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  
  // Convert the Float32Array to a standard JavaScript Array
  const embedding = Array.from(output.data);

  return {
    text,
    embedding: embedding as number[],
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
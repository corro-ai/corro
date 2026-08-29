import { pipeline, env } from "@xenova/transformers";

// Disable local models for Vercel Serverless environment
env.allowLocalModels = false;
env.useBrowserCache = false;


// Change from `Pipeline` to `any` to bypass the type error
let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    console.log("⏳ Loading embedding model (first time only)...");
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("✅ Embedding model loaded!");
  }
  return embedder;
}
  export async function embed(text: string): Promise<number[]> {
    const extractor = await getEmbedder();
    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });
    // output.data is a Float32Array, convert to regular array
    return Array.from(output.data as Float32Array);
  }
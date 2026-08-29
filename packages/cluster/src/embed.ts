// Dynamic import — @xenova/transformers is only loaded when embed() is called,
// NOT when the /api/inngest route cold-starts. This prevents Vercel from crashing.
let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    console.log("⏳ Loading embedding model (first time only)...");

    // Dynamic import: this is the key fix for Vercel
    const { pipeline, env } = await import("@xenova/transformers");

    // Disable local filesystem access for Vercel Serverless
    env.allowLocalModels = false;
    env.useBrowserCache = false;

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
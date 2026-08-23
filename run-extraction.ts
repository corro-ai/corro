import { extract } from "./packages/extract/src/index";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const projectId = process.argv[2];
  if (!projectId) {
    console.error("Usage: tsx run-extraction.ts <projectId>");
    process.exit(1);
  }

  // 1. Delete old insights for this project so we can start fresh
  console.log("🗑️ Deleting old insights...");
  const { data: chunks } = await supabase.from("chunks").select("id, sources!inner(project_id)").eq("sources.project_id", projectId);
  
  if (chunks && chunks.length > 0) {
    const chunkIds = chunks.map(c => c.id);
    await supabase.from("insights").delete().in("chunk_id", chunkIds);
  }

  // 2. Re-run extraction using the NEW prompt
  console.log("🚀 Running extraction with NEW prompt...");
  await extract(projectId);
  
  console.log("✅ Done! You can now run the eval script.");
}

run().catch(console.error);

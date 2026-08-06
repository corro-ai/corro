import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { inngest } from "./client";
import { ingest } from "@corro/ingest";
import { chunk } from "@corro/chunk";
import { extract } from "@corro/extract";
import { cluster } from "@corro/cluster";
import { synthesize } from "@corro/synthesize";

//background job that will run the corro pipeline
export const processTranscript = inngest.createFunction(
    { 
      id: "process-transcript", 
      name: "Process Transcript",
      triggers: [{ event: "app/transcript.uploaded" }]
    },

    async ({event, step}) => {
        const { filePath, projectId } = event.data;

    const ingestResult = await step.run("ingest", async () => {
        console.log("📥 Downloading and Ingesting file...");
        
        // 1. Connect to Supabase securely
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 2. Download the file from the cloud
        const { data, error } = await supabase.storage
          .from("transcript")
          .download(filePath);
        
        if (error) throw error;

        // 3. Save it to a temporary file on the server
        const buffer = Buffer.from(await data.arrayBuffer());
        const tempPath = path.join(os.tmpdir(), `temp-${projectId}.vtt`);
        fs.writeFileSync(tempPath, buffer);

        // 4. Run our ingest package on the temporary file
        const result = await ingest(tempPath);

        // 5. Clean up the temp file
        fs.unlinkSync(tempPath);

        return result;
      });
      // Step 2: Chunk and save to Supabase
      const chunkResult = await step.run("chunk", async () => {
        console.log("✂️ Chunking...");
        return await chunk(ingestResult, projectId);
      });
      // Step 3: Extract insights using Groq
      await step.run("extract", async () => {
        console.log("🧠 Extracting insights...");
        return await extract(projectId);
      });
      // Step 4: Cluster insights into themes
      await step.run("cluster", async () => {
        console.log("🔮 Clustering...");
        return await cluster(projectId);
      });
      // Step 5: Generate the final report
      const report = await step.run("synthesize", async () => {
        console.log("📝 Generating report...");
        return await synthesize(projectId);
      });

      // Step 6: Save the report into the reports table
      await step.run("save-report", async () => {
        console.log("💾 Saving report to database...");

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error } = await supabase.from("reports").insert({
          project_id: projectId,
          content_md: report,
        });

        if (error) throw new Error(`Failed to save report: ${error.message}`);
        console.log("✅ Report saved to database!");
      });

      return { success: true, projectId }
    }
)
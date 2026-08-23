import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load env vars from the root .env file
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface MetricRow {
  projectId: string;
  name: string;
  value: string;
  dimension?: string;
  period?: string;
}

/**
 * Parses a raw CSV string and inserts it into the metrics table.
 * Expects CSV headers: name, value, dimension, period
 */
export async function processCsvMetrics(projectId: string, csvContent: string): Promise<number> {
  const lines = csvContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return 0; // Needs at least a header and one row

  // Simple CSV parser
  const headers = lines[0].split(",").map(h => h.toLowerCase().trim());
  
  const nameIdx = headers.indexOf("name");
  const valueIdx = headers.indexOf("value");
  const dimensionIdx = headers.indexOf("dimension");
  const periodIdx = headers.indexOf("period");

  if (nameIdx === -1 || valueIdx === -1) {
    throw new Error("CSV must contain at least 'name' and 'value' columns.");
  }

  let insertedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(",").map(c => c.trim());
    
    const row: MetricRow = {
      projectId,
      name: columns[nameIdx],
      value: columns[valueIdx],
      dimension: dimensionIdx !== -1 ? columns[dimensionIdx] : undefined,
      period: periodIdx !== -1 ? columns[periodIdx] : undefined,
    };

    const { error } = await supabase.from("metrics").insert({
      project_id: row.projectId,
      name: row.name,
      value: row.value,
      dimension: row.dimension,
      period: row.period,
      source: "csv_upload"
    });

    if (error) {
      console.error(`Failed to insert metric ${row.name}:`, error.message);
    } else {
      insertedCount++;
    }
  }

  console.log(`✅ Successfully ingested ${insertedCount} metrics from CSV.`);
  return insertedCount;
}
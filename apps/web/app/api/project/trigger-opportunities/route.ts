import { NextResponse } from "next/server";
import { inngest } from "../../../../src/inngest/client";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { projectId, metrics } = await req.json();

  if (metrics && metrics.length > 0) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { error } = await supabase.from("metrics").insert(metrics);
    if (error) {
      console.error("Failed to insert metrics:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  await inngest.send({
    name: "project/generate.opportunities",
    data: { projectId },
  });

  return NextResponse.json({ success: true });
}

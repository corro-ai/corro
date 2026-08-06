import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest){
    const projectId = request.nextUrl.searchParams.get("projectId")

    if (!projectId) {
        return NextResponse.json(
          { error: "Missing projectId" },
          { status: 400 }
        );
      }

    const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const {data:report, error} = await supabase
      .from("reports")
      .select("id")
      .eq("project_id", projectId)
      .limit(1)
    
    if (error) {
    return NextResponse.json(
        { error: error.message },
        { status: 500 }
     );
    }

    if (report && report.length > 0) {
        return NextResponse.json({ status: "done" });
      } else {
        return NextResponse.json({ status: "processing" });
    }
}
    
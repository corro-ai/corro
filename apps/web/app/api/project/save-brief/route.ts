import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { opportunityId, contentMd } = await req.json();

    if (!opportunityId || !contentMd) {
      return NextResponse.json(
        { error: "Missing opportunityId or contentMd" },
        { status: 400 }
      );
    }

    // Connect to Supabase using the Service Role Key to bypass row-level security
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Find the current highest version number for this specific PRD
    const { data: latestBrief, error: fetchError } = await supabase
      .from("feature_briefs")
      .select("version")
      .eq("opportunity_id", opportunityId)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    // PGRST116 means 0 rows found (which shouldn't happen, but just in case)
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch latest version: ${fetchError.message}`);
    }

    // 2. Increment the version number
    const nextVersion = latestBrief ? latestBrief.version + 1 : 1;

    // 3. Insert the brand new row! We don't overwrite the old one.
    const { error: insertError } = await supabase
      .from("feature_briefs")
      .insert({
        opportunity_id: opportunityId,
        content_md: contentMd,
        version: nextVersion,
      });

    if (insertError) {
      throw new Error(`Failed to insert new version: ${insertError.message}`);
    }

    return NextResponse.json({ success: true, version: nextVersion });
  } catch (error: any) {
    console.error("Save Brief Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
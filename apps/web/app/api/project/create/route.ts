import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();

    // Securely connect using the Admin Key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Insert the new project and immediately fetch its generated UUID
    const { data, error } = await supabase
      .from("projects")
      .insert({ name, description })
      .select("id")
      .single();

    if (error) throw error;

    // Send the ID back to the frontend
    return NextResponse.json({ projectId: data.id });
    
  } catch (error: any) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
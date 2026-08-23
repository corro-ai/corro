import { NextResponse } from "next/server";
import { inngest } from "../../../../src/inngest/client";

export async function POST(req: Request) {
  try {
    const { projectId, filePath } = await req.json();

    // Fire the exact event that your `processTranscript` function is listening for
    await inngest.send({
      name: "app/transcript.uploaded",
      data: { projectId, filePath }
    });

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error("Failed to trigger inngest:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { inngest } from "../../../../src/inngest/client";

export async function POST(req: NextRequest) {
  try {
    // 1. Read the JSON body the browser sent us
    const { filePath, projectId } = await req.json();

    // 2. Forward it to Inngest as an event
    await inngest.send({
      name: "app/transcript.uploaded",
      data: { filePath, projectId },
    });

    // 3. Tell the browser "got it!"
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Trigger Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

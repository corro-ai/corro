import { NextRequest, NextResponse } from "next/server";
import { ask } from "@corro/qa";

export async function POST(req: NextRequest) {
  try {
    const { question, projectId } = await req.json();

    if (!question || !projectId) {
      return NextResponse.json(
        { error: "Missing question or projectId" },
        { status: 400 }
      );
    }

    const result = await ask(question, projectId);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("QA Error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

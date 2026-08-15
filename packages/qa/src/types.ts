import { RetrievedChunk } from "@corro/retrieval";

export interface Citation {
  index: number;           // [1], [2], etc.
  chunk: RetrievedChunk;   // the actual chunk being cited
}

export interface AnswerResult {
  answer: string;          // the markdown text with [1], [2] citations
  citations: Citation[];   // the map of citation numbers to chunks
  confidence: "high" | "medium" | "low";  // trust indicator
  sourceCount: number;     // how many unique files were cited
}
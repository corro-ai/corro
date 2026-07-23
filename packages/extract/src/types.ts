// What kind of insight can be extracted
export type InsightKind = "pain" | "request" | "praise" | "confusion";

// A single insight extracted from a chunk
export interface Insight {
  kind: InsightKind;
  statement: string;       // One-sentence summary of the insight
  severity: number;         // 1-10, how serious is this
  confidence: number;       // 0.0-1.0, how confident the AI is
  quote: string;            // EXACT verbatim quote from the customer
  chunkId: string;          // Which chunk this insight came from
}

// What extract() returns after processing all chunks
export interface ExtractResult {
  totalInsights: number;
  totalChunksProcessed: number;
  hallucinated: number;     // How many quotes we caught and discarded
  byKind: {
    pain: number;
    request: number;
    praise: number;
    confusion: number;
  };
}
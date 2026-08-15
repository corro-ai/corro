export interface RetrievedChunk {
    id: string;            // chunk ID from the database
    text: string;          // the actual chunk text
    speaker: string;       // who said it
    source_filename: string; // which file it came from
    score: number;         // how relevant (0 to 1, higher = better)
    method: "keyword" | "semantic" | "hybrid"; // how we found it
  }
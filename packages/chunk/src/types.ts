// What we need to save a source file to Supabase
export interface SaveSourceInput {
    projectId: string;       // Which project this file belongs to
    filename: string;        // The original filename
    type: "transcript" | "audio" | "docx" | "txt"; // File type
    metadata?: Record<string, unknown>; // Any extra info
  }
  
  // What comes back after saving a source
  export interface SaveSourceResult {
    sourceId: string;        // The UUID Supabase assigned to this source
  }
  
  // What we need to save one chunk to Supabase
  export interface ChunkInput {
    sourceId: string;        // Which source this chunk belongs to
    speaker: string;         // Who is speaking
    text: string;            // The full text (with ±1 context turns)
    startMs: number;         // When this turn started
    endMs: number;           // When this turn ended
  }
  
  // The final result after chunking a whole file
  export interface ChunkResult {
    sourceId: string;        // The source that was chunked
    totalChunks: number;     // How many chunks were created
  }
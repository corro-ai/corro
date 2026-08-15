export interface Citation {
  index: number;
  chunk: {
    id: string;
    text: string;
    speaker: string;
    source_filename: string;
    score: number;
    method: "keyword" | "semantic" | "hybrid";
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  confidence?: "high" | "medium" | "low";
  sourceCount?: number;
  timestamp: Date;
}

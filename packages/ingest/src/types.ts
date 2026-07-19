// This is the standard format every file parser outputs.
// No matter if the input is a .vtt, .txt, or .docx,
// the output is always a clean array of these "turns".

export interface DialogueTurn {
    speaker: string;       // "Speaker 1", "Interviewer", etc.
    text: string;          // The actual words spoken
    startMs: number;       // When this turn started (in milliseconds)
    endMs: number;         // When this turn ended (in milliseconds)
  }
  
  export interface IngestResult {
    filename: string;
    type: "transcript" | "audio" | "docx" | "txt";
    turns: DialogueTurn[];
    rawText: string;       // The full original text, kept for reference
  }
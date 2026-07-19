export interface WordTimestamp {
    word: string;      // The actual word spoken
    start: number;     // When this word started (in seconds)
    end: number;       // When this word ended (in seconds)
  }
  
  // The full result of transcribing one audio file
  export interface TranscribeResult {
    filename: string;       // Original audio filename
    text: string;           // The complete transcript as one string
    words: WordTimestamp[]; // Every word with its timestamp
    language: string;       // Detected language (e.g. "en", "hi")
    duration: number;       // Total audio duration in seconds
  }
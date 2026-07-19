import Groq from "groq-sdk"
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { TranscribeResult } from "./types";


dotenv.config({path: "../../.env"});

// The audio file formats Groq Whisper supports
const SUPPORTED_FORMATS = [".mp3", ".mp4", ".m4a", ".wav", ".webm", ".ogg"];

// Initialize the Groq client with your API key
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

export async function transcribe(filePath: string): Promise<TranscribeResult> {
    const ext = path.extname(filePath).toLowerCase();
    const filename = path.basename(filePath);

    if(!SUPPORTED_FORMATS.includes(ext)) {
        throw new Error(
            `Unsupported audio format: ${ext}. Supported: ${SUPPORTED_FORMATS.join(", ")}`
          );
    }

      // Check if the file exists
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    console.log(`🎙️ Transcribing ${filename} with Groq Whisper...`);

    const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-large-v3",
        response_format: "verbose_json",
        timestamp_granularities: ["word"],
      }) as any;
      console.log(`✅ Transcription complete! (${transcription.words?.length ?? 0} words)`);
      return {
        filename,
        text: transcription.text,
        words: (transcription.words ?? []).map((w: { word: string; start: number; end: number }) => ({
            word: w.word,
            start: w.start ?? 0,
            end: w.end ?? 0,
          })),
        language: transcription.language ?? "en",
        duration: transcription.duration ?? 0,
      };



}
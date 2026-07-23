import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function run() {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY);
  const data = await response.json();
  if (data.models) {
    const generateModels = data.models.filter((m: any) => m.supportedGenerationMethods.includes('generateContent'));
    console.log(generateModels.map((m: any) => m.name).join('\n'));
  } else {
    console.error(data);
  }
}
run();

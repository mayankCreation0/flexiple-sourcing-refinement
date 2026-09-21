import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set in environment variables. Please add GEMINI_API_KEY to your .env.local file.'
    );
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

export function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  // Remove markdown code fence if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
  }
  return cleaned.trim();
}

/**
 * Executes a Gemini model call with system prompt, user prompt, and JSON mode.
 * Automatically handles retries for transient 429 / 503 errors.
 */
export async function callGeminiJson<T>(
  systemPrompt: string,
  userPrompt: string,
  modelName: string = 'gemini-flash-latest',
  maxRetries: number = 2
): Promise<T> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
    systemInstruction: systemPrompt,
  });

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const text = response.text();
      const cleaned = cleanJsonResponse(text);
      return JSON.parse(cleaned) as T;
    } catch (err: unknown) {
      lastError = err;
      const message = err instanceof Error ? err.message : '';
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? (err as { status?: number }).status
          : undefined;
      const isRateLimit =
        status === 429 ||
        message.includes('429') ||
        message.includes('RESOURCE_EXHAUSTED');
      const isTransient =
        status === 503 ||
        message.includes('503') ||
        message.includes('overloaded');

      if ((isRateLimit || isTransient) && attempt < maxRetries) {
        // Wait with exponential backoff
        const delayMs = Math.pow(2, attempt) * 1500;
        await new Promise((res) => setTimeout(res, delayMs));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

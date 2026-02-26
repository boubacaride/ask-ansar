/**
 * OpenAI LLM client implementation with streaming support.
 *
 * Uses manual fetch + SSE parsing for streaming instead of the OpenAI SDK,
 * because the SDK's streaming relies on browser ReadableStream which doesn't
 * work properly in React Native (causes "Attempted to iterate over a response
 * with no body" error).
 */
import type { LLMClient, LLMRequestOptions, LLMResponse, LLMStreamRequestOptions } from './types';

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 800;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

/** Check the key looks like a real OpenAI key (not a placeholder). */
function isValidKey(key: string | undefined): boolean {
  if (!key) return false;
  if (key.includes('YOUR_') || key.includes('your_') || key.includes('_HERE') || key.length < 20) {
    return false;
  }
  return key.startsWith('sk-');
}

function getApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_OPENAI_API_KEY;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Parse a complete SSE text response (fallback when ReadableStream is not available). */
function parseSSEText(text: string, options: LLMStreamRequestOptions): LLMResponse {
  let fullText = '';
  let model = MODEL;
  let finishReason: string | null = null;

  const lines = text.split('\n');
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const jsonStr = line.slice(6).trim();
    if (!jsonStr || jsonStr === '[DONE]') continue;

    try {
      const event = JSON.parse(jsonStr);
      const delta = event.choices?.[0]?.delta?.content;
      if (delta) {
        fullText += delta;
        options.onToken(delta);
      }
      if (event.model) model = event.model;
      if (event.choices?.[0]?.finish_reason) {
        finishReason = event.choices[0].finish_reason;
      }
    } catch {
      // Skip malformed JSON
    }
  }

  return { text: fullText, model, finishReason };
}

export const openaiClient: LLMClient = {
  name: 'openai',

  isAvailable(): boolean {
    return isValidKey(getApiKey());
  },

  async generate(options: LLMRequestOptions): Promise<LLMResponse> {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI client not configured: missing EXPO_PUBLIC_OPENAI_API_KEY');
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (options.signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        const response = await fetch(OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              { role: 'system', content: options.systemPrompt },
              { role: 'user', content: options.userPrompt },
            ],
            temperature: options.temperature ?? 0.4,
            max_tokens: options.maxTokens ?? 4096,
          }),
          signal: options.signal,
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const choice = data.choices?.[0];

        return {
          text: choice?.message?.content ?? '',
          model: data.model ?? MODEL,
          finishReason: choice?.finish_reason ?? null,
          usage: data.usage
            ? {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens,
              }
            : undefined,
        };
      } catch (err: any) {
        console.warn(`[OpenAI] generate attempt ${attempt} failed:`, err?.message ?? err);
        lastError = err;
        if (err?.name === 'AbortError') throw err;
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
        }
      }
    }

    throw lastError;
  },

  /**
   * Streaming via manual fetch + SSE parsing.
   * This avoids the OpenAI SDK's streaming which doesn't work on React Native.
   */
  async generateStream(options: LLMStreamRequestOptions): Promise<LLMResponse> {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI client not configured: missing EXPO_PUBLIC_OPENAI_API_KEY');
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (options.signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        const response = await fetch(OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              { role: 'system', content: options.systemPrompt },
              { role: 'user', content: options.userPrompt },
            ],
            temperature: options.temperature ?? 0.4,
            max_tokens: options.maxTokens ?? 4096,
            stream: true,
          }),
          signal: options.signal,
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
        }

        // Try to get a stream reader. If not available (some React Native versions),
        // fall back to reading the entire response as text and parsing SSE lines.
        const reader = response.body?.getReader();
        if (!reader) {
          const text = await response.text();
          return parseSSEText(text, options);
        }

        const decoder = new TextDecoder();
        let fullText = '';
        let model = MODEL;
        let finishReason: string | null = null;
        let buffer = '';

        while (true) {
          if (options.signal?.aborted) {
            reader.cancel();
            throw new DOMException('Aborted', 'AbortError');
          }

          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            try {
              const event = JSON.parse(jsonStr);
              const delta = event.choices?.[0]?.delta?.content;
              if (delta) {
                fullText += delta;
                options.onToken(delta);
              }
              if (event.model) model = event.model;
              if (event.choices?.[0]?.finish_reason) {
                finishReason = event.choices[0].finish_reason;
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }

        return { text: fullText, model, finishReason };
      } catch (err: any) {
        console.warn(`[OpenAI] stream attempt ${attempt} failed:`, err?.message ?? err);
        lastError = err;
        if (err?.name === 'AbortError') throw err;
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
        }
      }
    }

    throw lastError;
  },
};

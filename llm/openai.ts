/**
 * OpenAI LLM client implementation with streaming support.
 */
import OpenAI from 'openai';
import type { LLMClient, LLMRequestOptions, LLMResponse, LLMStreamRequestOptions } from './types';

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 800;

/** Check the key looks like a real OpenAI key (not a placeholder). */
function isValidKey(key: string | undefined): boolean {
  if (!key) return false;
  if (key.includes('YOUR_') || key.includes('your_') || key.includes('_HERE') || key.length < 20) {
    return false;
  }
  return key.startsWith('sk-');
}

function createClient(): OpenAI | null {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!isValidKey(apiKey)) return null;
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

const client = createClient();

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const openaiClient: LLMClient = {
  name: 'openai',

  isAvailable(): boolean {
    return client !== null;
  },

  async generate(options: LLMRequestOptions): Promise<LLMResponse> {
    if (!client) {
      throw new Error('OpenAI client not configured: missing EXPO_PUBLIC_OPENAI_API_KEY');
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (options.signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        const completion = await client.chat.completions.create({
          model: 'gpt-5.2',
          messages: [
            { role: 'system', content: options.systemPrompt },
            { role: 'user', content: options.userPrompt },
          ],
          temperature: options.temperature ?? 0.4,
          max_completion_tokens: options.maxTokens ?? 4096,
        });

        const choice = completion.choices[0];
        return {
          text: choice.message.content ?? '',
          model: completion.model,
          finishReason: choice.finish_reason,
          usage: completion.usage
            ? {
                promptTokens: completion.usage.prompt_tokens,
                completionTokens: completion.usage.completion_tokens,
                totalTokens: completion.usage.total_tokens,
              }
            : undefined,
        };
      } catch (err: any) {
        console.error(`[OpenAI] generate attempt ${attempt} failed:`, err?.message ?? err);
        lastError = err;
        if (err?.name === 'AbortError') throw err;
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
        }
      }
    }

    throw lastError;
  },

  async generateStream(options: LLMStreamRequestOptions): Promise<LLMResponse> {
    if (!client) {
      throw new Error('OpenAI client not configured: missing EXPO_PUBLIC_OPENAI_API_KEY');
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (options.signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        const stream = await client.chat.completions.create({
          model: 'gpt-5.2',
          messages: [
            { role: 'system', content: options.systemPrompt },
            { role: 'user', content: options.userPrompt },
          ],
          temperature: options.temperature ?? 0.4,
          max_completion_tokens: options.maxTokens ?? 4096,
          stream: true,
        });

        let fullText = '';
        let model = 'gpt-5.2';
        let finishReason: string | null = null;

        for await (const chunk of stream) {
          if (options.signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
          }
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            options.onToken(delta);
          }
          if (chunk.model) model = chunk.model;
          if (chunk.choices[0]?.finish_reason) {
            finishReason = chunk.choices[0].finish_reason;
          }
        }

        return {
          text: fullText,
          model,
          finishReason,
        };
      } catch (err: any) {
        console.error(`[OpenAI] stream attempt ${attempt} failed:`, err?.message ?? err);
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

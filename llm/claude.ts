/**
 * Claude (Anthropic) LLM client implementation with streaming via SSE.
 */
import type { LLMClient, LLMRequestOptions, LLMResponse, LLMStreamRequestOptions } from './types';

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 800;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

function getApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
}

/** Check the key looks like a real Anthropic key (not a placeholder). */
function isValidKey(key: string | undefined): boolean {
  if (!key) return false;
  // Reject obvious placeholders
  if (key.includes('YOUR_') || key.includes('your_') || key.includes('_HERE') || key.length < 20) {
    return false;
  }
  return key.startsWith('sk-ant-');
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const claudeClient: LLMClient = {
  name: 'claude',

  isAvailable(): boolean {
    return isValidKey(getApiKey());
  },

  async generate(options: LLMRequestOptions): Promise<LLMResponse> {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('Claude client not configured: missing EXPO_PUBLIC_ANTHROPIC_API_KEY');
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (options.signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        const response = await fetch(ANTHROPIC_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: options.maxTokens ?? 4096,
            temperature: options.temperature ?? 0.4,
            system: options.systemPrompt,
            messages: [
              { role: 'user', content: options.userPrompt },
            ],
          }),
          signal: options.signal,
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          throw new Error(`Anthropic API error ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const textBlock = data.content?.find((b: any) => b.type === 'text');

        return {
          text: textBlock?.text ?? '',
          model: data.model ?? 'claude-sonnet-4',
          finishReason: data.stop_reason ?? null,
          usage: data.usage
            ? {
                promptTokens: data.usage.input_tokens,
                completionTokens: data.usage.output_tokens,
                totalTokens: data.usage.input_tokens + data.usage.output_tokens,
              }
            : undefined,
        };
      } catch (err: any) {
        console.error(`[Claude] generate attempt ${attempt} failed:`, err?.message ?? err);
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
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('Claude client not configured: missing EXPO_PUBLIC_ANTHROPIC_API_KEY');
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (options.signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        const response = await fetch(ANTHROPIC_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: options.maxTokens ?? 4096,
            temperature: options.temperature ?? 0.4,
            system: options.systemPrompt,
            stream: true,
            messages: [
              { role: 'user', content: options.userPrompt },
            ],
          }),
          signal: options.signal,
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          throw new Error(`Anthropic API error ${response.status}: ${errorBody}`);
        }

        // Parse SSE stream
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let fullText = '';
        let model = 'claude-sonnet-4';
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

              if (event.type === 'content_block_delta' && event.delta?.text) {
                fullText += event.delta.text;
                options.onToken(event.delta.text);
              }
              if (event.type === 'message_start' && event.message?.model) {
                model = event.message.model;
              }
              if (event.type === 'message_delta' && event.delta?.stop_reason) {
                finishReason = event.delta.stop_reason;
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }

        return { text: fullText, model, finishReason };
      } catch (err: any) {
        console.error(`[Claude] stream attempt ${attempt} failed:`, err?.message ?? err);
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

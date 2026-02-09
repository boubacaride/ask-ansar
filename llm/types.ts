/**
 * Shared types for the LLM abstraction layer.
 */

export interface LLMResponse {
  text: string;
  model: string;
  finishReason: string | null;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

export interface LLMStreamRequestOptions extends LLMRequestOptions {
  onToken: (token: string) => void;
}

export interface LLMClient {
  name: string;
  generate(options: LLMRequestOptions): Promise<LLMResponse>;
  generateStream?(options: LLMStreamRequestOptions): Promise<LLMResponse>;
  isAvailable(): boolean;
}

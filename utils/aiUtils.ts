import OpenAI from 'openai';
import { KNOWLEDGE_SOURCES } from '@/app/api/chat';
import { supabase } from '@/utils/supabase';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface AIResponse {
  text: string;
  source?: string;
  confidence: number;
  references: string[];
}

export async function generateDualAIResponse(query: string): Promise<{
  response: string;
  source: string;
  arabicText?: string;
  translation?: string;
  references: string[];
}> {
  try {
    // First, search our vetted knowledge base
    const { data: knowledgeData } = await supabase
      .from('islamic_content')
      .select('*')
      .textSearch('content', query, {
        config: 'english',
        type: 'websearch'
      })
      .limit(3);

    // Generate context from knowledge base
    const context = knowledgeData?.map(item => ({
      content: item.content,
      source: item.url,
      type: item.type
    }));

    // Get responses from both AI models
    const [gptResponse, deepseekResponse] = await Promise.all([
      generateGPTResponse(query, context),
      generateDeepSeekResponse(query, context)
    ]);

    // Compare responses for alignment
    const alignment = await checkAlignment(gptResponse.text, deepseekResponse.text);

    if (alignment.aligned) {
      // Use the response with higher confidence
      const finalResponse = gptResponse.confidence > deepseekResponse.confidence
        ? gptResponse
        : deepseekResponse;

      return {
        response: finalResponse.text,
        source: finalResponse.source || 'AI Analysis',
        references: finalResponse.references,
      };
    } else {
      // If responses don't align, provide a referenced answer from our knowledge base
      const referencedResponse = await generateReferencedResponse(query, context);
      return {
        response: referencedResponse.text,
        source: 'Verified Islamic Sources',
        references: referencedResponse.references,
      };
    }
  } catch (error) {
    console.error('Error generating dual AI response:', error);
    throw error;
  }
}

async function generateGPTResponse(query: string, context: any[]): Promise<AIResponse> {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are an Islamic knowledge assistant. Use only the provided verified sources to answer questions. Always cite sources and maintain strict accuracy.`
      },
      {
        role: "user",
        content: `Context: ${JSON.stringify(context)}\n\nQuestion: ${query}`
      }
    ],
    temperature: 0.7,
  });

  return {
    text: completion.choices[0].message.content || '',
    confidence: completion.choices[0].finish_reason === 'stop' ? 0.9 : 0.7,
    references: extractReferences(completion.choices[0].message.content || ''),
  };
}

async function generateDeepSeekResponse(query: string, context: any[]): Promise<AIResponse> {
  // Implementation would be similar to GPT but using DeepSeek's API
  // For now, we'll simulate it
  return {
    text: "Simulated DeepSeek response",
    confidence: 0.85,
    references: [],
  };
}

async function checkAlignment(response1: string, response2: string): Promise<{
  aligned: boolean;
  confidence: number;
}> {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Compare two Islamic responses and determine if they align in their core message and Islamic principles. Return a JSON object with 'aligned' (boolean) and 'confidence' (number 0-1)."
      },
      {
        role: "user",
        content: `Response 1: ${response1}\n\nResponse 2: ${response2}`
      }
    ]
  });

  try {
    const result = JSON.parse(completion.choices[0].message.content || '{"aligned":false,"confidence":0}');
    return result;
  } catch {
    return { aligned: false, confidence: 0 };
  }
}

async function generateReferencedResponse(query: string, context: any[]): Promise<AIResponse> {
  const relevantSources = KNOWLEDGE_SOURCES.filter(source => 
    context.some(ctx => ctx.source.includes(source.url))
  );

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Create a response using only the provided verified sources. Include clear references and citations.`
      },
      {
        role: "user",
        content: `Context: ${JSON.stringify(context)}\n\nQuestion: ${query}`
      }
    ]
  });

  return {
    text: completion.choices[0].message.content || '',
    confidence: 0.95,
    references: relevantSources.map(s => s.url),
  };
}

function extractReferences(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}
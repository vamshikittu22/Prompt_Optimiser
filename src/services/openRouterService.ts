import { GeminiResponse, OpenRouterResponse, OpenRouterModel } from '../types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const FREE_MODELS: OpenRouterModel[] = [
  {
    id: 'qwen/qwen-2-7b-instruct:free',
    name: 'Qwen 2 7B Instruct',
    description: 'Fast and efficient 7B parameter model'
  },
  {
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    name: 'Phi-3 Mini 128K',
    description: 'Microsoft\'s compact but powerful model'
  },
  {
    id: 'microsoft/phi-3-medium-128k-instruct:free',
    name: 'Phi-3 Medium 128K',
    description: 'Balanced performance and efficiency'
  },
  {
    id: 'google/gemma-7b-it:free',
    name: 'Gemma 7B IT',
    description: 'Google\'s instruction-tuned model'
  },
  {
    id: 'meta-llama/llama-3-8b-instruct:free',
    name: 'Llama 3 8B Instruct',
    description: 'Meta\'s latest instruction-following model'
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B Instruct',
    description: 'Efficient and capable instruction model'
  }
];

export class OpenRouterService {
  private static validateApiKey(): boolean {
    return !!OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_api_key_here';
  }

  static async generateClarifyingQuestions(idea: string, instructions: string, selectedModel: string): Promise<GeminiResponse> {
    if (!this.validateApiKey()) {
      return { status: 'error', error: 'OpenRouter API key missing' };
    }

    const systemPrompt = `You are a professional prompt engineer. Your task is to generate 3-6 clarifying questions to refine a user's raw idea into an optimized AI prompt.

Based on the user's idea and instructions, generate questions that cover:
- Target audience
- Tone/style (formal, casual, persuasive, storytelling, etc.)
- Level of detail/length
- Keywords/constraints
- Output format
- Examples if relevant

Return your response as a JSON object with this exact format:
{
  "status": "success",
  "clarifyingQuestions": [
    "Question 1",
    "Question 2", 
    "Question 3"
  ]
}

User's Instructions: ${instructions}
User's Idea: ${idea}`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Prompt Optimizer'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'user',
              content: systemPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        return { status: 'error', error: `OpenRouter API error: ${response.status}` };
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        return { status: 'error', error: 'No response from OpenRouter AI' };
      }

      const responseText = data.choices[0].message.content;
      
      try {
        const parsedResponse = JSON.parse(responseText);
        return parsedResponse;
      } catch {
        // Fallback if JSON parsing fails
        return {
          status: 'success',
          clarifyingQuestions: [
            'Who is the target audience for this prompt?',
            'What tone and style should the AI use?',
            'What is the desired length or format?',
            'Should the AI provide examples or illustrations?',
            'Are there specific keywords or constraints to include?'
          ]
        };
      }
    } catch (error) {
      return { status: 'error', error: `Network error: ${error}` };
    }
  }

  static async generateOptimizedPrompts(
    idea: string, 
    instructions: string, 
    answeredQuestions: Array<{ question: string; answer: string }>,
    selectedModels: string[]
  ): Promise<GeminiResponse> {
    if (!this.validateApiKey()) {
      return { status: 'error', error: 'OpenRouter API key missing' };
    }

    const clarifications = answeredQuestions
      .map(q => `Q: ${q.question}\nA: ${q.answer}`)
      .join('\n\n');

    const systemPrompt = `You are a professional prompt engineer. Create an optimized, AI-ready prompt using the template pattern below.

## Prompt Template Pattern:
Role: <Define AI's role clearly>
Task: <Define what to produce/do>
Context: <Background or scenario if needed>
Constraints:
- <Constraint 1>
- <Constraint 2>
Style/Tone: <Formal, Conversational, Persuasive, etc.>
Audience: <Who will receive the output>
Format: <Headings, bullet points, JSON, essay, etc.>
Mandatory Details / Keywords: <Words or themes that must appear>

<Integrated version of the user's idea, instructions, and clarifications>

## Inputs:
User's Original Idea: ${idea}
Overarching Instructions: ${instructions}
Clarifications: ${clarifications}

Return your response as a JSON object with this exact format:
{
  "status": "success",
  "optimizedPrompt": "The final optimized prompt here following the template pattern"
}

Make the prompt clear, structured, unambiguous, and easy for an AI to follow.`;

    try {
      const results = await Promise.all(
        selectedModels.map(async (model) => {
          const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.origin,
              'X-Title': 'Prompt Optimizer'
            },
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: 'user',
                  content: systemPrompt
                }
              ],
              temperature: 0.7,
              max_tokens: 2000
            })
          });

          if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
          }

          const data: OpenRouterResponse = await response.json();
          
          if (!data.choices || data.choices.length === 0) {
            throw new Error('No response from OpenRouter AI');
          }

          const responseText = data.choices[0].message.content;
          
          try {
            const parsedResponse = JSON.parse(responseText);
            return {
              model: FREE_MODELS.find(m => m.id === model)?.name || model,
              optimizedPrompt: parsedResponse.optimizedPrompt || responseText
            };
          } catch {
            return {
              model: FREE_MODELS.find(m => m.id === model)?.name || model,
              optimizedPrompt: responseText
            };
          }
        })
      );

      return {
        status: 'success',
        results: results
      };
    } catch (error) {
      return { status: 'error', error: `Network error: ${error}` };
    }
  }
}
import { GeminiResponse, OpenRouterResponse, OpenRouterModel } from '../types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const FREE_MODELS: OpenRouterModel[] = [
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B Instruct',
    description: 'Efficient and capable instruction model',
    provider: 'openrouter'
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'LLaMA 3.2 3B',
    description: 'Meta\'s open-source language model',
    provider: 'openrouter'
  },
  {
    id: 'huggingface/zephyr-7b-beta:free',
    name: 'Zephyr 7B (HuggingFace)',
    description: 'Fine-tuned for helpful conversations',
    provider: 'openrouter'
  },
  {
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    name: 'Phi-3 Mini 128K',
    description: 'Microsoft\'s compact but powerful model',
    provider: 'openrouter'
  },
  {
    id: 'google/gemma-2-9b-it:free',
    name: 'Gemma 2 9B IT',
    description: 'Google\'s instruction-tuned model',
    provider: 'openrouter'
  },
  {
    id: 'openchat/openchat-7b:free',
    name: 'OpenChat 7B (Open Source)',
    description: 'Open-source conversational AI model',
    provider: 'openrouter'
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

For each question, provide 3-5 suggested answer options that users can select from.

Return your response as a JSON object with this exact format:
{
  "status": "success",
  "clarifyingQuestions": [
    {
      "text": "Question 1",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    },
    {
      "text": "Question 2", 
      "options": ["Option A", "Option B", "Option C"]
    }
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
            {
              text: 'Who is the target audience for this prompt?',
              options: ['General audience', 'Technical professionals', 'Students', 'Business executives', 'Creative professionals']
            },
            {
              text: 'What tone and style should the AI use?',
              options: ['Professional/Formal', 'Conversational/Casual', 'Persuasive', 'Educational', 'Creative/Storytelling']
            },
            {
              text: 'What is the desired length or format?',
              options: ['Brief summary', 'Detailed explanation', 'Step-by-step guide', 'Bullet points', 'Essay format']
            },
            {
              text: 'Should the AI provide examples or illustrations?',
              options: ['Yes, with examples', 'Yes, with analogies', 'No examples needed', 'Visual descriptions', 'Case studies']
            }
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
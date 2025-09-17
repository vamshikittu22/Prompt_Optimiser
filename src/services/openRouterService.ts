import { GeminiResponse, OpenRouterResponse, OpenRouterModel } from '../types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const FREE_MODELS: OpenRouterModel[] = [
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B Instruct',
<<<<<<< HEAD
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
=======
    description: 'Fast and efficient open-source model from Mistral AI'
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'LLaMA 3.2 3B Instruct',
    description: 'Meta\'s latest open-source language model'
>>>>>>> d623e9558103fe2b87c1ef0d030ac7f83d4db259
  },
  {
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    name: 'Phi-3 Mini 128K',
<<<<<<< HEAD
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
=======
    description: 'Microsoft\'s compact but powerful model with large context'
  },
  {
    id: 'huggingface/zephyr-7b-beta:free',
    name: 'Zephyr 7B Beta',
    description: 'HuggingFace fine-tuned model for helpful conversations'
  },
  {
    id: 'google/gemma-2-9b-it:free',
    name: 'Gemma 2 9B Instruct',
    description: 'Google\'s open-source instruction-tuned model'
  },
  {
    id: 'openchat/openchat-7b:free',
    name: 'OpenChat 7B',
    description: 'Open-source conversational AI model'
>>>>>>> d623e9558103fe2b87c1ef0d030ac7f83d4db259
  }
];

export class OpenRouterService {
  private static validateApiKey(): boolean {
    return !!OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_api_key_here';
  }

  static async generatePromptingStyles(idea: string, instructions: string, selectedModel: string): Promise<GeminiResponse> {
    if (!this.validateApiKey()) {
      return { status: 'error', error: 'OpenRouter API key missing' };
    }

    const systemPrompt = `You are a professional prompt engineer. Analyze the user's idea and instructions, then recommend the 2-3 most relevant prompting styles from this list:

[Instruction-based, Role/Persona, Format-Constrained, Few-shot, Zero-shot, Chain-of-Thought, Socratic, Storytelling, Roleplay, Hypothetical, Critique & Improve, Iterative Refinement]

For each recommended style, provide:
1. A 1-2 sentence explanation in plain language
2. A short example snippet showing how it would apply to this specific idea

Return your response as a JSON object with this exact format:
{
  "status": "success",
  "suggestedStyles": [
    {
      "id": "role-persona",
      "name": "Role/Persona",
      "explanation": "The AI takes on a specific role or character to provide more targeted responses.",
      "example": "You are an experienced travel blogger who writes engaging, personal stories about destinations..."
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
          suggestedStyles: [
            {
              id: 'instruction-based',
              name: 'Instruction-based',
              explanation: 'Clear, direct instructions that tell the AI exactly what to do.',
              example: 'Write a comprehensive travel guide for...'
            },
            {
              id: 'role-persona',
              name: 'Role/Persona',
              explanation: 'The AI takes on a specific role or character to provide more targeted responses.',
              example: 'You are an experienced travel blogger who...'
            }
          ]
        };
      }
    } catch (error) {
      return { status: 'error', error: `Network error: ${error}` };
    }
  }

  static async generateClarifyingQuestions(idea: string, instructions: string, selectedModel: string): Promise<GeminiResponse> {
    if (!this.validateApiKey()) {
      return { status: 'error', error: 'OpenRouter API key missing' };
    }

    const systemPrompt = `You are a professional prompt engineer. Generate 5-6 highly specific clarifying questions tailored to this user's exact idea and instructions. These questions must be custom and relevant, not generic templates.

Examples of good custom questions:
- If idea is "travel blog generator" → ask about tone (casual vs professional), content length, target audience
- If idea is "math tutor roleplay" → ask about subject, grade level, step-by-step reasoning
- If idea is "creative writing assistant" → ask about genre, writing style, character development focus

For each question, provide 3-5 specific answer options that users can select from (they can select multiple or add custom text).

Return your response as a JSON object with this exact format:
{
  "status": "success",
  "clarifyingQuestions": [
    {
      "text": "What specific tone should the content have?",
      "options": ["Professional and informative", "Casual and conversational", "Enthusiastic and inspiring", "Humorous and entertaining"]
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
              text: 'What specific tone should the content have?',
              options: ['Professional and informative', 'Casual and conversational', 'Enthusiastic and inspiring', 'Humorous and entertaining']
            },
            {
              text: 'What level of detail is needed?',
              options: ['Brief overview', 'Detailed explanation', 'Comprehensive guide', 'Quick reference']
            },
            {
              text: 'Who is the primary audience?',
              options: ['Beginners', 'Intermediate users', 'Experts', 'General public']
            },
            {
              text: 'What format should the output use?',
              options: ['Structured paragraphs', 'Bullet points', 'Step-by-step list', 'Q&A format']
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
    appliedStyles: string[],
    selectedModels: string[]
  ): Promise<GeminiResponse> {
    if (!this.validateApiKey()) {
      return { status: 'error', error: 'OpenRouter API key missing' };
    }

    const clarifications = answeredQuestions
      .map(q => `Q: ${q.question}\nA: ${q.answer}`)
      .join('\n\n');

    const stylesText = appliedStyles.length > 0 ? appliedStyles.join(', ') : 'General instruction-based';

    const systemPrompt = `You are a professional prompt engineer. Create an optimized, AI-ready prompt that explicitly incorporates these prompting styles: ${stylesText}

Use this template pattern:

Role: <Define AI's role clearly>
Task: <Define what to produce/do>
Context: <Background or scenario if needed>
Style Application: <How the chosen styles are applied>
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
Applied Styles: ${stylesText}
Clarifications: ${clarifications}

Return your response as a JSON object with this exact format:
{
  "status": "success",
  "optimizedPrompt": "The final optimized prompt here following the template pattern",
  "appliedStyles": ${JSON.stringify(appliedStyles)}
}

Make the prompt clear, structured, unambiguous, and explicitly incorporate the chosen prompting styles.`;

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
              optimizedPrompt: parsedResponse.optimizedPrompt || responseText,
              appliedStyles: parsedResponse.appliedStyles || appliedStyles
            };
          } catch {
            return {
              model: FREE_MODELS.find(m => m.id === model)?.name || model,
              optimizedPrompt: responseText,
              appliedStyles: appliedStyles
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
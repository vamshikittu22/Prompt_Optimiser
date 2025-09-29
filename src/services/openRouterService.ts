import { GeminiResponse, OpenRouterModel } from '../types';

const API_BASE = '/api';

export const FREE_MODELS: OpenRouterModel[] = [
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B Instruct', description: 'Fast and efficient open-source model' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'LLaMA 3.2 3B Instruct', description: "Meta's open-source language model" },
  { id: 'microsoft/phi-3-mini-128k-instruct:free', name: 'Phi-3 Mini 128K', description: "Microsoft's compact instruction model" },
  { id: 'huggingface/zephyr-7b-beta:free', name: 'Zephyr 7B Beta', description: 'Fine-tuned for helpful conversations' },
  { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B Instruct', description: "Google's instruction-tuned model" },
  { id: 'openchat/openchat-7b:free', name: 'OpenChat 7B', description: 'Open-source conversational model' },
];

export class OpenRouterService {
  static async generatePromptingStyles(idea: string, instructions: string, selectedModel: string): Promise<GeminiResponse> {
    try {
      const resp = await fetch(`${API_BASE}/styles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'openrouter', idea, instructions, selectedModel })
      });
      return await resp.json() as GeminiResponse;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { status: 'error', error: `Network error: ${msg}` };
    }
  }

  static async generateClarifyingQuestions(idea: string, instructions: string, selectedModel: string): Promise<GeminiResponse> {
    try {
      const resp = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'openrouter', idea, instructions, selectedModel })
      });
      return await resp.json() as GeminiResponse;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { status: 'error', error: `Network error: ${msg}` };
    }
  }

  static async generateOptimizedPrompts(
    idea: string,
    instructions: string,
    answeredQuestions: Array<{ question: string; answer: string }>,
    appliedStyles: string[],
    selectedModels: string[]
  ): Promise<GeminiResponse> {
    try {
      const resp = await fetch(`${API_BASE}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'openrouter',
          idea,
          instructions,
          answeredQuestions: (answeredQuestions || []).map(q => ({ text: q.question, answer: q.answer })),
          appliedStyles: { primary: appliedStyles?.[0] || 'instruction', modifier: appliedStyles?.[1] },
          selectedModels
        })
      });
      return await resp.json() as GeminiResponse;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { status: 'error', error: `Network error: ${msg}` };
    }
  }
}
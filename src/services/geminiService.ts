// src/services/geminiService.ts
import { GeminiResponse } from '../types';

const API_BASE = '/api';

export class GeminiService {
  static async generateClarifyingQuestions(
    idea: string, 
    instructions: string, 
    selectedModel: string = 'gemini-pro'
  ): Promise<GeminiResponse> {
    try {
      console.log('[GeminiService] Sending request to /api/questions');
      
      const response = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          provider: 'gemini',
          idea,
          instructions,
          selectedModel
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[GeminiService] Error:', error);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
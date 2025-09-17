export interface Question {
  id: number;
  text: string;
  options?: string[];
  selectedOptions: string[];
  answer: string;
}

export interface PromptingStyle {
  id: string;
  name: string;
  explanation: string;
  example: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
}

export interface OptimizedResult {
  model: string;
  optimizedPrompt: string;
  appliedStyles?: string[];
}

export interface QuestionWithOptions {
  text: string;
  options: string[];
}

export interface GeminiResponse {
  status: 'success' | 'error';
  suggestedStyles?: PromptingStyle[];
  clarifyingQuestions?: QuestionWithOptions[];
  optimizedPrompt?: string;
  appliedStyles?: string[];
  results?: OptimizedResult[];
  error?: string;
}

export interface GeminiApiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface OpenRouterResponse {
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
}
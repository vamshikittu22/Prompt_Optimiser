export interface Question {
  id: number;
  text: string;
  options?: string[];
  selectedOptions: string[];
  answer: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
}

export interface OptimizedResult {
  model: string;
  optimizedPrompt: string;
}

export interface QuestionWithOptions {
  text: string;
  options: string[];
}

export interface GeminiResponse {
  status: 'success' | 'error';
  clarifyingQuestions?: QuestionWithOptions[];
  optimizedPrompt?: string;
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
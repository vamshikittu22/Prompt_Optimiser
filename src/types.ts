export interface Question {
  id: number;
  text: string;
  answer: string;
}

export interface GeminiResponse {
  status: 'success' | 'error';
  clarifyingQuestions?: string[];
  optimizedPrompt?: string;
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
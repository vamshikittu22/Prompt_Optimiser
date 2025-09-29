// Mock data for UI-only MVP v1

export interface PromptStyle {
  id: string;
  name: string;
  description: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  type: 'dropdown' | 'radio';
  options: string[];
  answer: string;
}

export const PROMPT_STYLES: PromptStyle[] = [
  {
    id: 'creative',
    name: 'Creative & Conversational',
    description: 'Natural, engaging tone with creative suggestions'
  },
  {
    id: 'technical',
    name: 'Technical & Precise',
    description: 'Detailed, accurate, and structured approach'
  },
  {
    id: 'stepbystep',
    name: 'Step-by-Step Instructions',
    description: 'Clear sequential guidance with numbered steps'
  },
  {
    id: 'questionbased',
    name: 'Question-Based Approach',
    description: 'Interactive prompts that ask clarifying questions'
  },
  {
    id: 'roleplaying',
    name: 'Role-Playing Scenario',
    description: 'Assume a specific role or perspective'
  }
];

export const CLARIFYING_QUESTIONS: ClarifyingQuestion[] = [
  {
    id: 'audience',
    question: "What's your target audience?",
    type: 'dropdown',
    options: ['General', 'Technical', 'Beginner'],
    answer: ''
  },
  {
    id: 'length',
    question: 'Desired output length?',
    type: 'dropdown',
    options: ['Short', 'Medium', 'Detailed'],
    answer: ''
  },
  {
    id: 'tone',
    question: 'Tone preference?',
    type: 'dropdown',
    options: ['Professional', 'Casual', 'Friendly'],
    answer: ''
  }
];

// Mock function to generate optimized prompt based on selections
export const generateMockOptimizedPrompt = (
  idea: string,
  instructions: string,
  selectedStyles: string[],
  answers: Record<string, string>
): string => {
  const audience = answers.audience || 'General';
  const length = answers.length || 'Medium';
  const tone = answers.tone || 'Professional';

  // Build optimized prompt based on selections
  let optimizedPrompt = `# Optimized Prompt\n\n`;
  
  // Add role/context if roleplaying style selected
  if (selectedStyles.includes('roleplaying')) {
    optimizedPrompt += `## Role & Context\nYou are an expert assistant specializing in ${idea}. `;
    optimizedPrompt += `Approach this task with a ${tone.toLowerCase()} tone suitable for a ${audience.toLowerCase()} audience.\n\n`;
  }

  // Add main objective
  optimizedPrompt += `## Objective\n${instructions}\n\n`;

  // Add idea/task description
  optimizedPrompt += `## Task Description\n${idea}\n\n`;

  // Add constraints based on selections
  optimizedPrompt += `## Requirements\n`;
  
  if (selectedStyles.includes('stepbystep')) {
    optimizedPrompt += `- Provide clear, numbered step-by-step instructions\n`;
  }
  
  if (selectedStyles.includes('technical')) {
    optimizedPrompt += `- Include technical details and precise specifications\n`;
    optimizedPrompt += `- Use industry-standard terminology\n`;
  }
  
  if (selectedStyles.includes('creative')) {
    optimizedPrompt += `- Use creative and engaging language\n`;
    optimizedPrompt += `- Include examples and analogies where appropriate\n`;
  }
  
  if (selectedStyles.includes('questionbased')) {
    optimizedPrompt += `- Ask clarifying questions before providing solutions\n`;
    optimizedPrompt += `- Ensure understanding of requirements\n`;
  }

  optimizedPrompt += `- Target audience: ${audience}\n`;
  optimizedPrompt += `- Output length: ${length}\n`;
  optimizedPrompt += `- Tone: ${tone}\n\n`;

  // Add output format
  optimizedPrompt += `## Expected Output Format\n`;
  
  if (length === 'Short') {
    optimizedPrompt += `Provide a concise response (1-2 paragraphs or key bullet points).\n`;
  } else if (length === 'Medium') {
    optimizedPrompt += `Provide a comprehensive response with main sections and supporting details.\n`;
  } else {
    optimizedPrompt += `Provide a detailed, in-depth response with examples, explanations, and additional context.\n`;
  }

  // Add closing
  optimizedPrompt += `\n## Additional Notes\n`;
  optimizedPrompt += `Please ensure the response is well-structured, easy to understand, and directly addresses the task at hand.`;

  return optimizedPrompt;
};

// Mock delay to simulate API call
export const mockDelay = (ms: number = 800): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

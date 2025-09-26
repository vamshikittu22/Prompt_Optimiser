import { TaskManager } from '../utils/fileUtils';

const PROMPT_STYLES = [
  {
    id: 'instruction',
    name: 'Instruction-based',
    description: 'Direct, clear instructions for specific outputs',
    isModifier: false
  },
  {
    id: 'role',
    name: 'Role/Persona',
    description: 'AI assumes a specific role or expertise',
    isModifier: false
  },
  {
    id: 'format',
    name: 'Format-Constrained',
    description: 'Specific format requirements for the output',
    isModifier: false
  },
  {
    id: 'fewshot',
    name: 'Few-shot',
    description: 'Provides examples of desired output',
    isModifier: true
  },
  {
    id: 'cot',
    name: 'Chain-of-Thought',
    description: 'Shows step-by-step reasoning',
    isModifier: true
  },
  {
    id: 'socratic',
    name: 'Socratic',
    description: 'Asks questions to guide thinking',
    isModifier: true
  }
];

export class PromptService {
  static recommendStyles(_idea: string, _instructions: string): any[] {
    // In a real implementation, this would use an AI model to recommend styles
    // For now, we'll return a subset of styles based on the input length
    const primaryStyles = PROMPT_STYLES.filter(s => !s.isModifier);
    return primaryStyles.slice(0, 3);
  }

  static generateClarifyingQuestions(taskId: string, _idea: string, _instructions: string): any[] {
    // In a real implementation, this would use an AI model to generate questions
    const questions = [
      {
        id: 'goal',
        text: 'What is the primary goal of your prompt?',
        options: ['Generate content', 'Analyze data', 'Solve a problem', 'Other']
      },
      {
        id: 'audience',
        text: 'Who is the intended audience?',
        options: ['Technical experts', 'General public', 'Business professionals', 'Students']
      },
      {
        id: 'tone',
        text: 'What tone would you prefer?',
        options: ['Formal', 'Conversational', 'Persuasive', 'Instructive']
      },
      {
        id: 'format',
        text: 'What is the desired output format?',
        options: ['Bullet points', 'Paragraphs', 'JSON', 'Markdown']
      },
      {
        id: 'constraints',
        text: 'Are there any specific constraints?',
        options: ['Word limit', 'Technical level', 'Citation requirements', 'None']
      }
    ];

    TaskManager.logProgress(
      taskId,
      'Generated clarifying questions',
      { questions }
    );

    return questions;
  }

  static generateOptimizedPrompt(taskId: string, task: any): string {
    const { idea, instructions, styles, clarifyingQuestions = [] } = task;
    
    const primaryStyle = PROMPT_STYLES.find(s => s.id === styles?.primary);
    const modifierStyle = styles?.modifier ? PROMPT_STYLES.find(s => s.id === styles.modifier) : null;

    const answers: Record<string, any> = {};
    clarifyingQuestions.forEach((q: any) => {
      answers[q.id] = q.answer;
    });

    const prompt = `# Optimized Prompt

## Role
${answers.audience ? `AI Assistant for ${answers.audience}` : 'AI Assistant'}

## Task
${instructions || 'Generate content based on the following idea:'}
${idea}

## Style
- Primary: ${primaryStyle?.name || 'Not specified'}
${modifierStyle ? `- Modifier: ${modifierStyle.name}\n` : ''}

## Context
Based on your inputs:
${Object.entries(answers).map(([key, value]) => 
  `- ${key}: ${Array.isArray(value) ? value.join(', ') : value}`
).join('\n')}

## Instructions
1. Follow the ${primaryStyle?.name} style for the response${modifierStyle ? ` with elements of ${modifierStyle.name}` : ''}
2. Consider the context provided above
3. Generate output that meets the specified requirements
4. Format the output as: ${answers.format || 'Markdown'}
5. Use a ${answers.tone || 'neutral'} tone`;

    TaskManager.logProgress(
      taskId,
      'Generated optimized prompt',
      { prompt }
    );

    return prompt;
  }
}

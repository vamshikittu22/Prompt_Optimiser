import { PromptEngineer, safeJsonParse } from './promptUtils';
import fs from 'fs';
import path from 'path';

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
    id: 'cot',
    name: 'Chain-of-Thought',
    description: 'Shows step-by-step reasoning',
    isModifier: true
  },
  {
    id: 'fewshot',
    name: 'Few-shot',
    description: 'Provides examples of desired output',
    isModifier: true
  },
  {
    id: 'socratic',
    name: 'Socratic',
    description: 'Asks questions to guide thinking',
    isModifier: true
  }
];

export class PromptWorkflow {
  private task: PromptEngineer;

  constructor(taskTitle: string, taskDescription: string) {
    this.task = new PromptEngineer(taskTitle, taskDescription);
  }

  async start() {
    try {
      await this.task.startTask();
      
      // Step 1: Recommend styles
      const styles = this.recommendStyles();
      console.log('Recommended styles:', styles);
      
      // In a real implementation, you would get user input here
      // For now, we'll simulate selecting the first style
      await this.task.setStyle(styles[0].id);
      
      // Step 2: Generate clarifying questions
      const questions = this.generateClarifyingQuestions();
      console.log('Clarifying questions:', questions);
      
      // Simulate answering questions
      for (const q of questions) {
        const answer = 'Sample answer'; // In real app, get from user
        await this.task.addClarifyingQuestion(q, answer);
      }
      
      // Step 3: Generate optimized prompt
      const prompt = await this.generateOptimizedPrompt();
      console.log('Generated prompt:', prompt);
      
      // Step 4: Complete the task
      await this.task.completeTask();
      
      return {
        taskId: this.task.getTaskId(),
        prompt,
        metadata: this.task.getMetadata()
      };
    } catch (error) {
      await this.task.failTask(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private recommendStyles() {
    // Simple implementation - in reality, this would analyze the task
    return PROMPT_STYLES
      .filter(style => !style.isModifier)
      .slice(0, 3); // Return max 3 primary styles
  }

  private generateClarifyingQuestions(): string[] {
    // These would be generated based on the task
    return [
      'What is the primary goal of your prompt?',
      'Who is the intended audience?',
      'What tone would you prefer?',
      'What is the desired output format?',
      'Are there any specific constraints?'
    ];
  }

  private async generateOptimizedPrompt(): Promise<string> {
    const metadata = this.task.getMetadata();
    const style = PROMPT_STYLES.find(s => s.id === metadata.styles.primary);
    
    return `# Optimized Prompt

## Role
AI Assistant

## Task
${metadata.description}

## Style
- Primary: ${style?.name || 'Not specified'}
${metadata.styles.modifier ? `- Modifier: ${metadata.styles.modifier}\n` : ''}
## Context
Based on your inputs:
${metadata.clarifyingQuestions.map((q, i) => `- ${q.question}: ${q.answer}`).join('\n')}

## Instructions
1. Follow the ${style?.name} style for the response
2. Consider the context provided above
3. Generate output that meets the specified requirements`;
  }
}

// Example usage
// const workflow = new PromptWorkflow('Sample Task', 'Generate a blog post about AI');
// workflow.start().then(console.log).catch(console.error);

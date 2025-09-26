import fs from 'fs';
import path from 'path';

const MEMORY_BANK = path.join(__dirname, '..', 'memorybank');

type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

interface TaskMetadata {
  id: string;
  timestamp: string;
  status: TaskStatus;
  title: string;
  description: string;
  styles: {
    primary: string | null;
    modifier: string | null;
  };
  clarifyingQuestions: Array<{
    question: string;
    answer: string | string[];
  }>;
  progress: string[];
  error?: string;
}

export class PromptEngineer {
  private taskId: string;
  private taskPath: string;
  private progressPath: string;
  private metadata: TaskMetadata;

  constructor(taskTitle: string, taskDescription: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    this.taskId = `task_${timestamp}`;
    this.taskPath = path.join(MEMORY_BANK, `task_${timestamp}.json`);
    this.progressPath = path.join(MEMORY_BANK, `progress_${timestamp}.md`);
    
    this.metadata = {
      id: this.taskId,
      timestamp: new Date().toISOString(),
      status: 'pending',
      title: taskTitle,
      description: taskDescription,
      styles: {
        primary: null,
        modifier: null
      },
      clarifyingQuestions: [],
      progress: []
    };

    this.ensureMemoryBankExists();
  }

  private ensureMemoryBankExists() {
    if (!fs.existsSync(MEMORY_BANK)) {
      fs.mkdirSync(MEMORY_BANK, { recursive: true });
    }
  }

  private async logProgress(entry: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `## [${timestamp}] ${entry}\n\n`;
    
    // Append to progress markdown
    fs.appendFileSync(this.progressPath, logEntry);
    
    // Update metadata
    this.metadata.progress.push(entry);
    this.saveMetadata();
  }

  private saveMetadata() {
    fs.writeFileSync(
      this.taskPath,
      JSON.stringify(this.metadata, null, 2),
      'utf-8'
    );
  }

  async startTask() {
    this.metadata.status = 'in-progress';
    await this.logProgress('Task started');
    this.saveMetadata();
  }

  async addClarifyingQuestion(question: string, answer: string | string[]) {
    this.metadata.clarifyingQuestions.push({ question, answer });
    await this.logProgress(`Added clarifying question: ${question}`);
    this.saveMetadata();
  }

  async setStyle(primary: string, modifier?: string) {
    this.metadata.styles.primary = primary;
    if (modifier) {
      this.metadata.styles.modifier = modifier;
    }
    await this.logProgress(`Style set: Primary=${primary}, Modifier=${modifier || 'none'}`);
    this.saveMetadata();
  }

  async completeTask() {
    this.metadata.status = 'completed';
    await this.logProgress('Task completed successfully');
    this.saveMetadata();
  }

  async failTask(error: string) {
    this.metadata.status = 'failed';
    this.metadata.error = error;
    await this.logProgress(`Task failed: ${error}`);
    this.saveMetadata();
  }

  getTaskId() {
    return this.taskId;
  }

  getMetadata() {
    return { ...this.metadata };
  }
}

// Utility function to safely parse JSON
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    const timestamp = new Date().toISOString();
    const errorLog = `[${timestamp}] JSON Parse Error: ${error}\nInput: ${jsonString}\n\n`;
    const errorLogPath = path.join(MEMORY_BANK, 'parse_errors.log');
    fs.appendFileSync(errorLogPath, errorLog);
    return fallback;
  }
}

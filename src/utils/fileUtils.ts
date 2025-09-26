// Browser-compatible file utilities using localStorage
const STORAGE_KEY = 'prompt_optimizer_tasks';

// Initialize storage if it doesn't exist
if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks: {}, progress: {} }));
}

const getStorage = () => {
  if (typeof window === 'undefined') {
    throw new Error('LocalStorage is only available in browser environment');
  }
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{ "tasks": {}, "progress": {} }');
};

const saveStorage = (data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export interface Task {
  id: string;
  timestamp: string;
  idea: string;
  instructions: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  styles?: {
    primary: string | null;
    modifier: string | null;
  };
  clarifyingQuestions?: Array<{
    question: string;
    answer: string | string[];
  }>;
  optimizedPrompt?: string;
  error?: string;
}

export class TaskManager {
  static createTask(idea: string, instructions: string): string {
    const storage = getStorage();
    const taskId = `task_${Date.now()}`;
    
    const task: Task = {
      id: taskId,
      timestamp: new Date().toISOString(),
      idea,
      instructions,
      status: 'pending',
      styles: {
        primary: null,
        modifier: null
      }
    };

    storage.tasks[taskId] = task;
    saveStorage(storage);
    return taskId;
  }

  static updateTask(taskId: string, updates: Partial<Task>): void {
    const storage = getStorage();
    if (!storage.tasks[taskId]) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    storage.tasks[taskId] = { ...storage.tasks[taskId], ...updates };
    saveStorage(storage);
  }

  static logProgress(taskId: string, message: string, data?: any): void {
    const storage = getStorage();
    const timestamp = new Date().toISOString();
    const logEntry = `## ${timestamp}\n${message}${data ? '\n```json\n' + JSON.stringify(data, null, 2) + '\n```' : ''}\n\n`;
    
    if (!storage.progress[taskId]) {
      storage.progress[taskId] = '';
    }
    
    storage.progress[taskId] = logEntry + storage.progress[taskId];
    saveStorage(storage);
  }

  static getTask(taskId: string): Task {
    const storage = getStorage();
    const task = storage.tasks[taskId];
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    return task;
  }

  static getAllTasks(): Task[] {
    const storage = getStorage();
    return Object.values(storage.tasks) as Task[];
  }
}

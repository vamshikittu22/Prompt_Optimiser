// Storage utilities for prompt history and saved styles

export interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  appliedStyles: string[];
  timestamp: string;
  isFavorite: boolean;
  idea: string;
  instructions: string;
  clarifyingQuestions: Array<{
    id: string;
    text: string;
    answer: string;
  }>;
}

export interface SavedStyle {
  id: string;
  name: string;
  explanation: string;
  example: string;
  usageCount: number;
  lastUsed: string;
}

const STORAGE_KEYS = {
  PROMPTS: 'prompt_optimizer_saved_prompts',
  STYLES: 'prompt_optimizer_saved_styles',
  SETTINGS: 'prompt_optimizer_settings'
} as const;

// Prompt History Management
export const promptStorage = {
  // Get all saved prompts
  getAll(): SavedPrompt[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROMPTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading saved prompts:', error);
      return [];
    }
  },

  // Save a new prompt
  save(prompt: Omit<SavedPrompt, 'id' | 'timestamp'>): SavedPrompt {
    const newPrompt: SavedPrompt = {
      ...prompt,
      id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    const existing = this.getAll();
    const updated = [newPrompt, ...existing];
    
    try {
      localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(updated));
      return newPrompt;
    } catch (error) {
      console.error('Error saving prompt:', error);
      throw error;
    }
  },

  // Update an existing prompt
  update(id: string, updates: Partial<SavedPrompt>): boolean {
    const prompts = this.getAll();
    const index = prompts.findIndex(p => p.id === id);
    
    if (index === -1) return false;
    
    prompts[index] = { ...prompts[index], ...updates };
    
    try {
      localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
      return true;
    } catch (error) {
      console.error('Error updating prompt:', error);
      return false;
    }
  },

  // Delete a prompt
  delete(id: string): boolean {
    const prompts = this.getAll();
    const filtered = prompts.filter(p => p.id !== id);
    
    if (filtered.length === prompts.length) return false;
    
    try {
      localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting prompt:', error);
      return false;
    }
  },

  // Toggle favorite status
  toggleFavorite(id: string): boolean {
    const prompts = this.getAll();
    const prompt = prompts.find(p => p.id === id);
    
    if (!prompt) return false;
    
    return this.update(id, { isFavorite: !prompt.isFavorite });
  },

  // Get favorites only
  getFavorites(): SavedPrompt[] {
    return this.getAll().filter(p => p.isFavorite);
  },

  // Search prompts
  search(query: string): SavedPrompt[] {
    const prompts = this.getAll();
    const lowercaseQuery = query.toLowerCase();
    
    return prompts.filter(prompt => 
      prompt.title.toLowerCase().includes(lowercaseQuery) ||
      prompt.prompt.toLowerCase().includes(lowercaseQuery) ||
      prompt.idea.toLowerCase().includes(lowercaseQuery)
    );
  }
};

// Style Management
export const styleStorage = {
  // Get all saved styles
  getAll(): SavedStyle[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STYLES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading saved styles:', error);
      return [];
    }
  },

  // Save a new style
  save(style: Omit<SavedStyle, 'id' | 'usageCount' | 'lastUsed'>): SavedStyle {
    const newStyle: SavedStyle = {
      ...style,
      id: `style_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      usageCount: 0,
      lastUsed: new Date().toISOString()
    };

    const existing = this.getAll();
    const updated = [newStyle, ...existing];
    
    try {
      localStorage.setItem(STORAGE_KEYS.STYLES, JSON.stringify(updated));
      return newStyle;
    } catch (error) {
      console.error('Error saving style:', error);
      throw error;
    }
  },

  // Increment usage count
  incrementUsage(id: string): boolean {
    const styles = this.getAll();
    const index = styles.findIndex(s => s.id === id);
    
    if (index === -1) return false;
    
    styles[index] = {
      ...styles[index],
      usageCount: styles[index].usageCount + 1,
      lastUsed: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(STORAGE_KEYS.STYLES, JSON.stringify(styles));
      return true;
    } catch (error) {
      console.error('Error updating style usage:', error);
      return false;
    }
  },

  // Get most used styles
  getMostUsed(limit: number = 5): SavedStyle[] {
    return this.getAll()
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }
};

// Settings Management
export const settingsStorage = {
  // Get settings
  get(): Record<string, any> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  },

  // Save settings
  save(settings: Record<string, any>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },

  // Get a specific setting
  getSetting(key: string, defaultValue: any = null): any {
    const settings = this.get();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  },

  // Set a specific setting
  setSetting(key: string, value: any): void {
    const settings = this.get();
    settings[key] = value;
    this.save(settings);
  }
};

// Utility functions
export const generatePromptTitle = (idea: string, instructions: string): string => {
  const ideaWords = idea.split(' ').slice(0, 3).join(' ');
  const instructionWords = instructions.split(' ').slice(0, 2).join(' ');
  return `${ideaWords} - ${instructionWords}`.substring(0, 50);
};

export const exportPrompt = (prompt: SavedPrompt, format: 'json' | 'txt'): string => {
  if (format === 'json') {
    return JSON.stringify(prompt, null, 2);
  } else {
    return `# ${prompt.title}\n\n${prompt.prompt}\n\n---\nApplied Styles: ${prompt.appliedStyles.join(', ')}\nCreated: ${prompt.timestamp}`;
  }
};

export const importPrompts = (data: string): SavedPrompt[] => {
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error('Error importing prompts:', error);
    return [];
  }
};

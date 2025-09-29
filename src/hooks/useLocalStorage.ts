import { useState, useEffect } from 'react';

export interface SavedPrompt {
  id: string;
  title: string;
  idea: string;
  instructions: string;
  selectedStyles: string[];
  answers: Record<string, string>;
  optimizedPrompt: string;
  timestamp: number;
}

const STORAGE_KEY = 'prompt_optimizer_history';

export function useLocalStorage() {
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const prompts = JSON.parse(stored);
        setSavedPrompts(prompts);
      }
    } catch (error) {
      console.error('Error loading prompts from localStorage:', error);
    }
  };

  const savePrompt = (prompt: Omit<SavedPrompt, 'id' | 'timestamp'>): SavedPrompt => {
    const newPrompt: SavedPrompt = {
      ...prompt,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    const updatedPrompts = [newPrompt, ...savedPrompts];
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrompts));
      setSavedPrompts(updatedPrompts);
      return newPrompt;
    } catch (error) {
      console.error('Error saving prompt to localStorage:', error);
      throw error;
    }
  };

  const deletePrompt = (id: string) => {
    const updatedPrompts = savedPrompts.filter(p => p.id !== id);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrompts));
      setSavedPrompts(updatedPrompts);
    } catch (error) {
      console.error('Error deleting prompt from localStorage:', error);
    }
  };

  const getPrompt = (id: string): SavedPrompt | undefined => {
    return savedPrompts.find(p => p.id === id);
  };

  const clearAll = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSavedPrompts([]);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  return {
    savedPrompts,
    savePrompt,
    deletePrompt,
    getPrompt,
    clearAll,
    loadPrompts
  };
}

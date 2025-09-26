import React, { useState, useEffect } from 'react';
import { TaskManager } from '../utils/fileUtils';
import { PromptService } from '../services/promptService';

interface PromptWorkflowProps {
  taskId?: string;
  onComplete?: (taskId: string) => void;
}

export const PromptWorkflow: React.FC<PromptWorkflowProps> = ({ taskId: initialTaskId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [taskId, setTaskId] = useState(initialTaskId);
  const [task, setTask] = useState<any>(null);
  const [idea, setIdea] = useState('');
  const [instructions, setInstructions] = useState('');
  const [suggestedStyles, setSuggestedStyles] = useState<any[]>([]);
  const [selectedStyles, setSelectedStyles] = useState({
    primary: '',
    modifier: ''
  });
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [optimizedPrompt, setOptimizedPrompt] = useState('');

  // Initialize or load task
  useEffect(() => {
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  const loadTask = () => {
    if (!taskId) return;
    
    try {
      const loadedTask = TaskManager.getTask(taskId);
      setTask(loadedTask);
      setIdea(loadedTask.idea);
      setInstructions(loadedTask.instructions);
      
      if (loadedTask.status === 'completed') {
        setCurrentStep(4); // Show final prompt
        setOptimizedPrompt(loadedTask.optimizedPrompt || '');
      }
    } catch (error) {
      console.error('Error loading task:', error);
    }
  };

  const createNewTask = () => {
    if (!idea.trim()) return;
    
    const newTaskId = TaskManager.createTask(idea, instructions);
    setTaskId(newTaskId);
    setCurrentStep(2);
    
    // Generate style recommendations
    const styles = PromptService.recommendStyles(idea, instructions);
    setSuggestedStyles(styles);
    
    TaskManager.logProgress(
      newTaskId,
      'Started new prompt engineering task',
      { idea, instructions }
    );
  };

  const handleStyleSelect = (styleId: string, isModifier = false) => {
    const updates: any = { styles: { ...selectedStyles } };
    
    if (isModifier) {
      updates.styles.modifier = selectedStyles.modifier === styleId ? '' : styleId;
    } else {
      updates.styles.primary = styleId;
      // Only allow one primary style
      if (selectedStyles.primary !== styleId) {
        updates.styles.modifier = '';
      }
    }
    
    setSelectedStyles(updates.styles);
    
    if (taskId) {
      TaskManager.updateTask(taskId, updates);
      TaskManager.logProgress(
        taskId,
        `Selected ${isModifier ? 'modifier' : 'primary'} style: ${styleId}`,
        updates
      );
    }
  };

  const generateQuestions = () => {
    if (!taskId) return;
    
    const generatedQuestions = PromptService.generateClarifyingQuestions(taskId, idea, instructions);
    setQuestions(generatedQuestions);
    setCurrentStep(3);
    
    // Initialize answers
    const initialAnswers: Record<string, any> = {};
    generatedQuestions.forEach((q: any) => {
      initialAnswers[q.id] = '';
    });
    setAnswers(initialAnswers);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const generateOptimizedPrompt = () => {
    if (!taskId) return;
    
    const updatedTask = {
      ...task,
      styles: selectedStyles,
      clarifyingQuestions: questions.map((q: any) => ({
        ...q,
        answer: answers[q.id] || ''
      }))
    };
    
    const prompt = PromptService.generateOptimizedPrompt(taskId, updatedTask);
    setOptimizedPrompt(prompt);
    
    // Update task status
    TaskManager.updateTask(taskId, {
      ...updatedTask,
      optimizedPrompt: prompt,
      status: 'completed'
    });
    
    setCurrentStep(4);
    onComplete?.(taskId);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Start a New Prompt</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Your Idea or Topic</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={3}
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe what you want to achieve with this prompt..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Specific Instructions (Optional)</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any specific requirements or constraints..."
              />
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={createNewTask}
              disabled={!idea.trim()}
            >
              Start Optimizing
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Select Prompting Styles</h2>
            <div>
              <h3 className="text-lg font-semibold mb-3">Primary Style (Required)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedStyles.map((style) => (
                  <div
                    key={style.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedStyles.primary === style.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleStyleSelect(style.id)}
                  >
                    <h4 className="font-medium">{style.name}</h4>
                    <p className="text-sm text-gray-600">{style.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Optional Modifier</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PROMPT_STYLES.filter(s => s.isModifier).map((style) => (
                  <div
                    key={style.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedStyles.modifier === style.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleStyleSelect(style.id, true)}
                  >
                    <h4 className="font-medium">{style.name}</h4>
                    <p className="text-sm text-gray-600">{style.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                className="text-blue-500 hover:underline"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                onClick={generateQuestions}
                disabled={!selectedStyles.primary}
              >
                Continue to Questions
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Clarifying Questions</h2>
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <label className="block font-medium">{question.text}</label>
                  <div className="space-y-2">
                    {question.options ? (
                      <div className="flex flex-wrap gap-2">
                        {question.options.map((option: string) => (
                          <button
                            key={option}
                            className={`px-3 py-1.5 text-sm rounded-full border ${
                              answers[question.id] === option
                                ? 'bg-blue-100 border-blue-500 text-blue-700'
                                : 'bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => handleAnswer(question.id, option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        placeholder="Type your answer..."
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                className="text-blue-500 hover:underline"
                onClick={() => setCurrentStep(2)}
              >
                Back
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                onClick={generateOptimizedPrompt}
                disabled={Object.values(answers).some(a => !a)}
              >
                Generate Optimized Prompt
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Optimized Prompt</h2>
              <button
                className="text-blue-500 hover:underline flex items-center gap-1"
                onClick={() => {
                  navigator.clipboard.writeText(optimizedPrompt);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy to Clipboard
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <pre className="whitespace-pre-wrap font-sans">{optimizedPrompt}</pre>
            </div>

            <div className="flex justify-between pt-4">
              <button
                className="text-blue-500 hover:underline"
                onClick={() => setCurrentStep(3)}
              >
                Back to Questions
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setCurrentStep(1);
                  setIdea('');
                  setInstructions('');
                  setSelectedStyles({ primary: '', modifier: '' });
                  setAnswers({});
                  setOptimizedPrompt('');
                }}
              >
                Create New Prompt
              </button>
            </div>
          </div>
        );

      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      {!taskId || !task ? (
        renderStep()
      ) : (
        <>
          <div className="flex justify-between mb-6 pb-2 border-b">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                <span className="text-xs mt-1">
                  {["Start", "Styles", "Questions", "Prompt"][step - 1]}
                </span>
              </div>
            ))}
          </div>
          
          {renderStep()}
        </>
      )}
    </div>
  );
};

// Move this to a separate file if needed
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

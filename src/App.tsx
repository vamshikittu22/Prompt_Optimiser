import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Step1UserInput } from './components/Step1UserInput';
import { Step2ClarificationStyles } from './components/Step2ClarificationStyles';
import { Step3OptimizedPrompt } from './components/Step3OptimizedPrompt';
import { HistorySidebar } from './components/HistorySidebar';
import { Footer } from './components/Footer';
import { promptStorage, generatePromptTitle, SavedPrompt } from './utils/storageUtils';

type Step = 'step1' | 'step2' | 'step3';

interface PromptingStyle {
  id: string;
  name: string;
  explanation: string;
  example: string;
}

interface ClarifyingQuestion {
  id: string;
  text: string;
  options?: string[];
  answer: string;
  type: 'text' | 'radio';
}

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
}

const AVAILABLE_MODELS: ModelInfo[] = [
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google AI' },
  { id: 'openrouter/google/gemini-pro', name: 'Gemini Pro', provider: 'OpenRouter' },
  { id: 'openrouter/anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'OpenRouter' },
  { id: 'openrouter/mistralai/mistral-7b-instruct', name: 'Mistral 7B', provider: 'OpenRouter' },
  { id: 'openrouter/meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B', provider: 'OpenRouter' }
];

function App() {
  // Main state
  const [currentStep, setCurrentStep] = useState<Step>('step1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Model and API configuration
  const [selectedModel, setSelectedModel] = useState(import.meta.env.VITE_DEFAULT_MODEL || 'gemini-pro');
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);

  // Step 1: User Input
  const [idea, setIdea] = useState('');
  const [instructions, setInstructions] = useState('');

  // Step 2: Clarification & Styles
  const [suggestedStyles, setSuggestedStyles] = useState<PromptingStyle[]>([]);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  // Step 3: Optimized Prompt
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [appliedStyles, setAppliedStyles] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // History sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

  // Load saved prompts on mount
  useEffect(() => {
    setSavedPrompts(promptStorage.getAll());
  }, []);

  // Load API key from localStorage or environment variables
  useEffect(() => {
    const modelKey = `${selectedModel.replace(/[^a-z0-9]/gi, '_')}_api_key`;
    const savedKey = localStorage.getItem(modelKey) || '';
    
    // Get environment variable API key as fallback
    let envApiKey = '';
    if (selectedModel.includes('gemini')) {
      envApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    } else if (selectedModel.includes('openrouter')) {
      envApiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    } else if (selectedModel.includes('anthropic')) {
      envApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
    } else if (selectedModel.includes('openai')) {
      envApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    }
    
    const effectiveKey = savedKey || envApiKey;
    setApiKey(effectiveKey);
    setIsApiKeyValid(effectiveKey.length > 0);
  }, [selectedModel]);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setError('');
  };

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    setIsApiKeyValid(key.length > 0);
    setError('');
  };

  const handleSaveSettings = () => {
    const modelKey = `${selectedModel.replace(/[^a-z0-9]/gi, '_')}_api_key`;
    localStorage.setItem(modelKey, apiKey);
    setIsApiKeyValid(true);
  };

  const handleGenerateSuggestions = async () => {
    if (!idea.trim() || !instructions.trim()) {
      setError('Please fill in both idea and instructions');
      return;
    }

    // Check if we have a valid API key from any source
    const hasApiKey = Boolean(
      apiKey || 
      (selectedModel.includes('gemini') && import.meta.env.VITE_GEMINI_API_KEY) ||
      (selectedModel.includes('openrouter') && import.meta.env.VITE_OPENROUTER_API_KEY) ||
      (selectedModel.includes('anthropic') && import.meta.env.VITE_ANTHROPIC_API_KEY) ||
      (selectedModel.includes('openai') && import.meta.env.VITE_OPENAI_API_KEY)
    );
    
    if (!hasApiKey) {
      setError('Please enter an API key or configure one in the .env file');
      return;
    }

      setIsLoading(true);
    setError('');

    try {
      // Get the effective API key (user input or environment variable)
      const effectiveApiKey = apiKey || 
        (selectedModel.includes('gemini') && import.meta.env.VITE_GEMINI_API_KEY) ||
        (selectedModel.includes('openrouter') && import.meta.env.VITE_OPENROUTER_API_KEY) ||
        (selectedModel.includes('anthropic') && import.meta.env.VITE_ANTHROPIC_API_KEY) ||
        (selectedModel.includes('openai') && import.meta.env.VITE_OPENAI_API_KEY) ||
        '';

      // Generate prompting styles and clarifying questions directly
      let response;
      if (selectedModel.includes('openrouter')) {
        // OpenRouter API call
        const openRouterKey = effectiveApiKey || import.meta.env.VITE_OPENROUTER_API_KEY;
        if (!openRouterKey) {
          throw new Error('OpenRouter API key not found');
        }
        
        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Prompt Optimizer',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: selectedModel.replace('openrouter/', ''),
            messages: [
              {
                role: 'user',
                content: `Generate prompting styles and clarifying questions for this idea: "${idea}" with instructions: "${instructions}". Return as JSON with suggestedStyles and clarifyingQuestions arrays.`
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        });
        
        if (!openRouterResponse.ok) {
          throw new Error(`OpenRouter API error: ${openRouterResponse.status}`);
        }
        
        const openRouterData = await openRouterResponse.json();
        const content = openRouterData.choices?.[0]?.message?.content || '{}';
        
        try {
          response = JSON.parse(content);
        } catch {
          // Fallback if JSON parsing fails
          response = {
            status: 'success',
            suggestedStyles: [
              {
                id: 'instruction',
                name: 'Instruction-based',
                explanation: 'Direct, clear instructions for the AI',
                example: 'Write a blog post about sustainable living. Include 3 main points and a conclusion.'
              }
            ],
            clarifyingQuestions: [
              {
                id: '1',
                text: 'What specific details should be included?',
                type: 'text',
                options: [],
                answer: ''
              },
              {
                id: '2',
                text: 'What is the target audience?',
                type: 'radio',
                options: ['General public', 'Technical audience', 'Business professionals', 'Students'],
                answer: ''
              }
            ]
          };
        }
      } else {
        // Gemini API call
        const geminiKey = effectiveApiKey || import.meta.env.VITE_GEMINI_API_KEY;
        if (!geminiKey) {
          throw new Error('Gemini API key not found');
        }
        
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate prompting styles and clarifying questions for this idea: "${idea}" with instructions: "${instructions}". Return as JSON with suggestedStyles and clarifyingQuestions arrays.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        });
        
        if (!geminiResponse.ok) {
          throw new Error(`Gemini API error: ${geminiResponse.status}`);
        }
        
        const geminiData = await geminiResponse.json();
        const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        
        try {
          response = JSON.parse(content);
        } catch {
          // Fallback if JSON parsing fails
          response = {
            status: 'success',
            suggestedStyles: [
              {
                id: 'instruction',
                name: 'Instruction-based',
                explanation: 'Direct, clear instructions for the AI',
                example: 'Write a blog post about sustainable living. Include 3 main points and a conclusion.'
              }
            ],
            clarifyingQuestions: [
              {
                id: '1',
                text: 'What specific details should be included?',
                type: 'text',
                options: [],
                answer: ''
              },
              {
                id: '2',
                text: 'What is the target audience?',
                type: 'radio',
                options: ['General public', 'Technical audience', 'Business professionals', 'Students'],
                answer: ''
              }
            ]
          };
        }
      }

      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to generate suggestions');
      }

      // Set the generated data
      if (response.suggestedStyles) {
        setSuggestedStyles(response.suggestedStyles);
      }
      if (response.clarifyingQuestions) {
        setClarifyingQuestions(response.clarifyingQuestions);
      }

      setCurrentStep('step2');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStyleToggle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const handleQuestionAnswer = (questionId: string, answer: string) => {
    setClarifyingQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, answer } : q)
    );
  };

  const handleSaveAndContinue = async () => {
    if (selectedStyles.length === 0) {
      setError('Please select at least one prompting style');
      return;
    }

    const allQuestionsAnswered = clarifyingQuestions.every(q => q.answer.trim().length > 0);
    if (!allQuestionsAnswered) {
      setError('Please answer all clarifying questions');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Generate optimized prompt
      const answeredQuestions = clarifyingQuestions.map(q => ({
        question: q.text,
        answer: q.answer
      }));

      // Get the effective API key
      const effectiveApiKey = apiKey || 
        (selectedModel.includes('gemini') && import.meta.env.VITE_GEMINI_API_KEY) ||
        (selectedModel.includes('openrouter') && import.meta.env.VITE_OPENROUTER_API_KEY) ||
        (selectedModel.includes('anthropic') && import.meta.env.VITE_ANTHROPIC_API_KEY) ||
        (selectedModel.includes('openai') && import.meta.env.VITE_OPENAI_API_KEY) ||
        '';

      let optimizedPrompt = '';
      
      if (selectedModel.includes('openrouter')) {
        // OpenRouter API call for optimized prompt
        const openRouterKey = effectiveApiKey || import.meta.env.VITE_OPENROUTER_API_KEY;
        if (!openRouterKey) {
          throw new Error('OpenRouter API key not found');
        }
        
        const prompt = `Create an optimized prompt based on:
Idea: "${idea}"
Instructions: "${instructions}"
Selected Styles: ${selectedStyles.join(', ')}
Answered Questions: ${answeredQuestions.map(q => `${q.question}: ${q.answer}`).join(', ')}

Generate a well-structured, optimized prompt that incorporates all the information above.`;

        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Prompt Optimizer',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: selectedModel.replace('openrouter/', ''),
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1000
          })
        });
        
        if (!openRouterResponse.ok) {
          throw new Error(`OpenRouter API error: ${openRouterResponse.status}`);
        }
        
        const openRouterData = await openRouterResponse.json();
        optimizedPrompt = openRouterData.choices?.[0]?.message?.content || 'Failed to generate prompt';
      } else {
        // Gemini API call for optimized prompt
        const geminiKey = effectiveApiKey || import.meta.env.VITE_GEMINI_API_KEY;
        if (!geminiKey) {
          throw new Error('Gemini API key not found');
        }
        
        const prompt = `Create an optimized prompt based on:
Idea: "${idea}"
Instructions: "${instructions}"
Selected Styles: ${selectedStyles.join(', ')}
Answered Questions: ${answeredQuestions.map(q => `${q.question}: ${q.answer}`).join(', ')}

Generate a well-structured, optimized prompt that incorporates all the information above.`;

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        });
        
        if (!geminiResponse.ok) {
          throw new Error(`Gemini API error: ${geminiResponse.status}`);
        }
        
        const geminiData = await geminiResponse.json();
        optimizedPrompt = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate prompt';
      }

      setOptimizedPrompt(optimizedPrompt);
      setAppliedStyles(selectedStyles);
      setCurrentStep('step3');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    setError('');

    try {
      const answeredQuestions = clarifyingQuestions.map(q => ({
        question: q.text,
        answer: q.answer
      }));

      // Get the effective API key
      const effectiveApiKey = apiKey || 
        (selectedModel.includes('gemini') && import.meta.env.VITE_GEMINI_API_KEY) ||
        (selectedModel.includes('openrouter') && import.meta.env.VITE_OPENROUTER_API_KEY) ||
        (selectedModel.includes('anthropic') && import.meta.env.VITE_ANTHROPIC_API_KEY) ||
        (selectedModel.includes('openai') && import.meta.env.VITE_OPENAI_API_KEY) ||
        '';

      let optimizedPrompt = '';
      
      if (selectedModel.includes('openrouter')) {
        // OpenRouter API call for optimized prompt
        const openRouterKey = effectiveApiKey || import.meta.env.VITE_OPENROUTER_API_KEY;
        if (!openRouterKey) {
          throw new Error('OpenRouter API key not found');
        }
        
        const prompt = `Create an optimized prompt based on:
Idea: "${idea}"
Instructions: "${instructions}"
Selected Styles: ${selectedStyles.join(', ')}
Answered Questions: ${answeredQuestions.map(q => `${q.question}: ${q.answer}`).join(', ')}

Generate a well-structured, optimized prompt that incorporates all the information above.`;

        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Prompt Optimizer',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: selectedModel.replace('openrouter/', ''),
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1000
          })
        });
        
        if (!openRouterResponse.ok) {
          throw new Error(`OpenRouter API error: ${openRouterResponse.status}`);
        }
        
        const openRouterData = await openRouterResponse.json();
        optimizedPrompt = openRouterData.choices?.[0]?.message?.content || 'Failed to generate prompt';
        } else {
        // Gemini API call for optimized prompt
        const geminiKey = effectiveApiKey || import.meta.env.VITE_GEMINI_API_KEY;
        if (!geminiKey) {
          throw new Error('Gemini API key not found');
        }
        
        const prompt = `Create an optimized prompt based on:
Idea: "${idea}"
Instructions: "${instructions}"
Selected Styles: ${selectedStyles.join(', ')}
Answered Questions: ${answeredQuestions.map(q => `${q.question}: ${q.answer}`).join(', ')}

Generate a well-structured, optimized prompt that incorporates all the information above.`;

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        });
        
        if (!geminiResponse.ok) {
          throw new Error(`Gemini API error: ${geminiResponse.status}`);
        }
        
        const geminiData = await geminiResponse.json();
        optimizedPrompt = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate prompt';
      }

      setOptimizedPrompt(optimizedPrompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep('step1');
    setIdea('');
    setInstructions('');
    setSuggestedStyles([]);
    setClarifyingQuestions([]);
    setSelectedStyles([]);
    setOptimizedPrompt('');
    setAppliedStyles([]);
    setError('');
  };

  const handleSaveToHistory = () => {
    const title = generatePromptTitle(idea, instructions);
    const savedPrompt = promptStorage.save({
      title,
      prompt: optimizedPrompt,
      appliedStyles,
      isFavorite: false,
      idea,
      instructions,
      clarifyingQuestions: clarifyingQuestions.map(q => ({
        id: q.id,
        text: q.text,
        answer: q.answer
      }))
    });

    setSavedPrompts(prev => [savedPrompt, ...prev]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLoadPrompt = (prompt: SavedPrompt) => {
    setIdea(prompt.idea);
    setInstructions(prompt.instructions);
    setOptimizedPrompt(prompt.prompt);
    setAppliedStyles(prompt.appliedStyles);
    setClarifyingQuestions(prompt.clarifyingQuestions.map(q => ({
      id: q.id,
      text: q.text,
      answer: q.answer,
      type: 'text' as const
    })));
    setCurrentStep('step3');
    setIsSidebarOpen(false);
  };

  const handleDeletePrompt = (id: string) => {
    if (promptStorage.delete(id)) {
      setSavedPrompts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleToggleFavorite = (id: string) => {
    if (promptStorage.toggleFavorite(id)) {
      setSavedPrompts(prev => 
        prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
      );
    }
  };

  const getModelProvider = () => {
    const model = AVAILABLE_MODELS.find(m => m.id === selectedModel);
    return model?.provider || 'Unknown';
  };

  const getEffectiveApiKey = () => {
    return apiKey || 
      (selectedModel.includes('gemini') && import.meta.env.VITE_GEMINI_API_KEY) ||
      (selectedModel.includes('openrouter') && import.meta.env.VITE_OPENROUTER_API_KEY) ||
      (selectedModel.includes('anthropic') && import.meta.env.VITE_ANTHROPIC_API_KEY) ||
      (selectedModel.includes('openai') && import.meta.env.VITE_OPENAI_API_KEY) ||
      '';
  };

  const isUsingEnvKey = () => {
    return !apiKey && Boolean(
      (selectedModel.includes('gemini') && import.meta.env.VITE_GEMINI_API_KEY) ||
      (selectedModel.includes('openrouter') && import.meta.env.VITE_OPENROUTER_API_KEY) ||
      (selectedModel.includes('anthropic') && import.meta.env.VITE_ANTHROPIC_API_KEY) ||
      (selectedModel.includes('openai') && import.meta.env.VITE_OPENAI_API_KEY)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
        onSaveSettings={handleSaveSettings}
        isApiKeyValid={isApiKeyValid}
        isUsingEnvKey={isUsingEnvKey()}
        availableModels={AVAILABLE_MODELS}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* History Sidebar */}
        <HistorySidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          savedPrompts={savedPrompts}
          onLoadPrompt={handleLoadPrompt}
          onDeletePrompt={handleDeletePrompt}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Main Workspace */}
        <main className="flex-1 p-6 lg:ml-0">
          <div className="max-w-4xl mx-auto">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
                    </div>
                  )}

            {/* Step 1: User Input */}
            {currentStep === 'step1' && (
              <Step1UserInput
                idea={idea}
                instructions={instructions}
                onIdeaChange={setIdea}
                onInstructionsChange={setInstructions}
                onGenerate={handleGenerateSuggestions}
                isLoading={isLoading}
              />
            )}

            {/* Step 2: Clarification & Styles */}
            {currentStep === 'step2' && (
              <Step2ClarificationStyles
                suggestedStyles={suggestedStyles}
                clarifyingQuestions={clarifyingQuestions}
                selectedStyles={selectedStyles}
                onStyleToggle={handleStyleToggle}
                onQuestionAnswer={handleQuestionAnswer}
                onSaveAndContinue={handleSaveAndContinue}
                isLoading={isLoading}
              />
            )}

            {/* Step 3: Optimized Prompt */}
            {currentStep === 'step3' && (
              <Step3OptimizedPrompt
                optimizedPrompt={optimizedPrompt}
                appliedStyles={appliedStyles}
                onRegenerate={handleRegenerate}
                onStartOver={handleStartOver}
                onSaveToHistory={handleSaveToHistory}
                isLoading={isLoading}
                isSaved={isSaved}
              />
            )}
              </div>
        </main>
            </div>

      {/* Footer */}
      <Footer
        selectedModel={selectedModel}
        modelProvider={getModelProvider()}
        version="1.0.0"
      />
    </div>
  );
}

export default App;
import React, { useState } from 'react';
<<<<<<< HEAD
import { Lightbulb, MessageSquare, CheckCircle, Copy, RotateCcw, AlertCircle, Loader, Settings, Zap, ChevronDown } from 'lucide-react';
=======
import { Lightbulb, MessageSquare, CheckCircle, Copy, RotateCcw, AlertCircle, Loader, Settings, Zap, Sparkles, Target } from 'lucide-react';
>>>>>>> d623e9558103fe2b87c1ef0d030ac7f83d4db259
import { GeminiService } from './services/geminiService';
import { OpenRouterService, FREE_MODELS } from './services/openRouterService';
import { Question, OptimizedResult, PromptingStyle } from './types';

type ApiProvider = 'gemini' | 'openrouter';

// Available prompt styles
const PROMPT_STYLES = [
  { id: 'instruction', name: 'Instruction-based' },
  { id: 'role', name: 'Role/Persona' },
  { id: 'format', name: 'Format-Constrained' },
  { id: 'fewshot', name: 'Few-shot' },
  { id: 'zeroshot', name: 'Zero-shot' },
  { id: 'cot', name: 'Chain-of-Thought' },
  { id: 'socratic', name: 'Socratic' },
  { id: 'storytelling', name: 'Storytelling' },
  { id: 'roleplay', name: 'Roleplay' },
  { id: 'hypothetical', name: 'Hypothetical' },
  { id: 'critique', name: 'Critique & Improve' },
  { id: 'iterative', name: 'Iterative Refinement' },
];

function App() {
  const [userIdea, setUserIdea] = useState('');
  const [overInstructions, setOverInstructions] = useState('');
  const [suggestedStyles, setSuggestedStyles] = useState<PromptingStyle[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [optimizedResults, setOptimizedResults] = useState<OptimizedResult[]>([]);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [suggestedStyles, setSuggestedStyles] = useState<string[]>(['instruction', 'role']);
  
  // API Provider Selection
  const [apiProvider, setApiProvider] = useState<ApiProvider>('gemini');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showModelSelection, setShowModelSelection] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const handleApiProviderChange = (provider: ApiProvider) => {
    setApiProvider(provider);
    setSelectedModel('');
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const generatePromptingStyles = async () => {
    if (!userIdea.trim() || !overInstructions.trim()) {
      setError('Please fill in both the User Idea and Overarching Instructions fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
<<<<<<< HEAD
      // Simulate API call
      setTimeout(() => {
        // Mock questions with suggested answers based on the user's input
        const mockQuestions = [
          { 
            id: 1, 
            text: `What is the main goal of your "${userIdea}"?`,
            suggestions: [
              'To generate creative content',
              'To analyze or process data',
              'To answer questions',
              'To create a tutorial/guide',
              'To brainstorm ideas'
            ]
          },
          { 
            id: 2, 
            text: 'Who is your target audience?',
            suggestions: [
              'General public',
              'Technical professionals',
              'Students',
              'Business professionals',
              'Creative professionals'
            ]
          },
          { 
            id: 3, 
            text: 'What tone would you like to use?',
            suggestions: [
              'Professional',
              'Casual',
              'Academic',
              'Friendly',
              'Persuasive'
            ]
          },
          { 
            id: 4, 
            text: 'Are there any specific examples or references you want to include?',
            suggestions: [
              'No specific examples',
              'Include code examples',
              'Use real-world scenarios',
              'Reference current events',
              'Include data/statistics'
            ]
          },
          { 
            id: 5, 
            text: 'What is the desired length of the output?',
            suggestions: [
              'Brief (1-2 paragraphs)',
              'Medium (3-5 paragraphs)',
              'Detailed (5+ paragraphs)',
              'Bullet points',
              'Step-by-step guide'
            ]
          },
        ];
        setQuestions(mockQuestions);
        setCurrentStep(2);
        setLoading(false);
      }, 1000);
=======
      let response;
      
      if (apiProvider === 'gemini') {
        response = await GeminiService.generatePromptingStyles(userIdea, overInstructions);
      } else {
        response = await OpenRouterService.generatePromptingStyles(userIdea, overInstructions, selectedModels[0]);
      }
      
      if (response.status === 'error') {
        setError(response.error || 'An error occurred while generating prompting styles');
        return;
      }

      if (response.suggestedStyles) {
        setSuggestedStyles(response.suggestedStyles);
        setSelectedStyles(response.suggestedStyles.slice(0, 2).map(s => s.id)); // Auto-select first 2
        setCurrentStep(2);
      }
    } catch (err) {
      setError('Failed to generate prompting styles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    if (selectedStyles.length === 0) {
      setError('Please select at least one prompting style to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      
      if (apiProvider === 'gemini') {
        response = await GeminiService.generateClarifyingQuestions(userIdea, overInstructions);
      } else {
        response = await OpenRouterService.generateClarifyingQuestions(userIdea, overInstructions, selectedModels[0]);
      }
      
      if (response.status === 'error') {
        setError(response.error || 'An error occurred while generating questions');
        return;
      }

      if (response.clarifyingQuestions) {
        const generatedQuestions: Question[] = response.clarifyingQuestions.map((q, index) => ({
          id: index + 1,
          text: q.text,
          options: q.options || [],
          selectedOptions: [],
          answer: ""
        }));
        
        setQuestions(generatedQuestions);
        setCurrentStep(3);
      }
>>>>>>> d623e9558103fe2b87c1ef0d030ac7f83d4db259
    } catch (err) {
      setError('An error occurred while generating questions. Please try again.');
      setLoading(false);
    }
  };

  const toggleStyle = (styleId: string) => {
<<<<<<< HEAD
    setSelectedStyles(prev => 
      prev.includes(styleId)
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const generateFinalPrompt = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const stylesText = selectedStyles.map(styleId => 
        PROMPT_STYLES.find(s => s.id === styleId)?.name
      ).join(' + ');
      
      // Create a prompt that includes the user's answers to questions
      const answersText = questions
        .filter(q => q.answer)
        .map(q => `- ${q.text}\n  ${q.answer}`)
        .join('\n\n');
      
      setFinalPrompt(`[Applied Styles: ${stylesText || 'Default'}]

User's Input:
${userIdea}
=======
    setSelectedStyles(prev => {
      if (prev.includes(styleId)) {
        return prev.filter(id => id !== styleId);
      } else if (prev.length < 2) {
        return [...prev, styleId];
      } else {
        // Replace the first selected style if already at max
        return [prev[1], styleId];
      }
    });
  };

  const updateAnswer = (id: number, answer: string) => {
    setQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, answer } : q)
    );
  };

  const toggleOption = (questionId: number, option: string) => {
    setQuestions(prev => 
      prev.map(q => {
        if (q.id === questionId) {
          const isSelected = q.selectedOptions.includes(option);
          const newSelectedOptions = isSelected 
            ? q.selectedOptions.filter(opt => opt !== option)
            : [...q.selectedOptions, option];
          
          // Update the answer field to reflect selected options
          const customAnswer = q.answer.replace(/^Selected: .+?\n?/, '');
          const selectedText = newSelectedOptions.length > 0 
            ? `Selected: ${newSelectedOptions.join(', ')}\n${customAnswer}`.trim()
            : customAnswer;
          
          return { 
            ...q, 
            selectedOptions: newSelectedOptions,
            answer: selectedText
          };
        }
        return q;
      })
    );
  };

  const generateFinalPrompt = async () => {
    const answeredQuestions = questions.filter(q => q.answer.trim());
    
    if (answeredQuestions.length === 0) {
      setError('Please answer at least one clarifying question to generate the optimized prompt.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const questionAnswerPairs = answeredQuestions.map(q => ({
        question: q.text,
        answer: q.answer
      }));

      const appliedStyleNames = selectedStyles.map(styleId => 
        suggestedStyles.find(s => s.id === styleId)?.name || styleId
      );

      let response;
      
      if (apiProvider === 'gemini') {
        response = await GeminiService.generateOptimizedPrompt(
          userIdea, 
          overInstructions, 
          questionAnswerPairs,
          appliedStyleNames
        );
        
        if (response.status === 'error') {
          setError(response.error || 'An error occurred while generating the optimized prompt');
          return;
        }

        if (response.optimizedPrompt) {
          setFinalPrompt(response.optimizedPrompt);
          setOptimizedResults([]);
        }
      } else {
        response = await OpenRouterService.generateOptimizedPrompts(
          userIdea, 
          overInstructions, 
          questionAnswerPairs,
          appliedStyleNames,
          selectedModels
        );
        
        if (response.status === 'error') {
          setError(response.error || 'An error occurred while generating the optimized prompt');
          return;
        }
>>>>>>> d623e9558103fe2b87c1ef0d030ac7f83d4db259

Additional Instructions:
${overInstructions}

${answersText ? `\nAnswers to Clarifying Questions:\n${answersText}` : ''}`);
      
<<<<<<< HEAD
      setCurrentStep(3);
=======
      setCurrentStep(4);
    } catch (err) {
      setError('Failed to generate optimized prompt. Please try again.');
    } finally {
>>>>>>> d623e9558103fe2b87c1ef0d030ac7f83d4db259
      setLoading(false);
    }, 1500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  const resetForm = () => {
    setUserIdea('');
    setOverInstructions('');
    setSuggestedStyles([]);
    setSelectedStyles([]);
    setQuestions([]);
    setFinalPrompt('');
    setSelectedStyles([]);
    setCurrentStep(1);
    setError('');
  };

<<<<<<< HEAD
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">AI Prompt Optimizer</h1>
            <p className="text-primary-200">Transform your ideas into optimized AI prompts</p>
          </div>
          <div className="flex items-center gap-4">
            {apiProvider === 'openrouter' && selectedModel && (
              <div className="relative">
                <button
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-2 bg-primary-800 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors"
                >
                  {FREE_MODELS.find(m => m.id === selectedModel)?.name || 'Select Model'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isModelDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                {isModelDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2 max-h-80 overflow-y-auto">
                      {FREE_MODELS
                        .filter(model => model.provider === 'openrouter')
                        .map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              handleModelSelect(model.id);
                              setIsModelDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                              selectedModel === model.id
                                ? 'bg-primary-100 text-primary-900'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="font-medium">{model.name}</div>
                            <div className="text-xs text-gray-500 truncate">{model.id}</div>
                          </button>
                        ))}
=======
  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  const getSelectedStyleNames = () => {
    return selectedStyles.map(styleId => 
      suggestedStyles.find(s => s.id === styleId)?.name || styleId
    );
  };

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="container mx-auto px-8 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl font-bold text-primary-900 mb-6 tracking-tight">
            Swiss Prompt Generator
          </h1>
          <p className="text-primary-700 text-xl max-w-4xl mx-auto leading-relaxed">
            Transform your raw ideas into polished, AI-ready prompts using advanced language models and proven prompting techniques
          </p>
        </div>

        {/* API Provider Selection */}
        <div className="bg-white rounded-2xl shadow-lg border border-primary-200 p-8 mb-12 animate-slide-up">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-primary-900 flex items-center">
              <Settings className="w-7 h-7 text-primary-600 mr-3" />
              API Provider Selection
            </h3>
            {apiProvider === 'openrouter' && (
              <button
                onClick={() => setShowModelSelection(!showModelSelection)}
                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Zap className="w-5 h-5" />
                <span className="font-medium">Configure Models</span>
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <label className="flex items-center space-x-4 p-6 border-2 border-primary-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all duration-200">
              <input
                type="radio"
                name="apiProvider"
                value="gemini"
                checked={apiProvider === 'gemini'}
                onChange={(e) => setApiProvider(e.target.value as ApiProvider)}
                className="w-5 h-5 text-primary-600"
              />
              <div>
                <span className="text-primary-900 font-bold text-lg">Gemini 2.5 Pro</span>
                <p className="text-primary-600 text-sm mt-1">Google's most advanced reasoning model</p>
              </div>
            </label>
            <label className="flex items-center space-x-4 p-6 border-2 border-primary-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all duration-200">
              <input
                type="radio"
                name="apiProvider"
                value="openrouter"
                checked={apiProvider === 'openrouter'}
                onChange={(e) => setApiProvider(e.target.value as ApiProvider)}
                className="w-5 h-5 text-primary-600"
              />
              <div>
                <span className="text-primary-900 font-bold text-lg">OpenRouter (Free Models)</span>
                <p className="text-primary-600 text-sm mt-1">Access to multiple open-source models</p>
              </div>
            </label>
          </div>

          {/* OpenRouter Model Selection */}
          {apiProvider === 'openrouter' && showModelSelection && (
            <div className="border-t-2 border-primary-200 pt-8 animate-fade-in">
              <h4 className="text-xl font-bold text-primary-900 mb-6 flex items-center">
                <Target className="w-6 h-6 text-primary-600 mr-2" />
                Available Free Models
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FREE_MODELS.map((model) => (
                  <label key={model.id} className="flex items-start space-x-4 p-6 border-2 border-primary-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model.id)}
                      onChange={() => handleModelToggle(model.id)}
                      className="w-5 h-5 text-primary-600 mt-1"
                    />
                    <div>
                      <div className="text-lg font-bold text-primary-900">{model.name}</div>
                      <div className="text-sm text-primary-600 mt-1">{model.description}</div>
>>>>>>> d623e9558103fe2b87c1ef0d030ac7f83d4db259
                    </div>
                  </div>
                )}
              </div>
<<<<<<< HEAD
            )}
            
            <button 
              onClick={() => setShowModelSelection(true)}
              className="p-2 rounded-full hover:bg-primary-800 transition-colors"
              title="Change API Provider"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Model Selection Modal */}
      {showModelSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Select AI Model</h3>
                <button 
                  onClick={() => setShowModelSelection(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">API Provider</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleApiProviderChange('gemini')}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                        apiProvider === 'gemini'
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      Google Gemini
                    </button>
                    <button
                      onClick={() => handleApiProviderChange('openrouter')}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                        apiProvider === 'openrouter'
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      OpenRouter
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    {apiProvider === 'gemini' ? 'Gemini Model' : 'OpenRouter Models'}
                  </h4>
                  <div className="space-y-2">
                    {FREE_MODELS
                      .filter(model => model.provider === apiProvider)
                      .map((model) => (
                        <label 
                          key={model.id}
                          className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                            selectedModel === model.id
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="model-selection"
                            checked={selectedModel === model.id}
                            onChange={() => handleModelSelect(model.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{model.name}</p>
                            <p className="text-xs text-gray-500">{model.description}</p>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModelSelection(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Save the selected models
                    setShowModelSelection(false);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Save Changes
                </button>
=======
              {selectedModels.length === 0 && (
                <div className="bg-accent-100 border-2 border-accent-300 rounded-xl p-6 mt-6">
                  <p className="text-accent-800 font-medium text-center">No models selected — please pick one to continue.</p>
                </div>
              )}
            </div>
          )}

          {/* API Key Notice */}
          <div className="bg-primary-100 border-2 border-primary-300 rounded-xl p-6 mt-8">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-primary-700 mr-4 mt-1" />
              <div className="text-sm text-primary-800">
                <p className="font-bold mb-2">Setup Required:</p>
                <p>
                  {apiProvider === 'gemini' 
                    ? 'Add your Gemini 2.5 Pro API key to .env: VITE_GEMINI_API_KEY=your_key'
                    : 'Add your OpenRouter API key to .env: VITE_OPENROUTER_API_KEY=your_key'
                  }
                </p>
>>>>>>> d623e9558103fe2b87c1ef0d030ac7f83d4db259
              </div>
            </div>
          </div>
        </div>
      )}

<<<<<<< HEAD
      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex justify-between mb-8 max-w-2xl mx-auto">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white border-2 border-neutral-300 text-neutral-400'
                }`}
              >
                {step}
              </div>
              <span className="text-xs mt-2 text-neutral-600">
                {step === 1 ? 'Input' : step === 2 ? 'Clarify' : 'Result'}
              </span>
            </div>
          ))}
        </div>

        {/* Model Selection Card - Moved to first page */}
        {currentStep === 1 && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary-600" />
                  AI Model Selection
                </h2>
                <span className="text-sm text-gray-500">
                  {selectedModel ? '1 model selected' : 'No models selected'}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">API Provider</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleApiProviderChange('gemini')}
                      className={`px-4 py-2 rounded-lg border-2 font-medium text-sm ${
                        apiProvider === 'gemini'
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      Google Gemini
                    </button>
                    <button
                      onClick={() => handleApiProviderChange('openrouter')}
                      className={`px-4 py-2 rounded-lg border-2 font-medium text-sm ${
                        apiProvider === 'openrouter'
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      OpenRouter
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {apiProvider === 'gemini' ? 'Gemini Model' : 'OpenRouter Models'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {FREE_MODELS
                      .filter(model => model.provider === apiProvider)
                      .map((model) => (
                        <label 
                          key={model.id}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedModel === model.id
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="model-selection"
                            checked={selectedModel === model.id}
                            onChange={() => handleModelSelect(model.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{model.name}</p>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
=======
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6 mb-12 animate-fade-in">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-700 mr-4 mt-1" />
              <p className="text-red-800 font-medium text-lg">{error}</p>
>>>>>>> d623e9558103fe2b87c1ef0d030ac7f83d4db259
            </div>
          </div>
        )}

<<<<<<< HEAD
        {/* Step 1: Input */}
        {currentStep === 1 && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary-600" />
                Your Idea or Rough Prompt
              </h2>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[120px]"
                placeholder="Describe what you want to achieve with AI..."
                value={userIdea}
                onChange={(e) => setUserIdea(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                Additional Instructions
              </h2>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px]"
                placeholder="Any specific requirements? (tone, format, length, etc.)"
                value={overInstructions}
                onChange={(e) => setOverInstructions(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Prompt Style</h2>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">
                  Suggested styles based on your input. Select up to 2 styles:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedStyles.map(styleId => {
                    const style = PROMPT_STYLES.find(s => s.id === styleId);
                    if (!style) return null;
                    
                    return (
                      <button
                        key={style.id}
                        onClick={() => toggleStyle(style.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedStyles.includes(style.id)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {style.name}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Or choose from all styles:</p>
                  <div className="flex flex-wrap gap-2">
                    {PROMPT_STYLES.filter(s => !suggestedStyles.includes(s.id)).map(style => (
                      <button
                        key={style.id}
                        onClick={() => toggleStyle(style.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedStyles.includes(style.id)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${
                          selectedStyles.length >= 2 && !selectedStyles.includes(style.id) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={selectedStyles.length >= 2 && !selectedStyles.includes(style.id)}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={generateQuestions}
                disabled={!userIdea.trim() || !overInstructions.trim() || loading}
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate Questions
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              </div>
            )}
=======
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step, index) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-14 h-14 rounded-full border-3 transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-primary-600 text-white border-primary-600' 
                    : 'bg-white text-primary-400 border-primary-300'
                }`}>
                  <span className="text-lg font-bold">{step}</span>
                </div>
                {index < 3 && (
                  <div className={`h-1 w-16 rounded-full transition-all duration-300 ${
                    currentStep > step ? 'bg-primary-600' : 'bg-primary-300'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Inputs */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-primary-200 p-10 mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold text-primary-900 mb-8 flex items-center">
              <Lightbulb className="w-8 h-8 text-primary-600 mr-4" />
              Step 1: Initial Inputs
            </h2>
            
            <div className="space-y-8">
              <div>
                <label className="block text-xl font-bold text-primary-900 mb-4">
                  User Idea <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={userIdea}
                  onChange={(e) => setUserIdea(e.target.value)}
                  placeholder="Describe your initial concept, task, or desired outcome..."
                  className="w-full h-40 px-6 py-4 border-2 border-primary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-none transition-all duration-200 text-base"
                />
              </div>
              
              <div>
                <label className="block text-xl font-bold text-primary-900 mb-4">
                  Overarching Instructions for AI Agent <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={overInstructions}
                  onChange={(e) => setOverInstructions(e.target.value)}
                  placeholder="Provide general guidelines, constraints, or behavioral instructions for the AI..."
                  className="w-full h-40 px-6 py-4 border-2 border-primary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-none transition-all duration-200 text-base"
                />
              </div>
            </div>
            
            <button
              onClick={generatePromptingStyles}
              disabled={loading || (apiProvider === 'openrouter' && selectedModels.length === 0)}
              className="mt-10 w-full bg-primary-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  <span>Analyzing & Suggesting Styles...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Generate Prompting Style Suggestions</span>
                </>
              )}
            </button>
>>>>>>> d623e9558103fe2b87c1ef0d030ac7f83d4db259
          </div>
        )}

        {/* Step 2: Prompting Style Selection */}
        {currentStep === 2 && (
<<<<<<< HEAD
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">
                Let's clarify a few things to optimize your prompt
              </h2>
              
              <div className="space-y-6">
                {questions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      {question.text}
                    </label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {question.suggestions?.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const updatedQuestions = questions.map(q => 
                                q.id === question.id 
                                  ? { ...q, answer: q.answer === suggestion ? '' : suggestion }
                                  : q
                              );
                              setQuestions(updatedQuestions);
                            }}
                            className={`px-3 py-1.5 text-sm rounded-full border ${
                              question.answer === suggestion
                                ? 'bg-primary-50 border-primary-300 text-primary-700'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
=======
          <div className="bg-white rounded-2xl shadow-lg border border-primary-200 p-10 mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold text-primary-900 mb-8 flex items-center">
              <Sparkles className="w-8 h-8 text-primary-600 mr-4" />
              Step 2: Choose Prompting Styles
            </h2>
            
            <p className="text-primary-700 mb-8 text-lg leading-relaxed">
              Based on your inputs, here are AI-recommended prompting styles. Select up to 2 styles that best fit your needs.
            </p>
            
            <div className="space-y-6">
              {suggestedStyles.map((style) => (
                <div 
                  key={style.id} 
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                    selectedStyles.includes(style.id)
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-primary-200 hover:border-primary-400 hover:bg-primary-50'
                  }`}
                  onClick={() => toggleStyle(style.id)}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedStyles.includes(style.id)}
                      onChange={() => toggleStyle(style.id)}
                      className="w-5 h-5 text-primary-600 mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-primary-900 mb-2">{style.name}</h3>
                      <p className="text-primary-700 mb-4 leading-relaxed">{style.explanation}</p>
                      <div className="bg-primary-100 rounded-lg p-4">
                        <p className="text-sm font-medium text-primary-800 mb-2">Example for your idea:</p>
                        <p className="text-primary-700 italic">{style.example}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-6 mt-10">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 bg-white text-primary-700 py-4 px-8 rounded-xl font-bold text-lg border-2 border-primary-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
              >
                Back to Inputs
              </button>
              <button
                onClick={generateQuestions}
                disabled={loading || selectedStyles.length === 0}
                className="flex-1 bg-primary-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Generating Questions...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-6 h-6" />
                    <span>Generate Clarifying Questions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Clarifying Questions */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-lg border border-primary-200 p-10 mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold text-primary-900 mb-8 flex items-center">
              <MessageSquare className="w-8 h-8 text-primary-600 mr-4" />
              Step 3: Clarifying Questions
            </h2>
            
            <div className="bg-primary-100 rounded-xl p-6 mb-8">
              <p className="text-primary-800 font-medium mb-2">Selected Styles:</p>
              <div className="flex flex-wrap gap-2">
                {getSelectedStyleNames().map((styleName, index) => (
                  <span key={index} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    {styleName}
                  </span>
                ))}
              </div>
            </div>
            
            <p className="text-primary-700 mb-10 text-lg leading-relaxed">
              Based on your inputs and selected styles, here are custom clarifying questions. Answer the ones most relevant to your needs.
            </p>
            
            <div className="space-y-8">
              {questions.map((question) => (
                <div key={question.id} className="border-2 border-primary-200 rounded-xl p-8 hover:border-primary-400 hover:shadow-md transition-all duration-200">
                  <label className="block text-xl font-bold text-primary-900 mb-6">
                    {question.id}. {question.text}
                  </label>
                  
                  {/* Answer Options */}
                  {question.options && question.options.length > 0 && (
                    <div className="mb-6">
                      <p className="text-base font-medium text-primary-700 mb-4">Select applicable options:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {question.options.map((option, optionIndex) => (
                          <button
                            key={optionIndex}
                            onClick={() => toggleOption(question.id, option)}
                            className={`text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                              question.selectedOptions.includes(option)
                                ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                : 'bg-white text-primary-900 border-primary-300 hover:border-primary-500 hover:bg-primary-50'
>>>>>>> d623e9558103fe2b87c1ef0d030ac7f83d4db259
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Or type your own answer..."
                        value={question.answer || ''}
                        onChange={(e) => {
                          const updatedQuestions = questions.map((q) =>
                            q.id === question.id
                              ? { ...q, answer: e.target.value }
                              : q
                          );
                          setQuestions(updatedQuestions);
                        }}
                      />
                    </div>
<<<<<<< HEAD
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  onClick={generateFinalPrompt}
                  disabled={loading || questions.some(q => !q.answer)}
                  className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Optimized Prompt'
                  )}
                </button>
              </div>
=======
                  )}
                  
                  <textarea
                    value={question.answer}
                    onChange={(e) => updateAnswer(question.id, e.target.value)}
                    placeholder="Add custom details or additional context..."
                    className="w-full h-32 px-6 py-4 border-2 border-primary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-none transition-all duration-200 text-base"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex space-x-6 mt-12">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex-1 bg-white text-primary-700 py-4 px-8 rounded-xl font-bold text-lg border-2 border-primary-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
              >
                Back to Styles
              </button>
              <button
                onClick={generateFinalPrompt}
                disabled={loading}
                className="flex-1 bg-primary-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Generating Final Prompt{apiProvider === 'openrouter' && selectedModels.length > 1 ? 's' : ''}...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>Generate Final Optimized Prompt{apiProvider === 'openrouter' && selectedModels.length > 1 ? 's' : ''}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Final Optimized Prompt(s) */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl shadow-lg border border-primary-200 p-10 mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold text-primary-900 mb-8 flex items-center">
              <CheckCircle className="w-8 h-8 text-primary-600 mr-4" />
              Step 4: Final Optimized Prompt{optimizedResults.length > 1 ? 's' : ''}
            </h2>
            
            <div className="bg-primary-100 rounded-xl p-6 mb-8">
              <p className="text-primary-800 font-medium mb-2">Applied Styles:</p>
              <div className="flex flex-wrap gap-2">
                {getSelectedStyleNames().map((styleName, index) => (
                  <span key={index} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    {styleName}
                  </span>
                ))}
              </div>
            </div>
            
            <p className="text-primary-700 mb-8 text-lg leading-relaxed">
              Your AI-optimized prompt{optimizedResults.length > 1 ? 's are' : ' is'} ready! 
              {optimizedResults.length > 1 ? ' Compare results from different models below.' : ' This structured prompt follows prompt engineering best practices and incorporates your selected styles.'}
            </p>
            
            {/* Single Prompt (Gemini) */}
            {finalPrompt && (
              <div className="relative mb-8">
                <div className="bg-primary-50 border-2 border-primary-300 rounded-xl p-8 text-base overflow-x-auto">
                  <div className="mb-6 text-sm text-primary-700 font-bold uppercase tracking-wide">Final Optimized Prompt:</div>
                  <pre className="whitespace-pre-wrap font-mono leading-relaxed text-primary-900 text-base">
                    {finalPrompt}
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(finalPrompt)}
                  className={`absolute top-6 right-6 flex items-center space-x-2 px-6 py-3 rounded-lg font-bold transition-all duration-200 border-2 ${
                    copied.default 
                      ? 'bg-green-100 text-green-800 border-green-400' 
                      : 'bg-white text-primary-900 border-primary-300 hover:border-primary-500 hover:bg-primary-50 shadow-md hover:shadow-lg'
                  }`}
                >
                  <Copy className="w-5 h-5" />
                  <span>{copied.default ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}

            {/* Multiple Prompts (OpenRouter) */}
            {optimizedResults.length > 0 && (
              <div className="space-y-8">
                {optimizedResults.map((result, index) => (
                  <div key={index} className="relative">
                    <div className="bg-primary-50 border-2 border-primary-300 rounded-xl p-8 text-base overflow-x-auto">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="text-sm text-primary-700 font-bold uppercase tracking-wide">Model: {result.model}</div>
                      </div>
                      <pre className="whitespace-pre-wrap font-mono leading-relaxed text-primary-900 text-base">
                        {result.optimizedPrompt}
                      </pre>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.optimizedPrompt, result.model)}
                      className={`absolute top-6 right-6 flex items-center space-x-2 px-6 py-3 rounded-lg font-bold transition-all duration-200 border-2 ${
                        copied[result.model] 
                          ? 'bg-green-100 text-green-800 border-green-400' 
                          : 'bg-white text-primary-900 border-primary-300 hover:border-primary-500 hover:bg-primary-50 shadow-md hover:shadow-lg'
                      }`}
                    >
                      <Copy className="w-5 h-5" />
                      <span>{copied[result.model] ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex space-x-6 mt-12">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 bg-white text-primary-700 py-4 px-8 rounded-xl font-bold text-lg border-2 border-primary-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
              >
                Back to Questions
              </button>
              <button
                onClick={resetTool}
                className="flex-1 bg-accent-500 text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-accent-600 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
              >
                <RotateCcw className="w-6 h-6" />
                <span>Start Over</span>
              </button>
>>>>>>> d623e9558103fe2b87c1ef0d030ac7f83d4db259
            </div>
          </div>
        )}

<<<<<<< HEAD
        {/* Step 3: Results */}
        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Your Optimized Prompt</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(finalPrompt, 'finalPrompt')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm flex items-center gap-1"
                  >
                    {copied.finalPrompt ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start Over
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap font-mono text-sm">
                {finalPrompt}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Try It Out</h2>
              <p className="text-gray-600 mb-4">
                Test your optimized prompt with different AI models:
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full border border-blue-200 text-sm font-medium hover:bg-blue-200 transition-colors">
                  GPT-4
                </button>
                <button className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full border border-purple-200 text-sm font-medium hover:bg-purple-200 transition-colors">
                  Claude 3 Opus
                </button>
                <button className="px-4 py-2 bg-green-100 text-green-800 rounded-full border border-green-200 text-sm font-medium hover:bg-green-200 transition-colors">
                  Gemini Pro
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="h-40 flex items-center justify-center text-gray-400">
                  Select a model to see the generated response
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>AI Prompt Optimizer &copy; {new Date().getFullYear()}</p>
=======
        {/* Footer */}
        <div className="text-center text-primary-600 text-base font-medium">
          <p>Powered by {apiProvider === 'gemini' ? 'Gemini 2.5 Pro' : 'OpenRouter Free Models'} • Swiss Design Prompt Engineering</p>
>>>>>>> d623e9558103fe2b87c1ef0d030ac7f83d4db259
        </div>
      </footer>
    </div>
  );
}

export default App;
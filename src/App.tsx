import React, { useState } from 'react';
import { Lightbulb, MessageSquare, CheckCircle, Copy, RotateCcw, AlertCircle, Loader, Settings, Zap, ChevronDown } from 'lucide-react';
import { GeminiService } from './services/geminiService';
import { OpenRouterService, FREE_MODELS } from './services/openRouterService';
import { Question, OptimizedResult } from './types';

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

  const generateQuestions = async () => {
    if (!userIdea.trim() || !overInstructions.trim()) {
      setError('Please fill in both the User Idea and Overarching Instructions fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
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
    } catch (err) {
      setError('An error occurred while generating questions. Please try again.');
      setLoading(false);
    }
  };

  const toggleStyle = (styleId: string) => {
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

Additional Instructions:
${overInstructions}

${answersText ? `\nAnswers to Clarifying Questions:\n${answersText}` : ''}`);
      
      setCurrentStep(3);
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
    setQuestions([]);
    setFinalPrompt('');
    setSelectedStyles([]);
    setCurrentStep(1);
    setError('');
  };

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
                    </div>
                  </div>
                )}
              </div>
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
              </div>
            </div>
          </div>
        </div>
      )}

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
            </div>
          </div>
        )}

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
          </div>
        )}

        {/* Step 2: Clarifying Questions */}
        {currentStep === 2 && (
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
            </div>
          </div>
        )}

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
        </div>
      </footer>
    </div>
  );
}

export default App;
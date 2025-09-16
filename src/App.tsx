import React, { useState } from 'react';
import { Lightbulb, MessageSquare, CheckCircle, Copy, RotateCcw, AlertCircle, Loader, Settings, Zap } from 'lucide-react';
import { GeminiService } from './services/geminiService';
import { OpenRouterService, FREE_MODELS } from './services/openRouterService';
import { Question, OptimizedResult } from './types';

type ApiProvider = 'gemini' | 'openrouter';

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
  
  // API Provider Selection
  const [apiProvider, setApiProvider] = useState<ApiProvider>('gemini');
  const [selectedModels, setSelectedModels] = useState<string[]>([FREE_MODELS[0].id]);
  const [showModelSelection, setShowModelSelection] = useState(false);

  const generateQuestions = async () => {
    if (!userIdea.trim() || !overInstructions.trim()) {
      setError('Please fill in both the User Idea and Overarching Instructions fields.');
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
        setCurrentStep(2);
      }
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
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

      let response;
      
      if (apiProvider === 'gemini') {
        response = await GeminiService.generateOptimizedPrompt(
          userIdea, 
          overInstructions, 
          questionAnswerPairs
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
          selectedModels
        );
        
        if (response.status === 'error') {
          setError(response.error || 'An error occurred while generating the optimized prompt');
          return;
        }

        if (response.results) {
          setOptimizedResults(response.results);
          setFinalPrompt('');
        }
      }
      
      setCurrentStep(3);
    } catch (err) {
      setError('Failed to generate optimized prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key: string = 'default') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [key]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const resetTool = () => {
    setUserIdea('');
    setOverInstructions('');
    setQuestions([]);
    setCurrentStep(1);
    setFinalPrompt('');
    setOptimizedResults([]);
    setCopied({});
    setError('');
  };

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-8 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Prompt Generator & Optimizer
            </h1>
          <p className="text-gray-700 text-xl max-w-3xl mx-auto leading-relaxed">
            Transform your raw ideas into polished, AI-ready prompts using advanced language models
          </p>
        </div>

        {/* API Provider Selection */}
        <div className="bg-white border-2 border-gray-900 p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 text-gray-900 mr-3" />
              API Provider Selection
            </h3>
            {apiProvider === 'openrouter' && (
              <button
                onClick={() => setShowModelSelection(!showModelSelection)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white border-2 border-gray-900 hover:bg-white hover:text-gray-900 transition-colors duration-200"
              >
                <Zap className="w-4 h-4" />
                <span>Configure Models</span>
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <label className="flex items-center space-x-3 p-4 border-2 border-gray-300 cursor-pointer hover:border-gray-900 transition-colors duration-200">
              <input
                type="radio"
                name="apiProvider"
                value="gemini"
                checked={apiProvider === 'gemini'}
                onChange={(e) => setApiProvider(e.target.value as ApiProvider)}
                className="w-5 h-5 text-gray-900"
              />
              <span className="text-gray-900 font-medium">Gemini 2.5 Pro</span>
            </label>
            <label className="flex items-center space-x-3 p-4 border-2 border-gray-300 cursor-pointer hover:border-gray-900 transition-colors duration-200">
              <input
                type="radio"
                name="apiProvider"
                value="openrouter"
                checked={apiProvider === 'openrouter'}
                onChange={(e) => setApiProvider(e.target.value as ApiProvider)}
                className="w-5 h-5 text-gray-900"
              />
              <span className="text-gray-900 font-medium">OpenRouter (Free Models)</span>
            </label>
          </div>

          {/* OpenRouter Model Selection */}
          {apiProvider === 'openrouter' && showModelSelection && (
            <div className="border-t-2 border-gray-300 pt-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Available Free Models:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FREE_MODELS.map((model) => (
                  <label key={model.id} className="flex items-start space-x-3 p-4 border-2 border-gray-300 hover:border-gray-900 cursor-pointer transition-colors duration-200">
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model.id)}
                      onChange={() => handleModelToggle(model.id)}
                      className="w-5 h-5 text-gray-900 mt-1"
                    />
                    <div>
                      <div className="text-base font-bold text-gray-900">{model.name}</div>
                      <div className="text-sm text-gray-700">{model.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {selectedModels.length === 0 && (
                <p className="text-red-700 text-base font-medium mt-4">Please select at least one model.</p>
              )}
            </div>
          )}

          {/* API Key Notice */}
          <div className="bg-yellow-100 border-2 border-yellow-400 p-4 mt-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-700 mr-3 mt-1" />
              <div className="text-sm text-yellow-800">
                <p className="font-bold mb-2">Setup Required:</p>
                <p>
                  {apiProvider === 'gemini' 
                    ? 'Add your Gemini 2.5 Pro API key to .env: VITE_GEMINI_API_KEY=your_key'
                    : 'Add your OpenRouter API key to .env: VITE_OPENROUTER_API_KEY=your_key'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border-2 border-red-400 p-6 mb-12">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-700 mr-4 mt-1" />
              <p className="text-red-800 font-medium text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-6">
            <div className={`flex items-center justify-center w-12 h-12 border-2 ${currentStep >= 1 ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300'} transition-colors duration-300`}>
              <span className="text-lg font-bold">1</span>
            </div>
            <div className={`h-2 w-20 ${currentStep >= 2 ? 'bg-gray-900' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <div className={`flex items-center justify-center w-12 h-12 border-2 ${currentStep >= 2 ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300'} transition-colors duration-300`}>
              <span className="text-lg font-bold">2</span>
            </div>
            <div className={`h-2 w-20 ${currentStep >= 3 ? 'bg-gray-900' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <div className={`flex items-center justify-center w-12 h-12 border-2 ${currentStep >= 3 ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300'} transition-colors duration-300`}>
              <span className="text-lg font-bold">3</span>
            </div>
          </div>
        </div>

        {/* Step 1: Inputs */}
        {currentStep === 1 && (
          <div className="bg-white border-2 border-gray-900 p-10 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Lightbulb className="w-8 h-8 text-gray-900 mr-4" />
              Step 1: Inputs
            </h2>
            
            <div className="space-y-8">
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  User Idea <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={userIdea}
                  onChange={(e) => setUserIdea(e.target.value)}
                  placeholder="Describe your initial concept, task, or desired outcome..."
                  className="w-full h-36 px-6 py-4 border-2 border-gray-300 focus:border-gray-900 resize-none transition-all duration-200 text-base"
                />
              </div>
              
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  Overarching Instructions for AI Agent <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={overInstructions}
                  onChange={(e) => setOverInstructions(e.target.value)}
                  placeholder="Provide general guidelines, constraints, or behavioral instructions for the AI..."
                  className="w-full h-36 px-6 py-4 border-2 border-gray-300 focus:border-gray-900 resize-none transition-all duration-200 text-base"
                />
              </div>
            </div>
            
            <button
              onClick={generateQuestions}
              disabled={loading || (apiProvider === 'openrouter' && selectedModels.length === 0)}
              className="mt-10 w-full bg-gray-900 text-white py-4 px-8 font-bold text-lg hover:bg-white hover:text-gray-900 border-2 border-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating Questions...</span>
                </>
              ) : (
                <span>Generate Clarifying Questions</span>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Clarifying Questions */}
        {currentStep === 2 && (
          <div className="bg-white border-2 border-gray-900 p-10 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <MessageSquare className="w-8 h-8 text-gray-900 mr-4" />
              Step 2: Clarifying Questions
            </h2>
            
            <p className="text-gray-700 mb-10 text-lg leading-relaxed">
              Based on your inputs, here are AI-generated clarifying questions to refine your prompt. Answer the ones most relevant to your needs - you don't need to answer all of them.
            </p>
            
            <div className="space-y-10">
              {questions.map((question) => (
                <div key={question.id} className="border-2 border-gray-300 p-8 hover:border-gray-900 transition-colors duration-200">
                  <label className="block text-lg font-bold text-gray-900 mb-6">
                    {question.id}. {question.text}
                  </label>
                  
                  {/* Answer Options */}
                  {question.options && question.options.length > 0 && (
                    <div className="mb-6">
                      <p className="text-base font-medium text-gray-700 mb-4">Select applicable options:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {question.options.map((option, optionIndex) => (
                          <button
                            key={optionIndex}
                            onClick={() => toggleOption(question.id, option)}
                            className={`text-left p-4 border-2 transition-colors duration-200 ${
                              question.selectedOptions.includes(option)
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <textarea
                    value={question.answer}
                    onChange={(e) => updateAnswer(question.id, e.target.value)}
                    placeholder="Add custom details or additional context..."
                    className="w-full h-28 px-6 py-4 border-2 border-gray-300 focus:border-gray-900 resize-none transition-all duration-200 text-base"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex space-x-6 mt-12">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 bg-white text-gray-900 py-4 px-8 font-bold text-lg border-2 border-gray-300 hover:border-gray-900 transition-colors duration-200"
              >
                Back to Step 1
              </button>
              <button
                onClick={generateFinalPrompt}
                disabled={loading}
                className="flex-1 bg-gray-900 text-white py-4 px-8 font-bold text-lg hover:bg-white hover:text-gray-900 border-2 border-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Generating Prompt{apiProvider === 'openrouter' && selectedModels.length > 1 ? 's' : ''}...</span>
                  </>
                ) : (
                  <span>Generate Final Optimized Prompt{apiProvider === 'openrouter' && selectedModels.length > 1 ? 's' : ''}</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Final Optimized Prompt(s) */}
        {currentStep === 3 && (
          <div className="bg-white border-2 border-gray-900 p-10 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <CheckCircle className="w-8 h-8 text-gray-900 mr-4" />
              Step 3: Final Optimized Prompt{optimizedResults.length > 1 ? 's' : ''}
            </h2>
            
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              Your AI-optimized prompt{optimizedResults.length > 1 ? 's are' : ' is'} ready! 
              {optimizedResults.length > 1 ? ' Compare results from different models below.' : ' This structured prompt follows prompt engineering best practices and is ready for use with any AI system.'}
            </p>
            
            {/* Single Prompt (Gemini) */}
            {finalPrompt && (
              <div className="relative">
                <div className="bg-gray-100 border-2 border-gray-300 p-8 text-base overflow-x-auto">
                  <div className="mb-6 text-sm text-gray-700 font-bold uppercase tracking-wide">Final Optimized Prompt:</div>
                  <pre className="whitespace-pre-wrap font-mono leading-relaxed text-gray-900 text-base">
                    {finalPrompt}
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(finalPrompt)}
                  className={`absolute top-6 right-6 flex items-center space-x-2 px-6 py-3 font-bold transition-all duration-200 border-2 ${
                    copied.default 
                      ? 'bg-green-100 text-green-800 border-green-400' 
                      : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
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
                    <div className="bg-gray-100 border-2 border-gray-300 p-8 text-base overflow-x-auto">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="text-sm text-gray-700 font-bold uppercase tracking-wide">Model: {result.model}</div>
                      </div>
                      <pre className="whitespace-pre-wrap font-mono leading-relaxed text-gray-900 text-base">
                        {result.optimizedPrompt}
                      </pre>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.optimizedPrompt, result.model)}
                      className={`absolute top-6 right-6 flex items-center space-x-2 px-6 py-3 font-bold transition-all duration-200 border-2 ${
                        copied[result.model] 
                          ? 'bg-green-100 text-green-800 border-green-400' 
                          : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
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
                onClick={() => setCurrentStep(2)}
                className="flex-1 bg-white text-gray-900 py-4 px-8 font-bold text-lg border-2 border-gray-300 hover:border-gray-900 transition-colors duration-200"
              >
                Back to Questions
              </button>
              <button
                onClick={resetTool}
                className="flex-1 bg-gray-900 text-white py-4 px-8 font-bold text-lg hover:bg-white hover:text-gray-900 border-2 border-gray-900 transition-all duration-200 flex items-center justify-center space-x-3"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Start Over</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-700 text-base font-medium">
          <p>Powered by {apiProvider === 'gemini' ? 'Gemini 2.5 Pro' : 'OpenRouter Free Models'} • Transform your raw ideas into polished, AI-ready prompts</p>
        </div>
      </div>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { Lightbulb, MessageSquare, CheckCircle, Copy, RotateCcw, Sparkles, AlertCircle, Loader, Settings, Zap } from 'lucide-react';
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
          text: q,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Prompt Generator & Optimizer
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transform your raw ideas into polished, AI-ready prompts using Gemini AI or OpenRouter's free models
          </p>
        </div>

        {/* API Provider Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Settings className="w-5 h-5 text-blue-600 mr-2" />
              API Provider Selection
            </h3>
            {apiProvider === 'openrouter' && (
              <button
                onClick={() => setShowModelSelection(!showModelSelection)}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                <Zap className="w-4 h-4" />
                <span>Configure Models</span>
              </button>
            )}
          </div>
          
          <div className="flex space-x-4 mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="apiProvider"
                value="gemini"
                checked={apiProvider === 'gemini'}
                onChange={(e) => setApiProvider(e.target.value as ApiProvider)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">Gemini API</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="apiProvider"
                value="openrouter"
                checked={apiProvider === 'openrouter'}
                onChange={(e) => setApiProvider(e.target.value as ApiProvider)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">OpenRouter (Free Models)</span>
            </label>
          </div>

          {/* OpenRouter Model Selection */}
          {apiProvider === 'openrouter' && showModelSelection && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Free Models:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FREE_MODELS.map((model) => (
                  <label key={model.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors duration-200">
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model.id)}
                      onChange={() => handleModelToggle(model.id)}
                      className="w-4 h-4 text-blue-600 mt-1"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {selectedModels.length === 0 && (
                <p className="text-red-600 text-sm mt-2">Please select at least one model.</p>
              )}
            </div>
          )}

          {/* API Key Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <p className="font-semibold mb-1">Setup Required:</p>
                <p>
                  {apiProvider === 'gemini' 
                    ? 'Add your Gemini API key to .env: VITE_GEMINI_API_KEY=your_key'
                    : 'Add your OpenRouter API key to .env: VITE_OPENROUTER_API_KEY=your_key'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} transition-colors duration-300`}>
              <span className="text-sm font-bold">1</span>
            </div>
            <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'} transition-colors duration-300`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} transition-colors duration-300`}>
              <span className="text-sm font-bold">2</span>
            </div>
            <div className={`h-1 w-16 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'} transition-colors duration-300`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} transition-colors duration-300`}>
              <span className="text-sm font-bold">3</span>
            </div>
          </div>
        </div>

        {/* Step 1: Inputs */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Lightbulb className="w-6 h-6 text-blue-600 mr-3" />
              Step 1: Inputs
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  User Idea <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={userIdea}
                  onChange={(e) => setUserIdea(e.target.value)}
                  placeholder="Describe your initial concept, task, or desired outcome..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Overarching Instructions for AI Agent <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={overInstructions}
                  onChange={(e) => setOverInstructions(e.target.value)}
                  placeholder="Provide general guidelines, constraints, or behavioral instructions for the AI..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                />
              </div>
            </div>
            
            <button
              onClick={generateQuestions}
              disabled={loading || (apiProvider === 'openrouter' && selectedModels.length === 0)}
              className="mt-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
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
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
              Step 2: Clarifying Questions
            </h2>
            
            <p className="text-gray-600 mb-8">
              Based on your inputs, here are AI-generated clarifying questions to refine your prompt. Answer the ones most relevant to your needs - you don't need to answer all of them.
            </p>
            
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors duration-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {question.id}. {question.text}
                  </label>
                  <textarea
                    value={question.answer}
                    onChange={(e) => updateAnswer(question.id, e.target.value)}
                    placeholder="Your answer..."
                    className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
              >
                Back to Step 1
              </button>
              <button
                onClick={generateFinalPrompt}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
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
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              Step 3: Final Optimized Prompt{optimizedResults.length > 1 ? 's' : ''}
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your AI-optimized prompt{optimizedResults.length > 1 ? 's are' : ' is'} ready! 
              {optimizedResults.length > 1 ? ' Compare results from different models below.' : ' This structured prompt follows prompt engineering best practices and is ready for use with any AI system.'}
            </p>
            
            {/* Single Prompt (Gemini) */}
            {finalPrompt && (
              <div className="relative">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-sm overflow-x-auto">
                  <div className="mb-4 text-xs text-gray-500 font-mono">Final Optimized Prompt:</div>
                  <pre className="whitespace-pre-wrap font-mono leading-relaxed text-gray-800 text-sm">
                    {finalPrompt}
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(finalPrompt)}
                  className={`absolute top-4 right-4 flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    copied.default 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied.default ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}

            {/* Multiple Prompts (OpenRouter) */}
            {optimizedResults.length > 0 && (
              <div className="space-y-6">
                {optimizedResults.map((result, index) => (
                  <div key={index} className="relative">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-sm overflow-x-auto">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="text-xs text-gray-500 font-mono">Model: {result.model}</div>
                      </div>
                      <pre className="whitespace-pre-wrap font-mono leading-relaxed text-gray-800 text-sm">
                        {result.optimizedPrompt}
                      </pre>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.optimizedPrompt, result.model)}
                      className={`absolute top-4 right-4 flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        copied[result.model] 
                          ? 'bg-green-100 text-green-700 border border-green-300' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copied[result.model] ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
              >
                Back to Questions
              </button>
              <button
                onClick={resetTool}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start Over</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Powered by {apiProvider === 'gemini' ? 'Gemini AI' : 'OpenRouter Free Models'} • Transform your raw ideas into polished, AI-ready prompts</p>
        </div>
      </div>
    </div>
  );
}

export default App;
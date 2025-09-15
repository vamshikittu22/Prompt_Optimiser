import React, { useState } from 'react';
import { Lightbulb, MessageSquare, CheckCircle, Copy, RotateCcw, Sparkles, AlertCircle, Loader } from 'lucide-react';
import { GeminiService } from './services/geminiService';
import { Question } from './types';

function App() {
  const [userIdea, setUserIdea] = useState('');
  const [overInstructions, setOverInstructions] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateQuestions = async () => {
    if (!userIdea.trim() || !overInstructions.trim()) {
      setError('Please fill in both the User Idea and Overarching Instructions fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await GeminiService.generateClarifyingQuestions(userIdea, overInstructions);
      
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

      const response = await GeminiService.generateOptimizedPrompt(
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
        setCurrentStep(3);
      }
    } catch (err) {
      setError('Failed to generate optimized prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(finalPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    setCopied(false);
    setError('');
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
            Transform your raw ideas into polished, AI-ready prompts using Gemini AI and prompt engineering best practices
          </p>
        </div>

        {/* API Key Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Setup Required:</p>
              <p>To use this tool, you need to add your Gemini API key to the environment variables. Create a <code className="bg-yellow-100 px-1 rounded">.env</code> file with <code className="bg-yellow-100 px-1 rounded">VITE_GEMINI_API_KEY=your_api_key</code></p>
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
              disabled={loading}
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
                    <span>Generating Prompt...</span>
                  </>
                ) : (
                  <span>Generate Final Optimized Prompt</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Final Optimized Prompt */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              Step 3: Final Optimized Prompt
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your AI-optimized prompt is ready! This structured prompt follows prompt engineering best practices and is ready for use with any AI system.
            </p>
            
            <div className="relative">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-sm overflow-x-auto">
                <div className="mb-4 text-xs text-gray-500 font-mono">Final Optimized Prompt:</div>
                <pre className="whitespace-pre-wrap font-mono leading-relaxed text-gray-800 text-sm">
                  {finalPrompt}
                </pre>
              </div>
              <button
                onClick={copyToClipboard}
                className={`absolute top-4 right-4 flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  copied 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            
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
          <p>Powered by Gemini AI • Transform your raw ideas into polished, AI-ready prompts</p>
        </div>
      </div>
    </div>
  );
}

export default App;
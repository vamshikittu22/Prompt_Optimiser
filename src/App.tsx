import React, { useState } from 'react';
import { Lightbulb, MessageSquare, CheckCircle, Copy, RotateCcw, AlertCircle, Loader, Settings, Zap, Sparkles, Target } from 'lucide-react';
import { GeminiService } from './services/geminiService';
import { OpenRouterService, FREE_MODELS } from './services/openRouterService';
import { Question, OptimizedResult, PromptingStyle } from './types';

type ApiProvider = 'gemini' | 'openrouter';

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
  
  // API Provider Selection
  const [apiProvider, setApiProvider] = useState<ApiProvider>('gemini');
  const [selectedModels, setSelectedModels] = useState<string[]>([FREE_MODELS[0].id]);
  const [showModelSelection, setShowModelSelection] = useState(false);

  const generatePromptingStyles = async () => {
    if (!userIdea.trim() || !overInstructions.trim()) {
      setError('Please fill in both the User Idea and Overarching Instructions fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
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
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStyle = (styleId: string) => {
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

        if (response.results) {
          setOptimizedResults(response.results);
          setFinalPrompt('');
        }
      }
      
      setCurrentStep(4);
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
    setSuggestedStyles([]);
    setSelectedStyles([]);
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
                    </div>
                  </label>
                ))}
              </div>
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
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6 mb-12 animate-fade-in">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-700 mr-4 mt-1" />
              <p className="text-red-800 font-medium text-lg">{error}</p>
            </div>
          </div>
        )}

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
          </div>
        )}

        {/* Step 2: Prompting Style Selection */}
        {currentStep === 2 && (
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
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-primary-600 text-base font-medium">
          <p>Powered by {apiProvider === 'gemini' ? 'Gemini 2.5 Pro' : 'OpenRouter Free Models'} • Swiss Design Prompt Engineering</p>
        </div>
      </div>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { Lightbulb, MessageSquare, CheckCircle, Copy, RotateCcw, Sparkles } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  answer: string;
}

function App() {
  const [userIdea, setUserIdea] = useState('');
  const [overInstructions, setOverInstructions] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const generateQuestions = () => {
    if (!userIdea.trim() || !overInstructions.trim()) {
      alert('Please fill in both the User Idea and Overarching Instructions fields.');
      return;
    }

    // Generate 3-6 clarifying questions based on the framework
    const generatedQuestions: Question[] = [
      {
        id: 1,
        text: "Who is the target audience for this prompt? (e.g., beginners, experts, general users, specific professionals)",
        answer: ""
      },
      {
        id: 2,
        text: "What tone and style should the AI use? (e.g., formal, casual, persuasive, storytelling, conversational, technical)",
        answer: ""
      },
      {
        id: 3,
        text: "What is the desired length or format? (e.g., short summary, medium explanation, long detailed guide, step-by-step, bullet points)",
        answer: ""
      },
      {
        id: 4,
        text: "Should the AI provide examples or illustrations to support the response?",
        answer: ""
      },
      {
        id: 5,
        text: "Are there specific keywords, concepts, or constraints that must be included?",
        answer: ""
      },
      {
        id: 6,
        text: "Are there any additional constraints to consider? (e.g., time limits, resource limitations, style preferences)",
        answer: ""
      }
    ];

    setQuestions(generatedQuestions);
    setCurrentStep(2);
  };

  const updateAnswer = (id: number, answer: string) => {
    setQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, answer } : q)
    );
  };

  const generateFinalPrompt = () => {
    const answeredQuestions = questions.filter(q => q.answer.trim());
    
    if (answeredQuestions.length === 0) {
      alert('Please answer at least one clarifying question to generate the optimized prompt.');
      return;
    }

    // Construct the final optimized prompt following the framework
    let prompt = `# Context and Task\n${userIdea}\n\n`;
    prompt += `# Instructions\n${overInstructions}\n\n`;
    
    // Add clarifications based on answered questions
    prompt += `# Specifications\n`;
    answeredQuestions.forEach(q => {
      const specification = getSpecificationFromQuestion(q.text, q.answer);
      if (specification) {
        prompt += `${specification}\n`;
      }
    });
    
    prompt += `\n# Expected Output\nPlease provide a response that adheres to all the above requirements and specifications. Ensure your response is well-structured, clear, and directly addresses the task while following the specified tone, format, and constraints.`;

    setFinalPrompt(prompt);
    setCurrentStep(3);
  };

  const getSpecificationFromQuestion = (questionText: string, answer: string): string => {
    if (questionText.includes('target audience')) return `**Target Audience**: ${answer}`;
    if (questionText.includes('tone and style')) return `**Tone & Style**: ${answer}`;
    if (questionText.includes('length or format')) return `**Format & Length**: ${answer}`;
    if (questionText.includes('examples or illustrations')) return `**Examples Required**: ${answer}`;
    if (questionText.includes('keywords') || questionText.includes('concepts')) return `**Keywords & Constraints**: ${answer}`;
    if (questionText.includes('additional constraints')) return `**Additional Constraints**: ${answer}`;
    return `**Additional Context**: ${answer}`;
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
            Transform your raw ideas into polished, AI-ready prompts through structured optimization
          </p>
        </div>

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
              className="mt-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              Generate Clarifying Questions
            </button>
          </div>
        )}

        {/* Step 2: Generate Clarifying Questions */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
              Step 2: Generate Clarifying Questions
            </h2>
            
            <p className="text-gray-600 mb-8">
              Based on your inputs, here are clarifying questions to refine your prompt. Answer the ones most relevant to your needs - you don't need to answer all of them.
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
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                Generate Final Optimized Prompt
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Final Prompt Assembly */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              Step 3: Final Prompt Assembly
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your optimized prompt is ready! This structured prompt combines your original idea, overarching instructions, and clarifications into a clear, AI-ready format.
            </p>
            
            <div className="relative">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-sm overflow-x-auto">
                <div className="mb-4 text-xs text-gray-500 font-mono">Final Optimized Prompt:</div>
                <pre className="whitespace-pre-wrap font-mono leading-relaxed text-gray-800">
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
          <p>Transform your raw ideas into polished, AI-ready prompts through structured optimization</p>
        </div>
      </div>
    </div>
  );
}

export default App;
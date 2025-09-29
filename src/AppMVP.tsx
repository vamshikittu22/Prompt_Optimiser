import { useState } from 'react';
import { HeaderMVP } from './components/HeaderMVP';
import { StepOneMVP } from './components/StepOneMVP';
import { StepTwoMVP } from './components/StepTwoMVP';
import { StepThreeMVP } from './components/StepThreeMVP';
import { SidebarMVP } from './components/SidebarMVP';
import { FooterMVP } from './components/FooterMVP';
import { Toaster } from './components/ui/toaster';
import { useLocalStorage, SavedPrompt } from './hooks/useLocalStorage';
import { generateMockOptimizedPrompt, mockDelay } from './utils/mockData';

type Step = 1 | 2 | 3;
type View = 'home' | 'history';

function AppMVP() {
  // Navigation state
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [currentView, setCurrentView] = useState<View>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: User Input
  const [idea, setIdea] = useState('');
  const [instructions, setInstructions] = useState('');

  // Step 2: Styles & Questions
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Step 3: Optimized Prompt
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // LocalStorage hook
  const { savedPrompts, savePrompt, deletePrompt, loadPrompts } = useLocalStorage();

  // Step navigation handlers
  const handleStep1Next = async () => {
    setIsLoading(true);
    await mockDelay(800); // Simulate API call
    setCurrentStep(2);
    setIsLoading(false);
  };

  const handleStep2Next = async () => {
    setIsLoading(true);
    await mockDelay(1000); // Simulate API call

    // Generate mock optimized prompt
    const prompt = generateMockOptimizedPrompt(idea, instructions, selectedStyles, answers);
    setOptimizedPrompt(prompt);

    setCurrentStep(3);
    setIsLoading(false);
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleSave = () => {
    const title = idea.substring(0, 50) + (idea.length > 50 ? '...' : '');
    savePrompt({
      title,
      idea,
      instructions,
      selectedStyles,
      answers,
      optimizedPrompt
    });
    setIsSaved(true);
    loadPrompts(); // Refresh the list
  };

  const handleStartOver = () => {
    // Reset all state
    setIdea('');
    setInstructions('');
    setSelectedStyles([]);
    setAnswers({});
    setOptimizedPrompt('');
    setIsSaved(false);
    setCurrentStep(1);
  };

  const handleLoadPrompt = (prompt: SavedPrompt) => {
    // Load prompt data
    setIdea(prompt.idea);
    setInstructions(prompt.instructions);
    setSelectedStyles(prompt.selectedStyles);
    setAnswers(prompt.answers);
    setOptimizedPrompt(prompt.optimizedPrompt);
    setIsSaved(true);

    // Navigate to step 3 to show the loaded prompt
    setCurrentStep(3);
    setCurrentView('home');
  };

  const handleDeletePrompt = (id: string) => {
    deletePrompt(id);
    loadPrompts(); // Refresh the list
  };

  const handleStyleToggle = (styleId: string) => {
    setSelectedStyles(prev =>
      prev.includes(styleId)
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    if (view === 'history') {
      setIsSidebarOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <HeaderMVP
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      {/* Main Content */}
      <div className="flex flex-1 relative">
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            {currentView === 'home' ? (
              <>
                {/* Step 1: Input */}
                {currentStep === 1 && (
                  <StepOneMVP
                    idea={idea}
                    instructions={instructions}
                    onIdeaChange={setIdea}
                    onInstructionsChange={setInstructions}
                    onNext={handleStep1Next}
                    isLoading={isLoading}
                  />
                )}

                {/* Step 2: Clarification & Styles */}
                {currentStep === 2 && (
                  <StepTwoMVP
                    selectedStyles={selectedStyles}
                    onStyleToggle={handleStyleToggle}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                    onNext={handleStep2Next}
                    onBack={handleStep2Back}
                    isLoading={isLoading}
                  />
                )}

                {/* Step 3: Optimized Prompt */}
                {currentStep === 3 && (
                  <StepThreeMVP
                    optimizedPrompt={optimizedPrompt}
                    onSave={handleSave}
                    onStartOver={handleStartOver}
                    onBack={() => setCurrentStep(2)}
                    isSaved={isSaved}
                  />
                )}
              </>
            ) : (
              <div className="w-full max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">History</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  View your saved prompts in the sidebar →
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <SidebarMVP
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          savedPrompts={savedPrompts}
          onLoadPrompt={handleLoadPrompt}
          onDeletePrompt={handleDeletePrompt}
        />
      </div>

      {/* Footer */}
      <FooterMVP />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

export default AppMVP;

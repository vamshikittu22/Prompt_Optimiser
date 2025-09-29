import React from 'react';
import { Lightbulb, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface StepOneMVPProps {
  idea: string;
  instructions: string;
  onIdeaChange: (value: string) => void;
  onInstructionsChange: (value: string) => void;
  onNext: () => void;
  isLoading?: boolean;
}

export const StepOneMVP: React.FC<StepOneMVPProps> = ({
  idea,
  instructions,
  onIdeaChange,
  onInstructionsChange,
  onNext,
  isLoading = false
}) => {
  const canProceed = idea.trim().length > 0 && instructions.trim().length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          What would you like to create?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Share your idea and we'll help you craft the perfect prompt
        </p>
      </div>

      {/* Input Fields */}
      <div className="space-y-6">
        {/* Idea Input */}
        <div className="space-y-3">
          <Label htmlFor="idea" className="flex items-center gap-2 text-lg font-semibold">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Your Idea
          </Label>
          <Textarea
            id="idea"
            value={idea}
            onChange={(e) => onIdeaChange(e.target.value)}
            placeholder="Describe what you want to create... For example: 'A Python script that analyzes CSV files' or 'A marketing email for a new product launch'"
            className="min-h-[150px] text-base resize-none"
          />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Be specific about what you want to accomplish
          </p>
        </div>

        {/* Instructions Input */}
        <div className="space-y-3">
          <Label htmlFor="instructions" className="flex items-center gap-2 text-lg font-semibold">
            <Target className="h-5 w-5 text-blue-500" />
            Instructions/Goal
          </Label>
          <Textarea
            id="instructions"
            value={instructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            placeholder="What should the AI focus on? For example: 'Focus on error handling and clean code' or 'Make it persuasive and concise'"
            className="min-h-[150px] text-base resize-none"
          />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Tell us what aspects are most important to you
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          size="lg"
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Processing...
            </>
          ) : (
            'Generate Suggestions'
          )}
        </Button>
      </div>

      {/* Help Text */}
      {!canProceed && (
        <p className="text-center text-sm text-gray-700 dark:text-gray-300">
          Please fill in both fields to continue
        </p>
      )}
    </div>
  );
};

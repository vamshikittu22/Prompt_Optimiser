import React from 'react';
import { Palette, HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Chip } from './ui/chip';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { PROMPT_STYLES, CLARIFYING_QUESTIONS, ClarifyingQuestion } from '../utils/mockData';

interface StepTwoMVPProps {
  selectedStyles: string[];
  onStyleToggle: (styleId: string) => void;
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const StepTwoMVP: React.FC<StepTwoMVPProps> = ({
  selectedStyles,
  onStyleToggle,
  answers,
  onAnswerChange,
  onNext,
  onBack,
  isLoading = false
}) => {
  const canProceed = selectedStyles.length > 0 && 
    CLARIFYING_QUESTIONS.every(q => answers[q.id]?.length > 0);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Customize Your Prompt
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Select styles and answer questions to optimize your prompt
        </p>
      </div>

      {/* Prompt Styles Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-500" />
          <Label className="text-xl font-semibold">Select Prompt Styles</Label>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Choose one or more styles that fit your needs (you can select multiple)
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROMPT_STYLES.map((style) => (
            <Chip
              key={style.id}
              label={style.name}
              description={style.description}
              selected={selectedStyles.includes(style.id)}
              onClick={() => onStyleToggle(style.id)}
            />
          ))}
        </div>
      </div>

      {/* Clarifying Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-500" />
          <Label className="text-xl font-semibold">Clarifying Questions</Label>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Help us understand your requirements better
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CLARIFYING_QUESTIONS.map((question: ClarifyingQuestion) => (
            <div key={question.id} className="space-y-2">
              <Label htmlFor={question.id} className="text-sm font-medium">
                {question.question}
              </Label>
              <Select
                value={answers[question.id] || ''}
                onValueChange={(value) => onAnswerChange(question.id, value)}
              >
                <SelectTrigger id={question.id}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {question.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          size="lg"
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Optimizing...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>

      {/* Help Text */}
      {!canProceed && (
        <p className="text-center text-sm text-gray-700 dark:text-gray-300">
          Please select at least one style and answer all questions
        </p>
      )}
    </div>
  );
};

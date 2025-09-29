import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Palette, HelpCircle, CheckCircle } from 'lucide-react';

interface PromptingStyle {
  id: string;
  name: string;
  explanation: string;
  example: string;
}

interface ClarifyingQuestion {
  id: string;
  text: string;
  options?: string[];
  answer: string;
  type: 'text' | 'radio';
}

interface Step2ClarificationStylesProps {
  suggestedStyles: PromptingStyle[];
  clarifyingQuestions: ClarifyingQuestion[];
  selectedStyles: string[];
  onStyleToggle: (styleId: string) => void;
  onQuestionAnswer: (questionId: string, answer: string) => void;
  onSaveAndContinue: () => void;
  isLoading: boolean;
}

export const Step2ClarificationStyles: React.FC<Step2ClarificationStylesProps> = ({
  suggestedStyles,
  clarifyingQuestions,
  selectedStyles,
  onStyleToggle,
  onQuestionAnswer,
  onSaveAndContinue,
  isLoading
}) => {
  const [expandedStyle, setExpandedStyle] = useState<string | null>(null);

  const isFormValid = selectedStyles.length > 0 && 
    clarifyingQuestions.every(q => q.answer.trim().length > 0);

  return (
    <div className="space-y-6">
      {/* Prompting Styles Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-6 w-6 text-purple-500" />
            <span>Choose Prompting Styles</span>
          </CardTitle>
          <CardDescription>
            Select one or more styles that match your needs. Each style has different strengths.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedStyles.map((style) => (
              <div
                key={style.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedStyles.includes(style.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onStyleToggle(style.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">{style.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{style.explanation}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedStyle(expandedStyle === style.id ? null : style.id);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {expandedStyle === style.id ? 'Hide example' : 'Show example'}
                    </button>
                    {expandedStyle === style.id && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                        <strong>Example:</strong> {style.example}
                      </div>
                    )}
                  </div>
                  <div className="ml-2">
                    {selectedStyles.includes(style.id) && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clarifying Questions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-6 w-6 text-green-500" />
            <span>Clarifying Questions</span>
          </CardTitle>
          <CardDescription>
            Answer these questions to help us create the perfect prompt for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {clarifyingQuestions.map((question) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-base font-medium text-gray-900">
                  {question.text}
                </Label>
                
                {question.type === 'radio' && question.options ? (
                  <RadioGroup
                    value={question.answer}
                    onValueChange={(value) => onQuestionAnswer(question.id, value)}
                    className="space-y-2"
                  >
                    {question.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                        <Label htmlFor={`${question.id}-${option}`} className="text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Textarea
                    value={question.answer}
                    onChange={(e) => onQuestionAnswer(question.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[80px]"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save & Continue Button */}
      <div className="flex justify-center">
        <Button
          onClick={onSaveAndContinue}
          disabled={!isFormValid || isLoading}
          className="w-full max-w-md h-12 text-lg"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            'Save & Continue'
          )}
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
        <span>Step 2 of 3</span>
      </div>
    </div>
  );
};

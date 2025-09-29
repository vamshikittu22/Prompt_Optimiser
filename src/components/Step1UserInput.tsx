import React from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Lightbulb, Target } from 'lucide-react';

interface Step1UserInputProps {
  idea: string;
  instructions: string;
  onIdeaChange: (idea: string) => void;
  onInstructionsChange: (instructions: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const Step1UserInput: React.FC<Step1UserInputProps> = ({
  idea,
  instructions,
  onIdeaChange,
  onInstructionsChange,
  onGenerate,
  isLoading
}) => {
  const isFormValid = idea.trim().length > 0 && instructions.trim().length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          <span>Step 1: Describe Your Idea</span>
        </CardTitle>
        <CardDescription>
          Tell us what you want to create and how the AI should approach it
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Your Idea */}
        <div className="space-y-2">
          <Label htmlFor="idea" className="text-base font-medium text-gray-900">
            Your Idea
          </Label>
          <Textarea
            id="idea"
            value={idea}
            onChange={(e) => onIdeaChange(e.target.value)}
            placeholder="Describe what you want to create... (e.g., A blog post about sustainable living, A poem about space exploration, A business plan for a coffee shop)"
            className="min-h-[120px] text-base"
          />
          <p className="text-sm text-gray-500">
            Be as specific or general as you'd like. The more details you provide, the better we can help you.
          </p>
        </div>

        {/* Instructions/Goal */}
        <div className="space-y-2">
          <Label htmlFor="instructions" className="text-base font-medium text-gray-900 flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Instructions/Goal</span>
          </Label>
          <Textarea
            id="instructions"
            value={instructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            placeholder="What should the AI focus on? (e.g., Write in a professional tone, Include specific examples, Target a beginner audience, Make it engaging and conversational)"
            className="min-h-[120px] text-base"
          />
          <p className="text-sm text-gray-500">
            Provide guidance on tone, style, audience, or any specific requirements.
          </p>
        </div>

        {/* Generate Button */}
        <div className="pt-4">
          <Button
            onClick={onGenerate}
            disabled={!isFormValid || isLoading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating Suggestions...</span>
              </div>
            ) : (
              'Generate Suggestions'
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Tips for better results:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific about your target audience</li>
            <li>• Mention the tone or style you prefer</li>
            <li>• Include any constraints or requirements</li>
            <li>• Specify the format or structure you need</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

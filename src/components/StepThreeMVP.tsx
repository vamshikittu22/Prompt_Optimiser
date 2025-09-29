import React, { useState } from 'react';
import { Copy, Save, RotateCcw, Check, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';

interface StepThreeMVPProps {
  optimizedPrompt: string;
  onSave: () => void;
  onStartOver: () => void;
  onBack: () => void;
  isSaved?: boolean;
}

export const StepThreeMVP: React.FC<StepThreeMVPProps> = ({
  optimizedPrompt,
  onSave,
  onStartOver,
  onBack,
  isSaved = false
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(optimizedPrompt);
      setCopied(true);
      toast({
        title: 'Copied to clipboard!',
        description: 'Your optimized prompt has been copied.',
        duration: 3000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again or copy manually.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleSave = () => {
    onSave();
    toast({
      title: 'Saved successfully!',
      description: 'Your prompt has been saved to history.',
      duration: 3000,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Your Optimized Prompt
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your enhanced prompt ready to use
        </p>
      </div>

      {/* Optimized Prompt Display */}
      <div className="space-y-3">
        <div className="relative">
          <Textarea
            value={optimizedPrompt}
            readOnly
            className="min-h-[400px] text-base font-mono bg-gray-50 dark:bg-gray-900 resize-none"
          />
          
          {/* Copy Button Overlay */}
          <Button
            onClick={handleCopy}
            size="sm"
            variant="secondary"
            className="absolute top-3 right-3"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{optimizedPrompt.length} characters</span>
          <span>•</span>
          <span>{optimizedPrompt.split(/\s+/).length} words</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Edit
        </Button>

        <Button
          onClick={handleSave}
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={isSaved}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaved ? 'Saved' : 'Save Draft'}
        </Button>

        <Button
          onClick={onStartOver}
          variant="default"
          size="lg"
          className="flex-1"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Pro Tips
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Copy this prompt and paste it into your favorite AI tool</li>
          <li>• Save it to history for future reference</li>
          <li>• Experiment with different styles to find what works best</li>
        </ul>
      </div>
    </div>
  );
};

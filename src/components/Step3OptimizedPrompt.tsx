import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Textarea } from './ui/textarea';
import { 
  Copy, 
  Download, 
  RefreshCw, 
  Check, 
  FileText, 
  Code, 
  Share2,
  Star,
  Trash2
} from 'lucide-react';

interface Step3OptimizedPromptProps {
  optimizedPrompt: string;
  appliedStyles: string[];
  onRegenerate: () => void;
  onStartOver: () => void;
  onSaveToHistory: () => void;
  isLoading: boolean;
  isSaved: boolean;
}

export const Step3OptimizedPrompt: React.FC<Step3OptimizedPromptProps> = ({
  optimizedPrompt,
  appliedStyles,
  onRegenerate,
  onStartOver,
  onSaveToHistory,
  isLoading,
  isSaved
}) => {
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(optimizedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleExport = (format: 'json' | 'txt') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `optimized-prompt-${timestamp}.${format}`;
    
    if (format === 'json') {
      const data = {
        prompt: optimizedPrompt,
        appliedStyles,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([optimizedPrompt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Optimized Prompt Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-green-500" />
                <span>Optimized Prompt</span>
              </CardTitle>
              <CardDescription>
                Your personalized prompt is ready to use
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center space-x-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
              
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center space-x-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
                
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => {
                        handleExport('txt');
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Export as TXT</span>
                    </button>
                    <button
                      onClick={() => {
                        handleExport('json');
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Code className="h-4 w-4" />
                      <span>Export as JSON</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Applied Styles */}
            {appliedStyles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Applied styles:</span>
                {appliedStyles.map((style, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {style}
                  </span>
                ))}
              </div>
            )}

            {/* Prompt Text */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <Textarea
                value={optimizedPrompt}
                readOnly
                className="min-h-[300px] border-0 bg-transparent resize-none focus:ring-0"
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            {/* Character Count */}
            <div className="text-sm text-gray-500 text-right">
              {optimizedPrompt.length} characters
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={onStartOver}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Start Over</span>
        </Button>
        
        <Button
          onClick={onRegenerate}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Regenerating...' : 'Regenerate/Improve'}</span>
        </Button>
        
        <Button
          onClick={onSaveToHistory}
          variant="secondary"
          className="flex items-center space-x-2"
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Star className="h-4 w-4" />
              <span>Save to History</span>
            </>
          )}
        </Button>
      </div>

      {/* Usage Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-medium text-blue-900 mb-3">💡 How to use your optimized prompt:</h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Copy the prompt and paste it into your AI tool of choice</li>
            <li>• The prompt is designed to work with most AI models</li>
            <li>• You can modify the prompt further if needed</li>
            <li>• Save successful prompts to your history for future reference</li>
          </ul>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
        <span>Step 3 of 3 - Complete!</span>
      </div>
    </div>
  );
};

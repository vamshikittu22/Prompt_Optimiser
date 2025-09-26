import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type ModelType = 'openai' | 'gemini' | 'anthropic' | 'openrouter';

const MODELS = {
  openai: 'OpenAI (GPT-4)',
  gemini: 'Google Gemini',
  anthropic: 'Anthropic Claude',
  openrouter: 'OpenRouter'
};

export function PromptForm() {
  const [idea, setIdea] = useState('');
  const [specs, setSpecs] = useState('');
  const [model, setModel] = useState<ModelType>('openai');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Implement API call to generate prompt
      const response = await generatePrompt({ idea, specs, model, apiKey });
      setGeneratedPrompt(response.prompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="idea" className="block text-sm font-medium text-gray-700 mb-1">
            Your Idea or Concept *
          </label>
          <Input
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe what you want to achieve with your prompt..."
            required
          />
        </div>

        <div>
          <label htmlFor="specs" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Specifications (Optional)
          </label>
          <Textarea
            id="specs"
            value={specs}
            onChange={(e) => setSpecs(e.target.value)}
            placeholder="Any specific requirements, tone, or style preferences..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              AI Model
            </label>
            <Select value={model} onValueChange={(value) => setModel(value as ModelType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MODELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API Key *
            </label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Your ${MODELS[model]} API key`}
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Optimized Prompt'}
          </Button>
        </div>
      </form>

      {generatedPrompt && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Your Optimized Prompt</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(generatedPrompt)}
            >
              Copy to Clipboard
            </Button>
          </div>
          <div className="relative">
            <pre className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md overflow-x-auto text-sm">
              <code>{generatedPrompt}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// TODO: Implement this service
async function generatePrompt(params: {
  idea: string;
  specs: string;
  model: ModelType;
  apiKey: string;
}) {
  // This will be implemented in the API service
  return { prompt: 'Generated prompt will appear here' };
}

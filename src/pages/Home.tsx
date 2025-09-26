import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ModelType = 'openai' | 'gemini' | 'anthropic' | 'openrouter';

interface Model {
  id: string;
  name: string;
  provider: ModelType;
  description: string;
}

const MODELS: Record<ModelType, Model[]> = {
  openai: [
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai', description: 'Most capable model, great for complex tasks' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', description: 'Fast and capable model, good balance of speed and quality' },
  ],
  gemini: [
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'gemini', description: 'Google\'s most capable model for complex tasks' },
  ],
  anthropic: [
    { id: 'claude-2', name: 'Claude 2', provider: 'anthropic', description: 'Anthropic\'s most capable model, great for complex tasks' },
    { id: 'claude-instant', name: 'Claude Instant', provider: 'anthropic', description: 'Fast and capable model, good balance of speed and quality' },
  ],
  openrouter: [
    { id: 'openrouter/auto', name: 'Auto (Best Available)', provider: 'openrouter', description: 'Automatically selects the best available model' },
  ],
};\n
export function Home() {
  const navigate = useNavigate();
  const [idea, setIdea] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModelSelection, setShowModelSelection] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ModelType | null>(null);

  const handleGenerate = async () => {
    if (!idea.trim()) {
      alert('Please enter your idea');
      return;
    }

    if (!selectedModel) {
      alert('Please select a model');
      return;
    }

    if (!apiKey.trim()) {
      alert('Please enter your API key');
      return;
    }

    setIsLoading(true);
    
    try {
      // Save to local storage
      const promptData = {
        id: Date.now(),
        idea,
        specifications,
        model: selectedModel.id,
        provider: selectedModel.provider,
        createdAt: new Date().toISOString(),
      };
      
      const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
      localStorage.setItem('promptHistory', JSON.stringify([promptData, ...history]));
      
      // In a real app, you would call your API here
      // const response = await generatePrompt({
      //   idea,
      //   specifications,
      //   model: selectedModel.id,
      //   apiKey,
      // });
      
      // For now, just navigate to the next step
      navigate('/generate', { state: { promptData } });
    } catch (error) {
      console.error('Error generating prompt:', error);
      alert('Failed to generate prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
    setShowModelSelection(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Prompt Generator</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's your idea?</CardTitle>
            <CardDescription>
              Describe what you want to achieve with your prompt. Be as specific as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="I want to create a prompt that helps me write engaging blog posts about technology..."
              className="min-h-[100px] mb-4"
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Specifications (Optional)</CardTitle>
            <CardDescription>
              Add any specific requirements, tone, style, or constraints for your prompt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              placeholder="The tone should be professional but conversational. Include examples where relevant..."
              className="min-h-[100px] mb-4"
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select AI Model</CardTitle>
            <CardDescription>
              Choose the AI model you want to use for generating your prompt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedModel ? (
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => setShowModelSelection(true)}
              >
                <span>Select a model</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Button>
            ) : (
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{selectedModel.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedModel.description}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowModelSelection(true)}>
                    Change
                  </Button>
                </div>
              </div>
            )}

            {showModelSelection && (
              <div className="mt-4 space-y-2">
                {Object.entries(MODELS).map(([provider, models]) => (
                  <div key={provider} className="space-y-2">
                    <h4 className="text-sm font-medium capitalize">{provider}</h4>
                    <div className="grid gap-2">
                      {models.map((model) => (
                        <div
                          key={model.id}
                          className={`p-3 border rounded-md cursor-pointer hover:bg-accent ${
                            selectedModel?.id === model.id ? 'border-primary bg-accent' : ''
                          }`}
                          onClick={() => handleModelSelect(model)}
                        >
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-muted-foreground">{model.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Key</CardTitle>
            <CardDescription>
              Enter your API key for the selected model. Your key is stored locally and never sent to our servers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-... or your API key"
              className="mb-2"
            />
            <p className="text-xs text-muted-foreground">
              Don't have an API key? Get one from{' '}
              <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                OpenAI
              </a>{' '}
              or{' '}
              <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google AI Studio
              </a>
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            onClick={handleGenerate}
            disabled={isLoading || !idea.trim() || !selectedModel || !apiKey.trim()}
          >
            {isLoading ? 'Generating...' : 'Generate Prompt'}
          </Button>
        </div>
      </div>
    </div>
  );
}

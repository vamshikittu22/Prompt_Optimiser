import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Label } from "./components/ui/label";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { Settings, ExternalLink, Info } from 'lucide-react';

type Step = 'start' | 'questions' | 'result';

interface Question {
  id: string;
  question: string;
  answer: string;
  type: 'text' | 'radio';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface ModelInfo {
  name: string;
  description: string;
  provider: string;
  link: string;
  pricing?: string;
  contextWindow?: string;
}

interface ModelConfig {
  id: string;
  name: string;
  endpoint: string;
  info: ModelInfo;
  getHeaders: (apiKey: string) => Record<string, string>;
  getBody: (systemPrompt: string, userMessage: string) => any;
}

const MODEL_INFO: Record<string, ModelInfo> = {
  'gpt-4': {
    name: 'GPT-4',
    description: 'Most capable model, optimized for complex tasks',
    provider: 'OpenAI',
    link: 'https://platform.openai.com/docs/models/gpt-4',
    pricing: '$0.03/1K prompt tokens, $0.06/1K completion tokens',
    contextWindow: '8,192 tokens'
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    description: 'Fast and capable model, good balance of speed and quality',
    provider: 'OpenAI',
    link: 'https://platform.openai.com/docs/models/gpt-3-5',
    pricing: '$0.0015/1K tokens',
    contextWindow: '16,385 tokens'
  },
  'claude-2': {
    name: 'Claude 2',
    description: 'Balanced performance with strong reasoning capabilities',
    provider: 'Anthropic',
    link: 'https://docs.anthropic.com/claude/docs',
    pricing: '$0.03/1K tokens',
    contextWindow: '100,000 tokens'
  },
  'gemini-pro': {
    name: 'Gemini Pro',
    description: 'Google\'s most capable model for a wide range of tasks',
    provider: 'Google AI',
    link: 'https://ai.google.dev/models/gemini',
    contextWindow: '30,720 tokens'
  },
  'openrouter/openai/gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo (Free)',
    description: 'Free access to GPT-3.5 Turbo via OpenRouter',
    provider: 'OpenRouter',
    link: 'https://openrouter.ai/models/openai/gpt-3.5-turbo',
    pricing: 'Free tier available'
  },
  'openrouter/google/gemini-pro': {
    name: 'Gemini Pro (Free)',
    description: 'Free access to Google\'s Gemini Pro via OpenRouter',
    provider: 'OpenRouter',
    link: 'https://openrouter.ai/models/google/gemini-pro',
    pricing: 'Free tier available'
  },
  'openrouter/anthropic/claude-3-haiku': {
    name: 'Claude 3 Haiku (Free)',
    description: 'Fast and cost-effective model via OpenRouter',
    provider: 'OpenRouter',
    link: 'https://openrouter.ai/models/anthropic/claude-3-haiku',
    pricing: 'Free tier available'
  },
  'openrouter/mistralai/mistral-7b-instruct': {
    name: 'Mistral 7B (Free)',
    description: 'High-quality open-weight model via OpenRouter',
    provider: 'OpenRouter',
    link: 'https://openrouter.ai/models/mistralai/mistral-7b-instruct',
    pricing: 'Free tier available'
  },
  'openrouter/meta-llama/llama-3-8b-instruct': {
    name: 'Llama 3 8B (Free)',
    description: 'Meta\'s latest open-weight model via OpenRouter',
    provider: 'OpenRouter',
    link: 'https://openrouter.ai/models/meta-llama/llama-3-8b-instruct',
    pricing: 'Free tier available'
  }
};

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    info: MODEL_INFO['gpt-4'],
    getHeaders: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    getBody: (systemPrompt: string, userMessage: string) => ({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    info: MODEL_INFO['gpt-3.5-turbo'],
    getHeaders: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    getBody: (systemPrompt: string, userMessage: string) => ({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  },
  'claude-2': {
    id: 'claude-2',
    name: 'Claude 2',
    endpoint: 'https://api.anthropic.com/v1/messages',
    info: MODEL_INFO['claude-2'],
    getHeaders: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    }),
    getBody: (systemPrompt: string, userMessage: string) => ({
      model: 'claude-2.1',
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      max_tokens: 1000,
      temperature: 0.7
    })
  },
  'gemini-pro': {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    endpoint: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent`,
    info: MODEL_INFO['gemini-pro'],
    getHeaders: (apiKey: string) => ({
      'Content-Type': 'application/json'
    }),
    getBody: (systemPrompt: string, userMessage: string) => ({
      contents: [
        {
          parts: [
            { text: systemPrompt },
            { text: userMessage }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    })
  },
  // OpenRouter models
  ...Object.entries(MODEL_INFO)
    .filter(([id]) => id.startsWith('openrouter/'))
    .reduce((acc, [modelId, modelInfo]) => {
      const openRouterModelId = modelId.replace('openrouter/', '');
      return {
        ...acc,
        [modelId]: {
          id: modelId,
          name: modelInfo.name,
          endpoint: 'https://openrouter.ai/api/v1/chat/completions',
          info: modelInfo,
          getHeaders: (apiKey: string) => ({
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Prompt Optimizer',
            'Content-Type': 'application/json'
          }),
          getBody: (systemPrompt: string, userMessage: string) => ({
            model: openRouterModelId,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        }
      };
    }, {})
};

function App() {
  const [step, setStep] = useState<Step>('start');
  const [model, setModel] = useState<keyof typeof MODEL_CONFIGS>('gpt-4');
  const [apiKey, setApiKey] = useState('');
  const [localApiKey, setLocalApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [showModelInfo, setShowModelInfo] = useState<ModelInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([
    { 
      id: '1', 
      question: 'What is the main goal of this prompt?', 
      answer: '',
      type: 'text',
      required: true,
      placeholder: 'Describe what you want the AI to do...'
    },
    {
      id: '2',
      question: 'What tone should the response have?',
      answer: '',
      type: 'radio',
      options: ['Professional', 'Casual', 'Friendly', 'Formal', 'Technical']
    },
    {
      id: '3',
      question: 'Any specific format or structure required?',
      answer: '',
      type: 'text',
      placeholder: 'e.g., bullet points, step-by-step, paragraph...'
    }
  ]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved API key from localStorage on component mount and when model changes
  useEffect(() => {
    const modelKey = `${model.replace(/[^a-z0-9]/gi, '_')}_api_key`;
    const savedApiKey = localStorage.getItem(modelKey) || '';
    setApiKey(savedApiKey);
    setLocalApiKey(savedApiKey);
  }, [model]);

  const handleSaveSettings = () => {
    const modelKey = `${model.replace(/[^a-z0-9]/gi, '_')}_api_key`;
    localStorage.setItem(modelKey, localApiKey);
    setApiKey(localApiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAnswerChange = (id: string, value: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, answer: value } : q
    ));
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setApiKeyError('API key is required');
      setIsSettingsOpen(true);
      return;
    }

    setIsLoading(true);
    setApiKeyError('');

    try {
      const config = MODEL_CONFIGS[model];
      const systemPrompt = 'You are a helpful AI assistant that helps optimize prompts.';
      const userMessage = questions.map(q => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n');
      
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: config.getHeaders(apiKey),
        body: JSON.stringify(config.getBody(systemPrompt, userMessage))
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      let generatedText = '';
      if (model.startsWith('openrouter/')) {
        generatedText = data.choices?.[0]?.message?.content || '';
      } else if (model === 'gemini-pro') {
        generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else if (model === 'claude-2') {
        generatedText = data.content?.[0]?.text || '';
      } else {
        generatedText = data.choices?.[0]?.message?.content || '';
      }

      setGeneratedPrompt(generatedText);
      setStep('result');
    } catch (error) {
      console.error('Error generating prompt:', error);
      setApiKeyError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestionInput = (question: Question) => {
    if (question.type === 'radio' && question.options) {
      return (
        <div className="space-y-2">
          {question.options.map((option) => (
            <div key={option} className="flex items-center">
              <input
                type="radio"
                id={`${question.id}-${option}`}
                name={question.id}
                checked={question.answer === option}
                onChange={() => handleAnswerChange(question.id, option)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={`${question.id}-${option}`}
                className="ml-2 text-sm text-gray-700"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      );
    }

    return (
      <Textarea
        id={question.id}
        value={question.answer}
        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
        placeholder={question.placeholder}
        className="min-h-[80px]"
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prompt Optimizer</h1>
          <p className="text-gray-600">Get the most out of your AI prompts</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Model Settings</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Model
                </Label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value as keyof typeof MODEL_CONFIGS)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.entries(MODEL_CONFIGS).map(([id, config]) => (
                    <option key={id} value={id}>
                      {config.name}
                    </option>
                  ))}
                </select>
                <div className="mt-1 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowModelInfo(MODEL_CONFIGS[model].info)}
                    className="text-xs text-blue-600 hover:underline flex items-center"
                  >
                    <Info className="h-3 w-3 mr-1" />
                    About this model
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {step === 'start' && (
          <Card>
            <CardHeader>
              <CardTitle>Create Your Prompt</CardTitle>
              <CardDescription>
                Answer these questions to help us generate the best prompt for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {questions.map((question) => (
                  <div key={question.id}>
                    <Label htmlFor={question.id} className="block text-sm font-medium text-gray-700 mb-1">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderQuestionInput(question)}
                  </div>
                ))}
                <div className="pt-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading || questions.some(q => q.required && !q.answer.trim())}
                    className="w-full"
                  >
                    {isLoading ? 'Generating...' : 'Generate Optimized Prompt'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'result' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Optimized Prompt</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPrompt);
                  }}
                >
                  Copy to Clipboard
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap">{generatedPrompt}</pre>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('start')}
                >
                  Start Over
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? 'Regenerating...' : 'Regenerate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>API Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="api-key" className="text-sm font-medium text-gray-700">
                  {MODEL_CONFIGS[model]?.name} API Key
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder={
                    model.includes('openai')
                      ? 'sk-...'
                      : model.includes('anthropic')
                      ? 'sk-ant-...'
                      : 'Enter your API key...'
                  }
                  value={localApiKey}
                  onChange={(e) => {
                    setLocalApiKey(e.target.value);
                    setApiKeyError('');
                  }}
                  className={`mt-1 ${apiKeyError ? 'border-red-500' : ''}`}
                />
                {apiKeyError && (
                  <p className="mt-1 text-sm text-red-600">{apiKeyError}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Your API key is stored locally in your browser and never sent to our servers.
                  {model.includes('openai') && (
                    <span>
                      {' '}Get your OpenAI API key from{' '}
                      <a
                        href="https://platform.openai.com/account/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        OpenAI
                      </a>
                      .
                    </span>
                  )}
                  {model.includes('anthropic') && (
                    <span>
                      {' '}Get your Anthropic API key from{' '}
                      <a
                        href="https://console.anthropic.com/settings/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Anthropic
                      </a>
                      .
                    </span>
                  )}
                  {model.includes('openrouter') && (
                    <span>
                      {' '}Get your OpenRouter API key from{' '}
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        OpenRouter
                      </a>
                      .
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-500">
                {isSaved && <span className="text-green-600">✓ Settings saved</span>}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Model Info Dialog */}
        {showModelInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{showModelInfo.name}</h3>
                  <button
                    onClick={() => setShowModelInfo(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 mb-4">{showModelInfo.description}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Provider:</span> {showModelInfo.provider}</p>
                  {showModelInfo.pricing && (
                    <p><span className="font-medium">Pricing:</span> {showModelInfo.pricing}</p>
                  )}
                  {showModelInfo.contextWindow && (
                    <p><span className="font-medium">Context Window:</span> {showModelInfo.contextWindow}</p>
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <a
                    href={showModelInfo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:underline"
                  >
                    Learn more <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
  
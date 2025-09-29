import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Settings, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

interface HeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onSaveSettings: () => void;
  isApiKeyValid: boolean;
  isUsingEnvKey: boolean;
  availableModels: Array<{
    id: string;
    name: string;
    provider: string;
  }>;
}

export const Header: React.FC<HeaderProps> = ({
  selectedModel,
  onModelChange,
  apiKey,
  onApiKeyChange,
  onSaveSettings,
  isApiKeyValid,
  isUsingEnvKey,
  availableModels
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* App Name */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Prompt Optimizer</h1>
        </div>

        {/* Model Selector & API Key */}
        <div className="flex items-center space-x-4">
          {/* Model Selector */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="model-select" className="text-sm font-medium text-gray-700">
              Model:
            </Label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Select AI model"
            >
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
          </div>

          {/* API Key Input */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="API Key"
                className="w-48 pr-8"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* API Key Status */}
            <div className="flex items-center space-x-2">
              {isApiKeyValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {isUsingEnvKey && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Using .env key
                </span>
              )}
            </div>

            {/* Save Button */}
            <Button
              onClick={onSaveSettings}
              size="sm"
              disabled={!apiKey.trim()}
            >
              Save
            </Button>
          </div>

          {/* Settings Gear */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Collapsible Settings Panel */}
      {isSettingsOpen && (
        <div className="mt-4 p-4 bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperature" className="text-sm font-medium text-gray-700">
                  Temperature
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  defaultValue="0.7"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="max-tokens" className="text-sm font-medium text-gray-700">
                  Max Tokens
                </Label>
                <Input
                  id="max-tokens"
                  type="number"
                  min="100"
                  max="4000"
                  defaultValue="1000"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

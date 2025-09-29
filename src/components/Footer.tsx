import React from 'react';
import { Github, ExternalLink, Info } from 'lucide-react';

interface FooterProps {
  selectedModel: string;
  modelProvider: string;
  version: string;
}

export const Footer: React.FC<FooterProps> = ({
  selectedModel,
  modelProvider,
  version
}) => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left side - Credits */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span>Powered by</span>
              <span className="font-medium text-gray-900">{modelProvider}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">{selectedModel}</span>
            </div>
          </div>

          {/* Center - Version info */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>Version {version}</span>
            </div>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
            
            <a
              href="https://docs.example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Documentation</span>
            </a>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 space-y-2 md:space-y-0">
            <div className="text-center md:text-left">
              <p>
                Prompt Optimizer helps you create better AI prompts through guided optimization.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span>© 2024 Prompt Optimizer</span>
              <span>•</span>
              <span>Built with React & TypeScript</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

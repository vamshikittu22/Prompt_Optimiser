import React from 'react';
import { Heart } from 'lucide-react';

export const FooterMVP: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Version Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">MVP v1</span>
            <span>•</span>
            <span>API integration coming in v2</span>
          </div>

          {/* Made with Love */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <span>by the Prompt Optimizer Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

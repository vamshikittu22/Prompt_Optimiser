import React from 'react';
import { Sparkles, Menu } from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface HeaderMVPProps {
  onToggleSidebar: () => void;
  currentView: 'home' | 'history';
  onViewChange: (view: 'home' | 'history') => void;
}

export const HeaderMVP: React.FC<HeaderMVPProps> = ({
  onToggleSidebar,
  currentView,
  onViewChange
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Prompt Optimizer
            </h1>
          </div>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant={currentView === 'home' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('home')}
          >
            Home
          </Button>
          <Button
            variant={currentView === 'history' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('history')}
          >
            History
          </Button>
        </nav>

        {/* Right: Model Selector */}
        <div className="flex items-center gap-3">
          <Select defaultValue="gemini" disabled>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">Gemini Pro</SelectItem>
              <SelectItem value="claude">Claude 3</SelectItem>
              <SelectItem value="gpt4">GPT-4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
};

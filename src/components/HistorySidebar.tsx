import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { 
  History, 
  Search, 
  Trash2, 
  Copy, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Clock,
  Filter
} from 'lucide-react';

interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  appliedStyles: string[];
  timestamp: string;
  isFavorite: boolean;
}

interface HistorySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  savedPrompts: SavedPrompt[];
  onLoadPrompt: (prompt: SavedPrompt) => void;
  onDeletePrompt: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onToggle,
  savedPrompts,
  onLoadPrompt,
  onDeletePrompt,
  onToggleFavorite
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  const filteredPrompts = savedPrompts
    .filter(prompt => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = !filterFavorites || prompt.isFavorite;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="fixed left-4 top-20 z-40 lg:hidden"
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>History</span>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="lg:hidden"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2 mb-4">
              <Button
                variant={filterFavorites ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterFavorites(!filterFavorites)}
                className="flex items-center space-x-1"
              >
                <Star className="h-3 w-3" />
                <span>Favorites</span>
              </Button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'alphabetical')}
                className="text-xs border border-gray-300 rounded px-2 py-1"
                aria-label="Sort prompts"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredPrompts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">
                  {savedPrompts.length === 0 
                    ? "No saved prompts yet" 
                    : "No prompts match your search"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPrompts.map((prompt) => (
                  <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium text-gray-900 line-clamp-2">
                          {prompt.title}
                        </CardTitle>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleFavorite(prompt.id)}
                            className="p-1 h-6 w-6"
                          >
                            <Star 
                              className={`h-3 w-3 ${
                                prompt.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'
                              }`} 
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeletePrompt(prompt.id)}
                            className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 mb-2 line-clamp-3">
                        {truncateText(prompt.prompt)}
                      </p>
                      
                      {/* Applied Styles */}
                      {prompt.appliedStyles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {prompt.appliedStyles.slice(0, 2).map((style, index) => (
                            <span
                              key={index}
                              className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                            >
                              {style}
                            </span>
                          ))}
                          {prompt.appliedStyles.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{prompt.appliedStyles.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(prompt.timestamp)}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onLoadPrompt(prompt)}
                          className="text-xs px-2 py-1 h-6"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Load
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              {savedPrompts.length} saved prompt{savedPrompts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

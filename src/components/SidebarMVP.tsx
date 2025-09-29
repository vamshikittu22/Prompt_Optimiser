import React from 'react';
import { History, Trash2, Eye, X, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { SavedPrompt } from '../hooks/useLocalStorage';
// ScrollArea component removed - using regular div with overflow

interface SidebarMVPProps {
  isOpen: boolean;
  onClose: () => void;
  savedPrompts: SavedPrompt[];
  onLoadPrompt: (prompt: SavedPrompt) => void;
  onDeletePrompt: (id: string) => void;
}

export const SidebarMVP: React.FC<SidebarMVPProps> = ({
  isOpen,
  onClose,
  savedPrompts,
  onLoadPrompt,
  onDeletePrompt
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-white dark:bg-gray-900 
          border-l border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          md:relative md:top-0 md:h-auto md:min-h-screen
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                History
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Saved Prompts List */}
          <div className="flex-1 p-4 overflow-y-auto">
            {savedPrompts.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <History className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No saved prompts yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600">
                  Save your prompts to access them later
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="group border border-gray-200 dark:border-gray-800 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="space-y-2">
                      {/* Title */}
                      <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
                        {prompt.title}
                      </h3>
                      
                      {/* Preview */}
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {truncateText(prompt.idea)}
                      </p>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatDate(prompt.timestamp)}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => {
                            onLoadPrompt(prompt);
                            onClose();
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Load
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this prompt?')) {
                              onDeletePrompt(prompt.id);
                            }
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

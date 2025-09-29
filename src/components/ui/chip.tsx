import React from 'react';
import { cn } from '@/lib/utils';

interface ChipProps {
  label: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  description,
  selected = false,
  onClick,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start p-4 rounded-lg border-2 transition-all duration-200',
        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2',
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300',
        className
      )}
    >
      <span className={cn(
        'font-medium text-sm',
        selected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
      )}>
        {label}
      </span>
      {description && (
        <span className={cn(
          'text-xs mt-1',
          selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
        )}>
          {description}
        </span>
      )}
    </button>
  );
};

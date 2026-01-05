import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TagChipsProps {
  tags: string[];
  maxDisplay?: number;
  onTagClick?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  size?: 'sm' | 'md';
  variant?: 'default' | 'outline';
}

export default function TagChips({ 
  tags, 
  maxDisplay = 3, 
  onTagClick,
  onTagRemove,
  size = 'sm',
  variant = 'outline'
}: TagChipsProps) {
  if (!tags || tags.length === 0) return null;

  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayTags.map((tag, index) => (
        <Badge
          key={index}
          variant={variant}
          className={`
            ${sizeClasses[size]}
            ${onTagClick ? 'cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors' : ''}
            inline-flex items-center gap-1
          `}
          onClick={() => onTagClick?.(tag)}
        >
          <span className="text-primary">#</span>
          <span>{tag}</span>
          {onTagRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTagRemove(tag);
              }}
              className="ml-1 hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="secondary" className={sizeClasses[size]}>
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}

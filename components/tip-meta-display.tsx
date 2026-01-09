import { Lightbulb, BookOpen, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface TipMetaDisplayProps {
  category?: string;
  readTime?: number; // minutes
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export default function TipMetaDisplay({
  category,
  readTime,
  difficulty,
  tags = [],
}: TipMetaDisplayProps) {
  const difficultyConfig = {
    easy: { label: 'Dễ', color: 'bg-green-100 text-green-700' },
    medium: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700' },
    hard: { label: 'Khó', color: 'bg-red-100 text-red-700' },
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 text-amber-700">
          <Lightbulb className="h-5 w-5 fill-amber-400" />
          <span className="font-semibold">Mẹo hữu ích</span>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-2">
          {category && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {category}
            </Badge>
          )}
          {readTime && (
            <Badge variant="outline" className="border-amber-200 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readTime} phút đọc
            </Badge>
          )}
          {difficulty && (
            <Badge variant="outline" className={`border-amber-200 ${difficultyConfig[difficulty].color}`}>
              {difficultyConfig[difficulty].label}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-amber-200">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 bg-white rounded-full text-amber-700 border border-amber-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

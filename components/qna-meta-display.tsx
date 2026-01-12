import { MessageCircle, CheckCircle2, Award } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface QnaMetaDisplayProps {
  topic?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isAnswered?: boolean;
  bestAnswerId?: number;
  answerCount?: number;
  expertAnswered?: boolean;
}

export default function QnaMetaDisplay({
  topic,
  difficulty,
  isAnswered = false,
  bestAnswerId,
  answerCount = 0,
  expertAnswered = false,
}: QnaMetaDisplayProps) {
  const difficultyConfig = {
    beginner: { label: 'Cơ bản', color: 'bg-green-100 text-green-700 border-green-200' },
    intermediate: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    advanced: { label: 'Nâng cao', color: 'bg-red-100 text-red-700 border-red-200' },
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <div className="space-y-3">
        {/* Status & Stats */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {isAnswered ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Đã có câu trả lời</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-600">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Chưa có câu trả lời</span>
              </div>
            )}
            {expertAnswered && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 flex items-center gap-1">
                <Award className="h-3 w-3" />
                Chuyên gia
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MessageCircle className="h-4 w-4" />
            <span>{answerCount} câu trả lời</span>
          </div>
        </div>

        {/* Topic & Difficulty */}
        <div className="flex flex-wrap gap-2">
          {topic && (
            <Badge variant="secondary" className="bg-orange-100 text-blue-700">
              📚 {topic}
            </Badge>
          )}
          {difficulty && difficultyConfig[difficulty] && (
            <Badge variant="outline" className={`border ${difficultyConfig[difficulty].color}`}>
              {difficultyConfig[difficulty].label}
            </Badge>
          )}
        </div>

        {/* Best Answer Indicator */}
        {bestAnswerId && (
          <div className="pt-2 border-t border-blue-200">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <Award className="h-4 w-4 fill-amber-400" />
              <span className="font-medium">Có câu trả lời hay nhất</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

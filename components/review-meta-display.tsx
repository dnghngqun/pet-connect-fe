import { ThumbsUp, ThumbsDown } from 'lucide-react';
import ReviewStars from './review-stars';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface ReviewMetaDisplayProps {
  rating: number;
  serviceName?: string;
  visitDate?: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend?: boolean;
}

export default function ReviewMetaDisplay({
  rating,
  serviceName,
  visitDate,
  pros = [],
  cons = [],
  wouldRecommend,
}: ReviewMetaDisplayProps) {
  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <div className="space-y-3">
        {/* Rating */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">Đánh giá dịch vụ</div>
            <ReviewStars rating={rating} size="lg" />
          </div>
          {wouldRecommend !== undefined && (
            <div className="flex items-center gap-2">
              {wouldRecommend ? (
                <>
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Khuyên dùng</span>
                </>
              ) : (
                <>
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Không khuyên</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Service Info */}
        {(serviceName || visitDate) && (
          <div className="flex flex-wrap gap-2 text-sm">
            {serviceName && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                📍 {serviceName}
              </Badge>
            )}
            {visitDate && (
              <Badge variant="outline" className="border-purple-200">
                📅 {new Date(visitDate).toLocaleDateString('vi-VN')}
              </Badge>
            )}
          </div>
        )}

        {/* Pros & Cons */}
        {(pros.length > 0 || cons.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-purple-200">
            {pros.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">Ưu điểm</span>
                </div>
                <ul className="space-y-1">
                  {pros.map((pro, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cons.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-700">Nhược điểm</span>
                </div>
                <ul className="space-y-1">
                  {cons.map((con, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-1">
                      <span className="text-red-500 mt-0.5">✗</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

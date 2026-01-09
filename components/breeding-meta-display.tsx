import { Heart, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface BreedingMetaDisplayProps {
  petBreed: string;
  petGender: 'male' | 'female';
  age?: number; // months
  isNeutered?: boolean;
  isVaccinated?: boolean;
  healthCertified?: boolean;
  lookingFor?: string; // breed to match with
  requirements?: string[];
  fee?: number;
}

export default function BreedingMetaDisplay({
  petBreed,
  petGender,
  age,
  isNeutered = false,
  isVaccinated = false,
  healthCertified = false,
  lookingFor,
  requirements = [],
  fee,
}: BreedingMetaDisplayProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 text-pink-700">
          <Heart className="h-5 w-5 fill-pink-400" />
          <span className="font-semibold">Thông tin phối giống</span>
        </div>

        {/* Pet Info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Giống</div>
            <Badge className="bg-pink-100 text-pink-700 border-pink-200">
              {petBreed}
            </Badge>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Giới tính</div>
            <Badge variant="outline" className="border-pink-200">
              {petGender === 'male' ? '♂ Đực' : '♀ Cái'}
            </Badge>
          </div>
          {age && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Tuổi</div>
              <span className="text-sm font-medium">{age} tháng</span>
            </div>
          )}
          {fee !== undefined && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Phí dịch vụ</div>
              <span className="text-sm font-semibold text-pink-700">
                {fee === 0 ? 'Miễn phí' : `${formatPrice(fee)} VND`}
              </span>
            </div>
          )}
        </div>

        {/* Health Status */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-pink-200">
          {isVaccinated && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              <span>Đã tiêm phòng</span>
            </div>
          )}
          {!isNeutered && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <CheckCircle2 className="h-3 w-3" />
              <span>Chưa triệt sản</span>
            </div>
          )}
          {healthCertified && (
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <CheckCircle2 className="h-3 w-3" />
              <span>Có giấy chứng nhận sức khỏe</span>
            </div>
          )}
        </div>

        {/* Looking For */}
        {lookingFor && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Tìm kiếm</div>
            <Badge variant="secondary" className="bg-rose-100 text-rose-700">
              💕 {lookingFor}
            </Badge>
          </div>
        )}

        {/* Requirements */}
        {requirements.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2">Yêu cầu</div>
            <ul className="space-y-1">
              {requirements.map((req, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-1.5">
                  <AlertCircle className="h-3 w-3 text-pink-500 mt-0.5 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

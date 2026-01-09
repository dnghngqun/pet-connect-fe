'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import type { PetProfile } from '@/lib/types';

interface PetInfoCardProps {
  pet: PetProfile;
}

export default function PetInfoCard({ pet }: PetInfoCardProps) {
  return (
    <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Thông tin chi tiết về thú cưng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side - Pet Details */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Tên</p>
              <p className="text-xl font-bold">{pet.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Tuổi</p>
                <p className="font-semibold">
                  {Math.floor(pet.age / 12)} năm {pet.age % 12} tháng
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Giới tính</p>
                <p className="font-semibold">
                  {pet.gender === 'male' ? '🐾 Đực' : '🐾 Cái'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Cân nặng</p>
                <p className="font-semibold">{pet.weight} kg</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Kích thước</p>
                <p className="font-semibold">
                  {pet.size === 'small' ? 'Nhỏ' : pet.size === 'medium' ? 'Vừa' : 'Lớn'}
                </p>
              </div>
            </div>

            {pet.breed && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Giống loài</p>
                <p className="font-semibold">{pet.breed}</p>
              </div>
            )}

            {pet.color && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Màu sắc</p>
                <p className="font-semibold">{pet.color}</p>
              </div>
            )}

            {pet.personality && pet.personality.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Tính cách</p>
                <div className="flex flex-wrap gap-2">
                  {pet.personality.map((trait) => (
                    <Badge key={trait} variant="secondary" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Photos & Special Needs */}
          <div className="space-y-4">
            {pet.photos && pet.photos.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Ảnh</p>
                <div className="grid grid-cols-2 gap-2">
                  {pet.photos.slice(0, 4).map((photo, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden h-24 bg-muted">
                      <Image
                        src={photo}
                        alt={`${pet.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pet.specialNeeds && pet.specialNeeds !== 'Không có' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-yellow-800">Nhu cầu đặc biệt</p>
                    <p className="text-xs text-yellow-700 mt-1">{pet.specialNeeds}</p>
                  </div>
                </div>
              </div>
            )}

            {pet.bio && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-800 mb-1">Tiểu sử</p>
                <p className="text-xs text-blue-700 leading-relaxed italic">"{pet.bio}"</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


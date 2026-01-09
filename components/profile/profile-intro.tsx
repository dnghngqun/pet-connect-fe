'use client';

import { Briefcase, GraduationCap, Home, MapPin, Heart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ProfileIntroProps {
  bio?: string;
  address?: string; // We might need to map this
  joinedDate?: string;
  isOwnProfile?: boolean;
}

export default function ProfileIntro({ bio, address, joinedDate, isOwnProfile }: ProfileIntroProps) {
  return (
    <Card className="p-4 space-y-4">
      <h2 className="font-bold text-xl">Giới thiệu</h2>
      
      {bio && (
        <div className="text-center">
          <p className="text-sm">{bio}</p>
          {isOwnProfile && (
            <Button variant="ghost" size="sm" className="w-full mt-2 bg-gray-100 hover:bg-gray-200">
              Chỉnh sửa tiểu sử
            </Button>
          )}
        </div>
      )}

      <div className="space-y-3 text-sm">
        {address && (
          <div className="flex items-center gap-3 text-gray-700">
            <Home className="h-5 w-5 text-gray-400" />
            <span>Sống tại <strong>{address}</strong></span>
          </div>
        )}

        {joinedDate && (
          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="h-5 w-5 text-gray-400" />
            <span>Tham gia vào {format(new Date(joinedDate), 'MMMM yyyy', { locale: vi })}</span>
          </div>
        )}
      </div>

      {/* TODO: Mutual Groups - will be implemented when groups feature is available */}
      {/* Currently hidden since there's no real data */}

      {isOwnProfile && (
        <Button variant="secondary" className="w-full bg-gray-200 hover:bg-gray-300 text-black mt-4">
          Chỉnh sửa chi tiết
        </Button>
      )}
    </Card>
  );
}

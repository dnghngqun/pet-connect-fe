'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface UserPhoto {
  id: number;
  url: string;
}

interface ProfilePhotosProps {
  photos: UserPhoto[];
  seeAllLink?: string;
}

export default function ProfilePhotos({ photos, seeAllLink = '#' }: ProfilePhotosProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-xl">Ảnh</h2>
        <Link href={seeAllLink} className="text-primary hover:bg-primary/10 px-2 py-1 rounded text-sm transition">
          Xem tất cả
        </Link>
      </div>
      
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
          {photos.slice(0, 9).map((photo, index) => (
            <div key={photo.id || index} className="aspect-square relative cursor-pointer hover:opacity-90 transition">
              <img 
                src={photo.url} 
                alt="Photo" 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-4">Chưa có ảnh nào</p>
      )}
    </Card>
  );
}

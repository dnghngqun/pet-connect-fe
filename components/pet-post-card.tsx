'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Eye, MessageCircle } from 'lucide-react';
import type { PetPost } from '@/lib/types';

interface PetPostCardProps {
  post: PetPost;
}

export default function PetPostCard({ post }: PetPostCardProps) {
  const statusConfig = {
    lost: { label: 'Thất lạc', color: 'bg-red-500' },
    found: { label: 'Tìm thấy', color: 'bg-blue-500' },
    'for-adoption': { label: 'Cần nhà', color: 'bg-green-500' },
    rescue: { label: 'Cứu hộ', color: 'bg-orange-500' },
  };

  const config = statusConfig[post.status];

  return (
    <Link href={`/pet/${post.slug}`}>
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:translate-y-[-4px] cursor-pointer h-full">
        {/* Image Section */}
        <div className="relative">
          <Image
            src={post.image || '/placeholder.svg'}
            alt={post.title}
            width={300}
            height={250}
            className="w-full h-60 object-cover"
          />
          <Badge className={`${config.color} absolute top-2 left-2`}>
            {config.label}
          </Badge>
          {post.views && (
            <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.views}
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-bold text-lg line-clamp-2 mb-2">{post.title}</h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.description}</p>

          {/* Location & Pet Type */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{post.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{post.petType}</Badge>
            </div>
          </div>

          {/* Posted By */}
          <div className="border-t pt-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              {post.postedBy.avatar && (
                <Image
                  src={post.postedBy.avatar}
                  alt={post.postedBy.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{post.postedBy.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `tel:${post.postedBy.phone}`;
              }}
            >
              <Phone className="h-4 w-4 mr-1" />
              Gọi
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement chat functionality
              }}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


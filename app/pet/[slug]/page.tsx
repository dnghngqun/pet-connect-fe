'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Eye, MessageCircle, ArrowLeft, Share2, Flag } from 'lucide-react';
import { petPosts } from '@/lib/pet-posts';

interface PetDetailPageProps {
  params: {
    slug: string;
  };
}

export default function PetDetailPage({ params }: PetDetailPageProps) {
  const post = petPosts.find(p => p.slug === params.slug);

  if (!post) {
    return (
      <div className="container px-4 py-12 text-center">
        <p className="text-lg font-semibold mb-4">Bài đăng không tìm thấy</p>
        <Button asChild>
          <Link href="/shop">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  const statusConfig = {
    lost: { label: 'Thất lạc', color: 'bg-red-500' },
    found: { label: 'Tìm thấy', color: 'bg-blue-500' },
    'for-adoption': { label: 'Cần nhà', color: 'bg-green-500' },
    rescue: { label: 'Cứu hộ', color: 'bg-orange-500' },
  };

  const config = statusConfig[post.status];

  return (
    <div className="container px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/shop">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="relative rounded-lg overflow-hidden h-96">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge className={`${config.color} text-white text-base px-3 py-1`}>
                {config.label}
              </Badge>
            </div>
          </div>

          {/* Title and Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{post.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="outline">{post.petType}</Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{post.views} lượt xem</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Location */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold">Địa điểm</p>
                  <p className="text-muted-foreground">{post.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Mô tả chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed whitespace-pre-wrap">{post.description}</p>
            </CardContent>
          </Card>

          {/* Tags */}
          {post.tags.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Poster Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Người đăng bài</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                {post.postedBy.avatar && (
                  <Image
                    src={post.postedBy.avatar}
                    alt={post.postedBy.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{post.postedBy.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Đăng {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-2 pt-4 border-t">
                <Button
                  className="w-full"
                  onClick={() => window.location.href = `tel:${post.postedBy.phone}`}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Gọi: {post.postedBy.phone}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // TODO: Implement chat
                    alert('Chức năng chat sẽ được triển khai');
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Gửi tin nhắn
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Chia sẻ
            </Button>
            <Button variant="outline" className="w-full text-red-600">
              <Flag className="h-4 w-4 mr-2" />
              Báo cáo
            </Button>
          </div>

          {/* Related Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin thêm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="font-semibold">Trạng thái</p>
                <Badge className={`${config.color} mt-1`}>{config.label}</Badge>
              </div>
              <div className="pt-2">
                <p className="font-semibold">Loại thú cưng</p>
                <p className="text-muted-foreground">{post.petType}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


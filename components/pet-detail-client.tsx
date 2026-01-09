'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, MessageCircle, ArrowLeft, Share2, Flag, Heart } from 'lucide-react';
import PetHealthProfileDialog from '@/components/pet-health-profile-dialog';
import PetInfoCard from '@/components/pet-info-card';
import PetQRCode from '@/components/pet-qr-code';
import { PetPost } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface PetDetailClientProps {
  post: PetPost;
  statusConfig: {
    [key: string]: { label: string; color: string };
  };
}

export default function PetDetailClient({ post, statusConfig }: PetDetailClientProps) {
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

          {/* Pet Info Card */}
          {post.pet && <PetInfoCard pet={post.pet} />}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pet Info Card - New */}
          {post.pet && (
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-red-500" />
                  Thông tin thú cưng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pet Image */}
                {post.pet.photos && post.pet.photos.length > 0 && (
                  <div className="relative rounded-lg overflow-hidden h-40 bg-muted">
                    <Image
                      src={post.pet.photos[0]}
                      alt={post.pet.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Pet Basic Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Tên</p>
                    <p className="text-lg font-bold">{post.pet.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Tuổi</p>
                      <p className="font-semibold">
                        {Math.floor(post.pet.age / 12)} năm {post.pet.age % 12} tháng
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Giới tính</p>
                      <p className="font-semibold">
                        {post.pet.gender === 'male' ? '🐾 Đực' : '🐾 Cái'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Cân nặng</p>
                      <p className="font-semibold">{post.pet.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Loài</p>
                      <p className="font-semibold text-sm">{post.pet.breed || post.pet.type}</p>
                    </div>
                  </div>

                  {post.pet.personality && post.pet.personality.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Tính cách</p>
                      <div className="flex flex-wrap gap-1">
                        {post.pet.personality.slice(0, 3).map((trait) => (
                          <Badge key={trait} variant="secondary" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                        {post.pet.personality.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.pet.personality.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {post.pet.color && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Màu sắc</p>
                      <p className="font-semibold text-sm">{post.pet.color}</p>
                    </div>
                  )}

                  {post.pet.bio && (
                    <div className="bg-white/50 rounded-lg p-3">
                      <p className="text-xs leading-relaxed text-muted-foreground italic">
                        "{post.pet.bio}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Health Status Quick View */}
                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Trạng thái sức khỏe</p>
                  <div className="flex items-center gap-2 text-xs p-2 bg-green-100/50 rounded">
                    <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                    <span className="font-semibold">Tiêm chủng cập nhật</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs p-2 bg-blue-100/50 rounded">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    <span className="font-semibold">
                      Kiểm tra: {new Date(post.pet.healthRecord.lastCheckup).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* View Health Profile Button */}
                <PetHealthProfileDialog pet={post.pet} />
              </CardContent>
            </Card>
          )}

          {/* Pet QR Code */}
          {post.pet && (
            <PetQRCode
              petId={post.pet.id}
              petName={post.pet.name}
              qrCodeUrl={post.pet.qrCodeUrl}
            />
          )}

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
                    toast({
                      title: "Chức năng đang phát triển",
                      description: "Tính năng chat sẽ sớm được triển khai. Vui lòng quay lại sau!",
                    });
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


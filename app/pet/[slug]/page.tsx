import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, MapPin, Heart, QrCode } from 'lucide-react';
import { petPosts } from '@/lib/pet-posts';
import PetHealthProfileDialog from '@/components/pet-health-profile-dialog';
import PetContactButtons from '@/components/pet-contact-buttons';
import PetQRImage from '@/components/pet-qr-image';

interface PetDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return petPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PetDetailPage({ params }: PetDetailPageProps) {
  const { slug } = await params;
  const post = petPosts.find(p => p.slug === slug);

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

                {/* QR Code Section */}
                {post.pet.qrCodeUrl && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <QrCode className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold">Mã QR thú cưng</p>
                    </div>
                    <div className="flex justify-center p-4 bg-muted/30 rounded-lg">
                      <PetQRImage
                        src={post.pet.qrCodeUrl}
                        alt={`QR Code for ${post.pet.name}`}
                        width={160}
                        height={160}
                        className="border border-border rounded"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Quét mã QR để xem thông tin chi tiết về {post.pet.name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
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
              <PetContactButtons postedBy={post.postedBy} />
            </CardContent>
          </Card>

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


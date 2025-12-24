'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, MapPin, Heart, Loader2 } from 'lucide-react';
import PetHealthProfileDialog from '@/components/pet-health-profile-dialog';
import PetContactButtons from '@/components/pet-contact-buttons';
import petPostService from '@/services/petPostService';
import { use } from 'react';

interface PetDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface PostData {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  petType: string;
  status: string;
  location: string;
  views?: number;
  createdAt: string;
  tags: string[];
  postedBy: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  pet?: {
    id: string;
    name: string;
    type: string;
    breed?: string;
    age: number;
    gender: 'male' | 'female';
    color?: string;
    size?: 'small' | 'medium' | 'large';
    weight?: number;
    personality: string[];
    specialNeeds?: string;
    bio?: string;
    photos: string[];
    healthRecord: {
      id: string;
      vaccinations: { name: string; date: string; nextDue?: string }[];
      medicalHistory: { date: string; condition: string; treatment: string; notes?: string }[];
      weight: { date: string; value: number }[];
      lastCheckup: string;
      allergies: string[];
      notes?: string;
    };
    qrCodeUrl?: string;
  };
}

export default function PetDetailPage({ params }: PetDetailPageProps) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [resolvedParams.slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await petPostService.getPostBySlug(resolvedParams.slug);
      const data = response.data;
      
      if (data) {
        // Transform API response to expected format
        const transformedPost: PostData = {
          id: String(data.id),
          title: data.title,
          slug: data.slug,
          description: data.description,
          image: data.image || data.media?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
          petType: data.petType,
          status: data.status?.toLowerCase().replace('_', '-') || 'lost',
          location: data.location || `${data.district || ''}, ${data.city || ''}`,
          views: data.views,
          createdAt: data.createdAt,
          tags: data.tags || [],
          postedBy: {
            id: String(data.postedBy?.id || ''),
            name: data.postedBy?.name || 'Người dùng',
            phone: data.postedBy?.phone || '',
            avatar: data.postedBy?.avatar ?? undefined,
          },
          pet: data.pet ? {
            id: String(data.pet.id),
            name: data.pet.name,
            type: data.pet.type || data.petType,
            breed: data.pet.breed ?? undefined,
            age: data.pet.age || 0,
            gender: data.pet.gender?.toLowerCase() === 'male' ? 'male' : 'female',
            color: data.pet.color ?? undefined,
            size: (data.pet.size?.toLowerCase() as 'small' | 'medium' | 'large') ?? undefined,
            weight: data.pet.weight ?? undefined,
            personality: data.pet.personality || [],
            specialNeeds: data.pet.specialNeeds ?? undefined,
            bio: data.pet.bio ?? undefined,
            photos: data.pet.photos || [data.image],
            healthRecord: data.pet.healthRecord ? {
              id: String(data.pet.healthRecord.id),
              vaccinations: data.pet.healthRecord.vaccinations || [],
              medicalHistory: data.pet.healthRecord.medicalHistory || [],
              weight: data.pet.healthRecord.weightHistory || [],
              lastCheckup: data.pet.healthRecord.lastCheckup || new Date().toISOString(),
              allergies: data.pet.healthRecord.allergies || [],
              notes: data.pet.healthRecord.notes ?? undefined,
            } : {
              id: `hr-${data.pet.id}`,
              vaccinations: [],
              medicalHistory: [],
              weight: [],
              lastCheckup: new Date().toISOString(),
              allergies: [],
            },
            qrCodeUrl: data.pet.qrCodeUrl ?? undefined,
          } : undefined,
        };
        setPost(transformedPost);
        
        // Increase view count
        if (data.id) {
          petPostService.increaseViews(data.id).catch(() => {});
        }
      }
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

  const statusConfig: Record<string, { label: string; color: string }> = {
    lost: { label: 'Thất lạc', color: 'bg-red-500' },
    found: { label: 'Tìm thấy', color: 'bg-blue-500' },
    'for-adoption': { label: 'Cần nhà', color: 'bg-green-500' },
    rescue: { label: 'Cứu hộ', color: 'bg-orange-500' },
  };

  const config = statusConfig[post.status] || { label: post.status, color: 'bg-gray-500' };

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
                  <span>{post.views || 0} lượt xem</span>
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
          {/* Pet Info Card */}
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
                    {post.pet.weight && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Cân nặng</p>
                        <p className="font-semibold">{post.pet.weight} kg</p>
                      </div>
                    )}
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

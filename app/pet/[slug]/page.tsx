'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Eye,
  MapPin,
  Heart,
  Loader2,
  Share2,
  Phone,
  MessageCircle,
  Calendar,
  PawPrint,
  Syringe,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  Info,
  QrCode,
  Edit,
} from 'lucide-react';
import PetHealthProfileDialog from '@/components/pet-health-profile-dialog';
import PetInfoCard from '@/components/pet-info-card';
import UpdatePostStatusDialog from '@/components/update-post-status-dialog';
import DeletePostDialog from '@/components/delete-post-dialog';
import petPostService from '@/services/petPostService';
import authService from '@/services/authService';
import type { PetProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';

function ChatButton({ postedBy }: { postedBy: { id?: string; _id?: string; name?: string; phone?: string } }) {
  const router = useRouter();

  const handleChat = () => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('pet-connect-user') : null;
    if (!user) {
      router.push('/sign-in');
      return;
    }

    const participantId = postedBy?.id || postedBy?._id;
    if (!participantId) {
      router.push('/chat');
      return;
    }

    router.push(`/chat?participantId=${encodeURIComponent(participantId)}`);
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleChat}>
      <MessageCircle className="h-4 w-4 mr-2" />
      Gửi tin nhắn
    </Button>
  );
}

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
  images: string[];
  petType: string;
  status: string;
  location: string;
  city?: string;
  district?: string;
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
    isVaccinated?: boolean;
    isNeutered?: boolean;
    photos: string[];
    healthRecord?: {
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    loadPost();
  }, [resolvedParams.slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await petPostService.getPostBySlug(resolvedParams.slug);
      const data = response.data;

      if (data) {
        // Check if current user is the owner
        const currentUser = authService.getCurrentUser();
        if (currentUser && data.postedBy?.id) {
          setIsOwner(String(currentUser.id) === String(data.postedBy.id));
        }

        const images = data.media?.map((m: any) => m.imageUrl) || [];
        if (data.image && !images.includes(data.image)) {
          images.unshift(data.image);
        }
        if (images.length === 0) {
          images.push('https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800');
        }

        const transformedPost: PostData = {
          id: String(data.id),
          title: data.title,
          slug: data.slug,
          description: data.description,
          images,
          petType: data.petType,
          status: data.status?.toLowerCase().replace('_', '-') || 'lost',
          location: data.location || `${data.district || ''}, ${data.city || ''}`,
          city: data.city,
          district: data.district,
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
            photos: data.pet.photos || [],
            healthRecord: data.pet.healthRecord ? {
              id: String(data.pet.healthRecord.id),
              vaccinations: data.pet.healthRecord.vaccinations || [],
              medicalHistory: data.pet.healthRecord.medicalHistory || [],
              weight: data.pet.healthRecord.weightHistory || [],
              lastCheckup: data.pet.healthRecord.lastCheckup || new Date().toISOString(),
              allergies: data.pet.healthRecord.allergies || [],
              notes: data.pet.healthRecord.notes ?? undefined,
            } : undefined,
            qrCodeUrl: data.pet.qrCodeUrl ?? undefined,
          } : undefined,
        };
        setPost(transformedPost);

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

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: post?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Đang tải bài đăng...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <PawPrint className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Bài đăng không tìm thấy</h2>
          <p className="text-muted-foreground mb-6">
            Bài đăng này có thể đã bị xóa hoặc không tồn tại.
          </p>
          <Button asChild size="lg">
            <Link href="/shop">Xem danh sách thú cưng</Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    lost: { label: 'Thất lạc', color: 'text-white', bgColor: 'bg-red-500' },
    found: { label: 'Tìm thấy', color: 'text-white', bgColor: 'bg-blue-500' },
    'for-adoption': { label: 'Cần nhà', color: 'text-white', bgColor: 'bg-green-500' },
    rescue: { label: 'Cứu hộ', color: 'text-white', bgColor: 'bg-orange-500' },
  };

  const config = statusConfig[post.status] || { label: post.status, color: 'text-white', bgColor: 'bg-gray-500' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">

            {/* Left Column - Images & Info */}
            <div className="lg:col-span-3 space-y-6">

              {/* Image Gallery */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
                <Image
                  src={post.images[currentImageIndex]}
                  alt={post.title}
                  fill
                  className="object-contain"
                  priority
                />

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className={`${config.bgColor} ${config.color} text-sm px-4 py-1.5 font-semibold shadow-lg`}>
                    {config.label}
                  </Badge>
                </div>

                {/* Navigation Arrows */}
                {post.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(i => i === 0 ? post.images.length - 1 : i - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(i => i === post.images.length - 1 ? 0 : i + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {post.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`w-2 h-2 rounded-full transition ${
                            i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {post.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {post.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                        i === currentImageIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title & Quick Info */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-3">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{post.location}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>{post.views || 0} lượt xem</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              {/* Tabs for Description & Details */}
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="description">Mô tả</TabsTrigger>
                  <TabsTrigger value="details">Chi tiết</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {post.description}
                      </p>

                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Loại thú cưng</p>
                          <p className="font-medium">{post.petType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Trạng thái</p>
                          <Badge className={`${config.bgColor} mt-1`}>{config.label}</Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Thành phố</p>
                          <p className="font-medium">{post.city || 'Chưa xác định'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Quận/Huyện</p>
                          <p className="font-medium">{post.district || 'Chưa xác định'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Pet Info & Contact */}
            <div className="lg:col-span-2 space-y-6">

              {/* Pet Info Card */}
              {post.pet && (
                <Card className="overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                      Thông tin thú cưng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Pet Avatar & Name */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={post.images[0]} />
                        <AvatarFallback>
                          <PawPrint className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold">{post.pet.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {post.pet.type} {post.pet.breed && `• ${post.pet.breed}`}
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      {post.pet.age !== undefined && (
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground">Tuổi</p>
                          <p className="font-bold">
                            {Math.floor(post.pet.age / 12)}n {post.pet.age % 12}th
                          </p>
                        </div>
                      )}
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground">Giới tính</p>
                        <p className="font-bold">
                          {post.pet.gender === 'male' ? '♂ Đực' : '♀ Cái'}
                        </p>
                      </div>
                      {post.pet.weight && (
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground">Cân nặng</p>
                          <p className="font-bold">{post.pet.weight} kg</p>
                        </div>
                      )}
                    </div>

                    {/* Health Badges */}
                    <div className="flex flex-wrap gap-2">
                      {post.pet.healthRecord?.vaccinations && post.pet.healthRecord.vaccinations.length > 0 && (
                        <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                          <Syringe className="h-3 w-3 mr-1" />
                          Đã tiêm phòng ({post.pet.healthRecord.vaccinations.length})
                        </Badge>
                      )}
                      {post.pet.healthRecord?.lastCheckup && (
                        <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                          <Shield className="h-3 w-3 mr-1" />
                          Kiểm tra: {new Date(post.pet.healthRecord.lastCheckup).toLocaleDateString('vi-VN')}
                        </Badge>
                      )}
                    </div>

                    {/* Personality */}
                    {post.pet.personality && post.pet.personality.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Tính cách</p>
                        <div className="flex flex-wrap gap-1.5">
                          {post.pet.personality.map((trait) => (
                            <Badge key={trait} variant="secondary" className="text-xs">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    {post.pet.bio && (
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-sm italic text-muted-foreground">
                          "{post.pet.bio}"
                        </p>
                      </div>
                    )}

                    {/* Health Profile Button */}
                    {post.pet.healthRecord ? (
                      <PetHealthProfileDialog pet={{
                        ...post.pet,
                        healthRecord: post.pet.healthRecord
                      } as PetProfile} />
                    ) : (
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <Info className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Chưa có hồ sơ y tế
                        </p>
                        {isOwner && post.pet.id && (
                          <Button variant="link" size="sm" asChild className="mt-2">
                            <Link href={`/pets/${post.pet.id}/health`}>Tạo hồ sơ ngay</Link>
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Owner can manage health */}
                    {isOwner && post.pet.id && (
                      <Button variant="outline" asChild className="w-full">
                        <Link href={`/pets/${post.pet.id}/health`}>
                          <QrCode className="h-4 w-4 mr-2" />
                          Quản lý hồ sơ sức khỏe
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Contact Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Người đăng bài</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.postedBy.avatar} />
                      <AvatarFallback>{post.postedBy.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
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
                <ChatButton postedBy={post.postedBy} />
              </div>
                    {/*<div className="grid gap-2">*/}
                    {/*    {post.postedBy.phone && (*/}
                    {/*        <Button className="w-full" asChild>*/}
                    {/*            <a href={`tel:${post.postedBy.phone}`}>*/}
                    {/*                <Phone className="h-4 w-4 mr-2" />*/}
                    {/*                Gọi điện: {post.postedBy.phone}*/}
                    {/*            </a>*/}
                    {/*        </Button>*/}
                    {/*    )}*/}
                    {/*    <Button variant="outline" className="w-full">*/}
                    {/*        <MessageCircle className="h-4 w-4 mr-2" />*/}
                    {/*        Nhắn tin*/}
                    {/*    </Button>*/}
                    {/*</div>*/}
            </CardContent>
          </Card>

              {/* Owner Actions */}
              {isOwner && (
                <Card className="border-2 border-orange-200 bg-orange-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Quản lý bài đăng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <UpdatePostStatusDialog
                      postId={Number(post.id)}
                      currentStatus={post.status}
                      onStatusUpdated={(newStatus) => {
                        setPost(prev => prev ? { ...prev, status: newStatus.toLowerCase().replace('_', '-') } : null);
                      }}
                    />
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/post/edit/${post.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa bài đăng
                      </Link>
                    </Button>
                    {post.pet && (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/pets/${post.pet.id}/health`}>
                          <Syringe className="h-4 w-4 mr-2" />
                          Cập nhật hồ sơ y tế
                        </Link>
                      </Button>
                    )}
                    <DeletePostDialog
                      postId={Number(post.id)}
                      postTitle={post.title}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Chia sẻ
                </Button>
                <Button variant="outline" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Quan tâm
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

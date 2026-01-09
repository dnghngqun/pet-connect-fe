'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  PawPrint,
  Heart,
  Syringe,
  Stethoscope,
  Scale,
  Calendar,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  Shield,
} from 'lucide-react';

interface PageParams {
  id: string;
}

interface PetPublicData {
  pet: {
    id: number;
    name: string;
    type: string;
    breed: string | null;
    age: number | null;
    gender: string | null;
    color: string | null;
    size: string | null;
    weight: number | null;
    profilePhoto: string | null;
    personality: string[];
    bio: string | null;
    isNeutered: boolean;
    isVaccinated: boolean;
  };
  owner: {
    name: string;
    phone: string | null;
    avatarUrl: string | null;
  } | null;
  healthRecord: {
    id: number;
    lastCheckup: string | null;
    allergies: string[];
    notes: string | null;
    vaccinations: {
      name: string;
      date: string;
      nextDue: string | null;
    }[];
  } | null;
}

export default function PetPublicPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params);
  const petId = parseInt(resolvedParams.id);

  const [isLoading, setIsLoading] = useState(true);
  const [petData, setPetData] = useState<PetPublicData | null>(null);
  const [showVaccinations, setShowVaccinations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPetData();
  }, [petId]);

  const loadPetData = async () => {
    try {
      setIsLoading(true);
      const mockData: PetPublicData = {
        pet: {
          id: petId,
          name: 'Max',
          type: 'Chó',
          breed: 'Siberian Husky',
          age: 36,
          gender: 'MALE',
          color: 'Trắng xám',
          size: 'LARGE',
          weight: 28.5,
          profilePhoto: 'https:
          personality: ['Hiếu kỳ', 'Năng động', 'Thân thiện'],
          bio: 'Max là một chú Husky 3 tuổi rất thân thiện và năng động.',
          isNeutered: true,
          isVaccinated: true,
        },
        owner: {
          name: 'Nguyễn Văn A',
          phone: '0912345678',
          avatarUrl: null,
        },
        healthRecord: {
          id: 1,
          lastCheckup: '2024-12-01T00:00:00Z',
          allergies: ['Thức ăn có ngũ cốc'],
          notes: 'Sức khỏe tốt',
          vaccinations: [
            { name: 'Rabies (Dại)', date: '2024-06-15', nextDue: '2025-06-15' },
            { name: 'Parvovirus', date: '2024-03-10', nextDue: '2025-03-10' },
          ],
        },
      };
      

      await new Promise(resolve => setTimeout(resolve, 500));
      setPetData(mockData);
    } catch (err) {
      setError('Không thể tải thông tin thú cưng');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !petData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy thú cưng</h3>
            <p className="text-muted-foreground mb-4">
              {error || 'Thú cưng này không tồn tại hoặc đã bị xóa.'}
            </p>
            <Button asChild>
              <Link href="/">Về trang chủ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { pet, owner, healthRecord } = petData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      
      <div className="bg-primary/10 py-4 px-4 text-center border-b">
        <div className="flex items-center justify-center gap-2">
          <PawPrint className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Pets Connect</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Hồ sơ thú cưng được xác minh</p>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        
        <Card className="overflow-hidden">
          
          <div className="relative h-48 sm:h-64 bg-gradient-to-br from-primary/20 to-secondary/20">
            {pet.profilePhoto ? (
              <Image
                src={pet.profilePhoto}
                alt={pet.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <PawPrint className="h-20 w-20 text-primary/30" />
              </div>
            )}
            
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              {pet.isVaccinated && (
                <Badge className="bg-green-500 text-white text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Đã tiêm phòng
                </Badge>
              )}
              {pet.isNeutered && (
                <Badge variant="secondary" className="text-xs">
                  Đã triệt sản
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="p-4 sm:p-6">
            
            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold">{pet.name}</h1>
              <p className="text-muted-foreground">
                {pet.type} {pet.breed && `• ${pet.breed}`}
              </p>
            </div>

            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {pet.age && (
                <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
                  <p className="text-xs text-muted-foreground">Tuổi</p>
                  <p className="font-semibold text-sm sm:text-base">
                    {Math.floor(pet.age / 12)} năm {pet.age % 12 > 0 && `${pet.age % 12}th`}
                  </p>
                </div>
              )}
              {pet.gender && (
                <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
                  <p className="text-xs text-muted-foreground">Giới tính</p>
                  <p className="font-semibold text-sm sm:text-base">
                    {pet.gender === 'MALE' ? '♂ Đực' : '♀ Cái'}
                  </p>
                </div>
              )}
              {pet.weight && (
                <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
                  <p className="text-xs text-muted-foreground">Cân nặng</p>
                  <p className="font-semibold text-sm sm:text-base">{pet.weight} kg</p>
                </div>
              )}
            </div>

            
            {pet.personality && pet.personality.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">TÍNH CÁCH</p>
                <div className="flex flex-wrap gap-1">
                  {pet.personality.map((trait, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            
            {pet.bio && (
              <div className="bg-primary/5 rounded-lg p-3 mb-4">
                <p className="text-sm italic text-muted-foreground">"{pet.bio}"</p>
              </div>
            )}

            
            <div className="grid grid-cols-2 gap-2 text-sm">
              {pet.color && (
                <div>
                  <span className="text-muted-foreground">Màu sắc: </span>
                  <span className="font-medium">{pet.color}</span>
                </div>
              )}
              {pet.size && (
                <div>
                  <span className="text-muted-foreground">Kích cỡ: </span>
                  <span className="font-medium">
                    {pet.size === 'SMALL' ? 'Nhỏ' : pet.size === 'MEDIUM' ? 'Trung bình' : 'Lớn'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-red-500" />
              Hồ sơ sức khỏe
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthRecord ? (
              <div className="space-y-3">
                
                {healthRecord.lastCheckup && (
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <Stethoscope className="h-4 w-4 text-blue-600" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Khám gần nhất: </span>
                      <span className="font-medium">{formatDate(healthRecord.lastCheckup)}</span>
                    </div>
                  </div>
                )}

                
                {healthRecord.allergies && healthRecord.allergies.length > 0 && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700 text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Dị ứng: </span>
                        {healthRecord.allergies.join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                
                {healthRecord.vaccinations && healthRecord.vaccinations.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowVaccinations(!showVaccinations)}
                      className="w-full flex items-center justify-between p-2 bg-green-50 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2 text-green-700">
                        <Syringe className="h-4 w-4" />
                        <span className="font-medium">
                          {healthRecord.vaccinations.length} mũi tiêm đã ghi nhận
                        </span>
                      </div>
                      {showVaccinations ? (
                        <ChevronUp className="h-4 w-4 text-green-700" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-green-700" />
                      )}
                    </button>
                    
                    {showVaccinations && (
                      <div className="mt-2 space-y-2 pl-2">
                        {healthRecord.vaccinations.map((vac, i) => (
                          <div key={i} className="text-sm p-2 border-l-2 border-green-300 pl-3">
                            <p className="font-medium">{vac.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Tiêm: {formatDate(vac.date)}
                              {vac.nextDue && ` • Tiếp theo: ${formatDate(vac.nextDue)}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                
                {healthRecord.notes && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Ghi chú: </span>
                    {healthRecord.notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Chưa có hồ sơ sức khỏe</p>
              </div>
            )}
          </CardContent>
        </Card>

        
        {owner && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={owner.avatarUrl || undefined} />
                  <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{owner.name}</p>
                  <p className="text-sm text-muted-foreground">Chủ sở hữu</p>
                </div>
              </div>
              {owner.phone && (
                <Button className="w-full mt-3" asChild>
                  <a href={`tel:${owner.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Gọi điện: {owner.phone}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        
        <div className="text-center py-4 text-xs text-muted-foreground">
          <p>Hồ sơ được tạo bởi Pets Connect</p>
          <p className="mt-1">
            <Link href="/" className="text-primary hover:underline">
              Tìm hiểu thêm về ứng dụng
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

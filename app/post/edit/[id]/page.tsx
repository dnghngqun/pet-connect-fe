'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import petPostService from '@/services/petPostService';
import locationService from '@/services/locationService';
import authService from '@/services/authService';

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

const POST_STATUS = [
  { value: 'LOST', label: 'Thất lạc' },
  { value: 'FOUND', label: 'Tìm thấy' },
  { value: 'FOR_ADOPTION', label: 'Cần tìm nhà mới' },
  { value: 'RESCUE', label: 'Cần cứu hộ' },
];

export default function EditPostPage({ params }: EditPostPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    city: '',
    district: '',
    location: '',
    tags: [] as string[],
  });
  
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  
  useEffect(() => {
    loadPost();
    loadCities();
  }, [resolvedParams.id]);
  
  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await petPostService.getPostBySlug(resolvedParams.id);
      const data = response.data;
      
      if (data) {
        // Check ownership
        const currentUser = authService.getCurrentUser();
        const ownerMatch = currentUser && String(currentUser.id) === String(data.postedBy?.id);
        setIsOwner(!!ownerMatch);
        
        if (!ownerMatch) {
          toast({
            title: 'Không có quyền',
            description: 'Bạn không có quyền chỉnh sửa bài đăng này',
            variant: 'destructive',
          });
          router.push('/shop');
          return;
        }
        
        setFormData({
          title: data.title || '',
          description: data.description || '',
          status: data.status || '',
          city: data.city || '',
          district: data.district || '',
          location: data.location || '',
          tags: data.tags || [],
        });
        
        // Load districts for the city
        if (data.city) {
          const districtRes = await locationService.getDistricts(data.city);
          setDistricts(districtRes.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load post:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải bài đăng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadCities = async () => {
    try {
      const res = await locationService.getCities();
      setCities(res.data || []);
    } catch {
      setCities(['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng']);
    }
  };
  
  const handleCityChange = async (city: string) => {
    setFormData(prev => ({ ...prev, city, district: '' }));
    try {
      const res = await locationService.getDistricts(city);
      setDistricts(res.data || []);
    } catch {
      setDistricts([]);
    }
  };
  
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tiêu đề bài đăng',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSaving(true);
      await petPostService.updatePost(Number(resolvedParams.id), {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        city: formData.city,
        district: formData.district,
        location: formData.location,
        tags: formData.tags,
      });
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật bài đăng',
      });
      
      router.push(`/pet/${resolvedParams.id}`);
    } catch (error) {
      console.error('Failed to update post:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật bài đăng. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isOwner) {
    return null;
  }
  
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/pet/${resolvedParams.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa bài đăng</h1>
          <p className="text-muted-foreground">Cập nhật thông tin bài đăng của bạn</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Thông tin bài đăng</CardTitle>
          <CardDescription>
            Chỉnh sửa tiêu đề, mô tả và vị trí của bài đăng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              placeholder="Nhập tiêu đề bài đăng"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          {/* Status */}
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {POST_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả chi tiết về bài đăng..."
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          
          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Thành phố</Label>
              <Select value={formData.city} onValueChange={handleCityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Quận/Huyện</Label>
              <Select
                value={formData.district}
                onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
                disabled={!formData.city}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quận/huyện" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Detailed Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Địa chỉ chi tiết</Label>
            <Input
              id="location"
              placeholder="Nhập địa chỉ cụ thể"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              asChild
            >
              <Link href={`/pet/${resolvedParams.id}`}>
                Hủy
              </Link>
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

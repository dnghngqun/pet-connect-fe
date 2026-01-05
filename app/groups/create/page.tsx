'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { createGroup } from '@/services/groupService';

export default function CreateGroupPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    city: '',
    district: '',
    isPrivate: false,
    rules: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập tên nhóm',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);
      
      // TODO: Upload avatar file first if exists
      // For now, create without avatar
      const response = await createGroup({
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category as any || undefined,
        city: formData.city || undefined,
        district: formData.district || undefined,
        isPrivate: formData.isPrivate,
        rules: formData.rules || undefined,
      });

      if (response.success) {
        toast({
          title: '🎉 Thành công!',
          description: 'Nhóm đã được tạo thành công',
        });
        router.push(`/groups/${response.data.slug}`);
      } else {
        toast({
          title: 'Lỗi',
          description: response.message || 'Có lỗi xảy ra',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold">Tạo hội nhóm mới</h1>
            <p className="text-muted-foreground mt-2">
              Tạo một cộng đồng cho những người yêu thú cưng
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Thông tin nhóm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên nhóm <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="VD: Golden Retriever Lovers HCM"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả về nhóm của bạn..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BREED">Giống</SelectItem>
                      <SelectItem value="LOCATION">Khu vực</SelectItem>
                      <SelectItem value="INTEREST">Sở thích</SelectItem>
                      <SelectItem value="ACTIVITY">Hoạt động</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Thành phố</Label>
                    <Input
                      id="city"
                      placeholder="VD: TP. Hồ Chí Minh"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">Quận/Huyện</Label>
                    <Input
                      id="district"
                      placeholder="VD: Quận 1"
                      value={formData.district}
                      onChange={(e) =>
                        setFormData({ ...formData, district: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Privacy */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label>Nhóm riêng tư</Label>
                    <p className="text-sm text-muted-foreground">
                      Chỉ thành viên mới có thể xem nội dung
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isPrivate: checked })
                    }
                  />
                </div>

                {/* Rules */}
                <div className="space-y-2">
                  <Label htmlFor="rules">Nội quy nhóm</Label>
                  <Textarea
                    id="rules"
                    placeholder="Các quy định của nhóm..."
                    rows={6}
                    value={formData.rules}
                    onChange={(e) =>
                      setFormData({ ...formData, rules: e.target.value })
                    }
                  />
                </div>

                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label htmlFor="avatar">Ảnh đại diện nhóm (tùy chọn)</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAvatarFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setAvatarPreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="mt-2 w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="flex-1"
                  >
                    {creating ? 'Đang tạo...' : 'Tạo nhóm'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}

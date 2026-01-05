'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import Image from 'next/image';

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File quá lớn',
          description: 'Ảnh không được vượt quá 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-500 text-white mb-4">
            <Users className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            Tạo hội nhóm mới
          </h1>
          <p className="text-muted-foreground mt-2">
            Tạo một cộng đồng cho những người yêu thú cưng
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-orange-500/10 to-primary/10 border-b">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Thông tin nhóm
              </CardTitle>
              <CardDescription>
                Cung cấp thông tin để người khác tìm và tham gia nhóm
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-6">
              {/* Avatar Upload */}
              <div className="space-y-3">
                <Label htmlFor="avatar" className="text-sm font-semibold">
                  Ảnh đại diện nhóm
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center bg-primary/5 overflow-hidden">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview('');
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Label
                      htmlFor="avatar"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition"
                    >
                      <Upload className="h-4 w-4" />
                      Chọn ảnh
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG or GIF (max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên nhóm <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="VD: Golden Retriever Lovers HCM"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="border-primary/20 focus:border-primary"
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
                  className="border-primary/20 focus:border-primary resize-none"
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
                  <SelectTrigger className="border-primary/20">
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
                    className="border-primary/20 focus:border-primary"
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
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Privacy */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Nhóm riêng tư</Label>
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
                  className="border-primary/20 focus:border-primary resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Gợi ý: Quy định về văn minh, không spam, tôn trọng lẫn nhau
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={creating}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={creating || !formData.name.trim()}
                  className="flex-1 bg-gradient-to-r from-primary to-orange-500 hover:opacity-90"
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Tạo nhóm
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

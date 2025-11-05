'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewPostPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    petType: '',
    status: '',
    location: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement post submission
    console.log('Form submitted:', formData);
    alert('Chức năng đăng bài sẽ được triển khai sớm. Cảm ơn sự kiên nhẫn!');
  };

  return (
    <div className="container px-4 py-8 max-w-2xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/shop">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Đăng bài mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ví dụ: Chó Husky mất tích tại Q.1, TP.HCM"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Pet Type */}
            <div>
              <Label htmlFor="petType">Loại thú cưng *</Label>
              <Select value={formData.petType} onValueChange={(value) => handleSelectChange('petType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại thú cưng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chó">Chó</SelectItem>
                  <SelectItem value="Mèo">Mèo</SelectItem>
                  <SelectItem value="Chim">Chim</SelectItem>
                  <SelectItem value="Thỏ">Thỏ</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Trạng thái *</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lost">Thất lạc</SelectItem>
                  <SelectItem value="found">Tìm thấy</SelectItem>
                  <SelectItem value="for-adoption">Cần nhà</SelectItem>
                  <SelectItem value="rescue">Cứu hộ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Địa điểm *</Label>
              <Input
                id="location"
                name="location"
                placeholder="Ví dụ: Quận 1, TP.HCM"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Mô tả chi tiết *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Mô tả về thú cưng, tình trạng hiện tại, và bất kỳ thông tin liên quan khác..."
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Số điện thoại liên hệ *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="0912345678"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* Image Upload - Placeholder */}
            <div>
              <Label>Hình ảnh *</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-2">Chức năng tải ảnh sẽ được triển khai</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">Đăng bài</Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/shop">Hủy</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


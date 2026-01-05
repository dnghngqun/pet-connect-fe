'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from './image-upload';
import { toast } from '@/components/ui/use-toast';
import petPostService from '@/services/petPostService';
import { Loader2 } from 'lucide-react';

interface GeneralPostFormProps {
  postType: string;
  onSuccess: (newPost: any) => void;
}

const PET_TYPES = [
  { value: 'dog', label: '🐕 Chó' },
  { value: 'cat', label: '🐈 Mèo' },
  { value: 'bird', label: '🦜 Chim' },
  { value: 'rabbit', label: '🐰 Thỏ' },
  { value: 'hamster', label: '🐹 Chuột Hamster' },
  { value: 'other', label: '🐾 Khác' },
];

const LOST_FOUND_STATUS = [
  { value: 'LOST', label: '❌ Bị mất' },
  { value: 'FOUND', label: '✅ Tìm thấy' },
];

export default function GeneralPostForm({ postType, onSuccess }: GeneralPostFormProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    petType: '',
    petName: '',
    status: postType === 'LOST_FOUND' ? 'LOST' : 'FOR_ADOPTION',
    location: '',
    city: '',
    district: '',
    contactPhone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.petType) {
      toast({ title: 'Vui lòng điền đầy đủ thông tin', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await petPostService.createPost({
        title: formData.title,
        description: formData.description,
        postType: postType,
        petType: formData.petType,
        status: formData.status,
        city: formData.city,
        district: formData.district,
        location: formData.location || `${formData.district}, ${formData.city}`,
        tags: [postType === 'LOST_FOUND' ? 'thatlac' : 'nhannuoi', formData.petType.toLowerCase()],
        meta: {
          petName: formData.petName,
          contactPhone: formData.contactPhone,
        },
      }, images);

      const message = postType === 'LOST_FOUND' 
        ? '🎉 Đã đăng thông tin thất lạc!'
        : '🎉 Đã đăng thông tin nhận nuôi!';

toast({ title: message });
      onSuccess(response.data);
    } catch (error) {
      console.error('Failed to create post:', error);
      toast({ title: 'Có lỗi xảy ra', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {postType === 'LOST_FOUND' && (
        <div>
          <Label>🔍 Trạng thái</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOST_FOUND_STATUS.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>📝 Tiêu đề *</Label>
        <Input
          placeholder={postType === 'LOST_FOUND' ? 'VD: Chó Husky mất tích tại Q1' : 'VD: Bé Golden 2 tháng cần tìm nhà mới'}
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label>💬 Mô tả chi tiết *</Label>
        <Textarea
          placeholder="Mô tả chi tiết về thú cưng, ngoại hình, đặc điểm nhận dạng..."
          rows={6}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>🐾 Loại thú cưng *</Label>
          <Select value={formData.petType} onValueChange={(value) => setFormData(prev => ({ ...prev, petType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              {PET_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>🏷️ Tên thú cưng</Label>
          <Input
            placeholder="VD: Max"
            value={formData.petName}
            onChange={(e) => setFormData(prev => ({ ...prev, petName: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>🏙️ Thành phố</Label>
          <Input
            placeholder="VD: TP. Hồ Chí Minh"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          />
        </div>

        <div>
          <Label>📍 Quận/Huyện</Label>
          <Input
            placeholder="VD: Quận 1"
            value={formData.district}
            onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label>📌 Địa điểm cụ thể</Label>
        <Input
          placeholder="VD: Công viên Lê Văn Tám, gần chợ Bến Thành"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
        />
      </div>

      <div>
        <Label>📞 Số điện thoại liên hệ</Label>
        <Input
          placeholder="0912345678"
          value={formData.contactPhone}
          onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
        />
      </div>

      <ImageUpload images={images} onImagesChange={setImages} />

      <div className={`border rounded-lg p-4 ${postType === 'LOST_FOUND' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <p className="text-sm">
          💡 <strong>Mẹo:</strong> {postType === 'LOST_FOUND' 
            ? 'Mô tả rõ đặc điểm nhận dạng (màu lông, vòng cổ, dấu hiệu...) để dễ tìm!'
            : 'Cung cấp đầy đủ thông tin về tình trạng sức khỏe, tính cách để tìm được gia đình phù hợp!'
          }
        </p>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang đăng...
          </>
        ) : (
          '🚀 Đăng bài'
        )}
      </Button>
    </form>
  );
}

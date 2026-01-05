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

interface MarketplacePostFormProps {
  onSuccess: (newPost: any) => void;
}

const CONDITIONS = [
  { value

: 'new', label: '🆕 Mới 100%' },
  { value: 'like-new', label: '✨ Như mới (99%)' },
  { value: 'good', label: '👍 Tốt (80-90%)' },
  { value: 'used', label: '📦 Đã qua sử dụng' },
];

const CATEGORIES = [
  { value: 'food', label: '🍖 Thức ăn' },
  { value: 'accessories', label: '🎀 Phụ kiện' },
  { value: 'toys', label: '🎾 Đồ chơi' },
  { value: 'furniture', label: '🏠 Nội thất' },
  { value: 'health', label: '💊 Sức khỏe' },
  { value: 'other', label: '📌 Khác' },
];

export default function MarketplacePostForm({ onSuccess }: MarketplacePostFormProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    condition: 'like-new',
    category: '',
    pickupMethod: 'both',
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      toast({ title: 'Vui lòng điền đầy đủ thông tin', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const price = parseInt(formData.price.replace(/\D/g, ''));
      const originalPrice = formData.originalPrice ? parseInt(formData.originalPrice.replace(/\D/g, '')) : price;

      const response = await petPostService.createPost({
        title: formData.title,
        description: formData.description,
        postType: 'MARKETPLACE',
        petType: 'Chung',
        status: 'GENERAL',
        city: 'TP. Hồ Chí Minh',
        district: '',
        location: formData.location,
        tags: ['chodo', formData.category],
        meta: {
          price,
          originalPrice,
          currency: 'VND',
          condition: formData.condition,
          category: formData.category,
          pickupMethod: formData.pickupMethod,
          location: formData.location,
          inStock: true,
        },
      }, images);

      toast({ title: '🎉 Đã đăng sản phẩm thành công!' });
      onSuccess(response.data);
    } catch (error) {
      console.error('Failed to create post:', error);
      toast({ title: 'Có lỗi xảy ra', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num ? parseInt(num).toLocaleString('vi-VN') : '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>🛒 Tên sản phẩm *</Label>
        <Input
          placeholder="VD: Chuồng mèo 3 tầng"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label>📝 Mô tả sản phẩm *</Label>
        <Textarea
          placeholder="Mô tả chi tiết sản phẩm, tình trạng..."
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>💰 Giá bán (VND) *</Label>
          <Input
            placeholder="1,500,000"
            value={formatPrice(formData.price)}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label>🏷️ Giá gốc (nếu có)</Label>
          <Input
            placeholder="3,000,000"
            value={formatPrice(formData.originalPrice)}
            onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>📦 Tình trạng *</Label>
          <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map(cond => (
                <SelectItem key={cond.value} value={cond.value}>{cond.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>📚 Danh mục *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>🚚 Phương thức giao hàng</Label>
          <Select value={formData.pickupMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, pickupMethod: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pickup">📍 Gặp trực tiếp</SelectItem>
              <SelectItem value="delivery">🚚 Giao hàng</SelectItem>
              <SelectItem value="both">✅ Cả hai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>📍 Địa điểm</Label>
          <Input
            placeholder="Quận, Thành phố"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>
      </div>

      <ImageUpload images={images} onImagesChange={setImages} />

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang đăng...
          </>
        ) : (
          '🚀 Đăng bán'
        )}
      </Button>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ReviewStars from './review-stars';
import ImageUpload from './image-upload';
import { toast } from '@/components/ui/use-toast';
import petPostService from '@/services/petPostService';
import { Loader2, Plus, X } from 'lucide-react';

interface ReviewPostFormProps {
  onSuccess: (newPost: any) => void;
}

export default function ReviewPostForm({ onSuccess }: ReviewPostFormProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceName: '',
    rating: 0,
    visitDate: '',
    location: '',
    pros: [''],
    cons: [''],
    wouldRecommend: true,
  });

  const addPro = () => setFormData(prev => ({ ...prev, pros: [...prev.pros, ''] }));
  const removePro = (idx: number) => setFormData(prev => ({
    ...prev,
    pros: prev.pros.filter((_, i) => i !== idx)
  }));
  const updatePro = (idx: number, value: string) => setFormData(prev => ({
    ...prev,
    pros: prev.pros.map((p, i) => i === idx ? value : p)
  }));

  const addCon = () => setFormData(prev => ({ ...prev, cons: [...prev.cons, ''] }));
  const removeCon = (idx: number) => setFormData(prev => ({
    ...prev,
    cons: prev.cons.filter((_, i) => i !== idx)
  }));
  const updateCon = (idx: number, value: string) => setFormData(prev => ({
    ...prev,
    cons: prev.cons.map((c, i) => i === idx ? value : c)
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || formData.rating === 0) {
      toast({ title: 'Vui lòng điền đầy đủ thông tin', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await petPostService.createPost({
        title: formData.title,
        description: formData.description,
        postType: 'REVIEW',
        petType: 'Chung',
        status: 'GENERAL',
        city: 'TP. Hồ Chí Minh',
        district: formData.location || '',
        location: formData.location,
        tags: ['review'],
        meta: {
          rating: formData.rating,
          serviceName: formData.serviceName,
          visitDate: formData.visitDate,
          pros: formData.pros.filter(p => p.trim()),
          cons: formData.cons.filter(c => c.trim()),
          wouldRecommend: formData.wouldRecommend,
        },
      }, images);

      toast({ title: '🎉 Đã đăng review thành công!' });
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
      <div>
        <Label>⭐ Đánh giá của bạn</Label>
        <div className="mt-2">
          <ReviewStars
            rating={formData.rating}
            readonly={false}
            size="lg"
            onChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
          />
        </div>
      </div>

      <div>
        <Label>📍 Tên dịch vụ</Label>
        <Input
          placeholder="VD: Phòng khám thú y ABC, Pet Shop XYZ..."
          value={formData.serviceName}
          onChange={(e) => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
        />
      </div>

      <div>
        <Label>📝 Tiêu đề review *</Label>
        <Input
          placeholder="VD: Review phòng khám thú y XYZ - Dịch vụ tốt!"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label>💬 Chia sẻ trải nghiệm của bạn *</Label>
        <Textarea
          placeholder="Mô tả chi tiết trải nghiệm của bạn..."
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>📅 Ngày ghé thăm</Label>
          <Input
            type="date"
            value={formData.visitDate}
            onChange={(e) => setFormData(prev => ({ ...prev, visitDate: e.target.value }))}
          />
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

      <div>
        <Label className="flex items-center justify-between">
          <span>✅ Ưu điểm</span>
          <Button type="button" size="sm" variant="outline" onClick={addPro}>
            <Plus className="h-4 w-4 mr-1" /> Thêm
          </Button>
        </Label>
        <div className="space-y-2 mt-2">
          {formData.pros.map((pro, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="VD: Bác sĩ tận tâm"
                value={pro}
                onChange={(e) => updatePro(idx, e.target.value)}
              />
              {formData.pros.length > 1 && (
                <Button type="button" size="icon" variant="ghost" onClick={() => removePro(idx)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="flex items-center justify-between">
          <span>❌ Nhược điểm</span>
          <Button type="button" size="sm" variant="outline" onClick={addCon}>
            <Plus className="h-4 w-4 mr-1" /> Thêm
          </Button>
        </Label>
        <div className="space-y-2 mt-2">
          {formData.cons.map((con, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="VD: Đông khách"
                value={con}
                onChange={(e) => updateCon(idx, e.target.value)}
              />
              {formData.cons.length > 1 && (
                <Button type="button" size="icon" variant="ghost" onClick={() => removeCon(idx)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <ImageUpload images={images} onImagesChange={setImages} />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="recommend"
          checked={formData.wouldRecommend}
          onChange={(e) => setFormData(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
          className="h-4 w-4"
        />
        <Label htmlFor="recommend" className="cursor-pointer">
          👍 Tôi khuyên dùng dịch vụ này
        </Label>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang đăng...
          </>
        ) : (
          '🚀 Đăng review'
        )}
      </Button>
    </form>
  );
}

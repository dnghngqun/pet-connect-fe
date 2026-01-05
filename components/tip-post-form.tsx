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
import { Loader2, Plus, X } from 'lucide-react';

interface TipPostFormProps {
  onSuccess: (newPost: any) => void;
}

const CATEGORIES = [
  { value: 'health', label: '🏥 Sức khỏe' },
  { value: 'training', label: '🎓 Huấn luyện' },
  { value: 'nutrition', label: '🍖 Dinh dưỡng' },
  { value: 'grooming', label: '✂️ Chăm sóc lông' },
  { value: 'behavior', label: '🐾 Hành vi' },
  { value: 'other', label: '📌 Khác' },
];

const DIFFICULTIES = [
  { value: 'easy', label: '🟢 Dễ' },
  { value: 'intermediate', label: '🟡 Trung bình' },
  { value: 'hard', label: '🔴 Khó' },
];

export default function TipPostForm({ onSuccess }: TipPostFormProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'easy',
    readTime: 5,
    tags: [''],
  });

  const addTag = () => setFormData(prev => ({ ...prev, tags: [...prev.tags, ''] }));
  const removeTag = (idx: number) => setFormData(prev => ({
    ...prev,
    tags: prev.tags.filter((_, i) => i !== idx)
  }));
  const updateTag = (idx: number, value: string) => setFormData(prev => ({
    ...prev,
    tags: prev.tags.map((t, i) => i === idx ? value : t)
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast({ title: 'Vui lòng điền đầy đủ thông tin', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await petPostService.createPost({
        title: formData.title,
        description: formData.description,
        postType: 'TIP',
        petType: 'Chung',
        status: 'GENERAL',
        city: 'TP. Hồ Chí Minh',
        district: '',
        tags: ['meohay', ...formData.tags.filter(t => t.trim())],
        meta: {
          category: formData.category,
          difficulty: formData.difficulty,
          readTime: formData.readTime,
          tipTags: formData.tags.filter(t => t.trim()),
        },
      }, images);

      toast({ title: '🎉 Đã chia sẻ mẹo hay thành công!' });
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
        <Label>💡 Tiêu đề mẹo hay *</Label>
        <Input
          placeholder="VD: 5 Cách huấn luyện chó đi vệ sinh đúng chỗ"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label>📖 Chia sẻ chi tiết *</Label>
        <Textarea
          placeholder="Mô tả chi tiết mẹo của bạn, từng bước một..."
          rows={8}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
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

        <div>
          <Label>🎯 Độ khó</Label>
          <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map(diff => (
                <SelectItem key={diff.value} value={diff.value}>{diff.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>⏱️ Thời gian đọc (phút)</Label>
        <Input
          type="number"
          min={1}
          max={60}
          value={formData.readTime}
          onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 5 }))}
        />
      </div>

      <div>
        <Label className="flex items-center justify-between">
          <span>🏷️ Tags</span>
          <Button type="button" size="sm" variant="outline" onClick={addTag}>
            <Plus className="h-4 w-4 mr-1" /> Thêm tag
          </Button>
        </Label>
        <div className="space-y-2 mt-2">
          {formData.tags.map((tag, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="VD: huanluyencho"
                value={tag}
                onChange={(e) => updateTag(idx, e.target.value)}
              />
              {formData.tags.length > 1 && (
                <Button type="button" size="icon" variant="ghost" onClick={() => removeTag(idx)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
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
          '🚀 Chia sẻ mẹo hay'
        )}
      </Button>
    </form>
  );
}

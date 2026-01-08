'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ImageUpload from './image-upload';
import { toast } from '@/components/ui/use-toast';
import petPostService from '@/services/petPostService';
import { Loader2 } from 'lucide-react';

interface QnaPostFormProps {
  onSuccess: (newPost: any) => void;
}

export default function QnaPostForm({ onSuccess }: QnaPostFormProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast({ title: 'Vui lòng điền đầy đủ thông tin', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await petPostService.createPost({
        title: formData.title,
        description: formData.description,
        postType: 'QNA',
        petType: 'Chung',
        status: 'GENERAL',
        city: 'TP. Hồ Chí Minh',
        district: '',
        tags: ['hoidap'],
        meta: {
          topic: 'general', // Default topic
          difficulty: 'easy', // Default difficulty
          isAnswered: false,
          answerCount: 0,
          expertAnswered: false,
        },
      }, images);

      toast({ title: '🎉 Đã đăng câu hỏi thành công!' });
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
        <Label>❓ Câu hỏi của bạn *</Label>
        <Input
          placeholder="VD: Mèo bị ghẻ tai phải làm sao?"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label>📝 Mô tả chi tiết *</Label>
        <Textarea
          placeholder="Mô tả chi tiết vấn đề, triệu chứng, hoàn cảnh..."
          rows={6}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      {/* Simplified: Removed Topic/Difficulty/Context fields as per request */}

      <ImageUpload images={images} onImagesChange={setImages} />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Mẹo:</strong> Đặt câu hỏi rõ ràng, cụ thể sẽ nhận được câu trả lời nhanh hơn!
        </p>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang đăng...
          </>
        ) : (
          '🚀 Đăng câu hỏi'
        )}
      </Button>
    </form>
  );
}

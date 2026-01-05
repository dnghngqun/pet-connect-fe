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

interface QnaPostFormProps {
  onSuccess: (newPost: any) => void;
}

const TOPICS = [
  { value: 'health', label: '🏥 Sức khỏe' },
  { value: 'training', label: '🎓 Huấn luyện' },
  { value: 'nutrition', label: '🍖 Dinh dưỡng' },
  { value: 'behavior', label: '🐾 Hành vi' },
  { value: 'adoption', label: '🏠 Nhận nuôi' },
  { value: 'other', label: '📌 Khác' },
];

const DIFFICULTIES = [
  { value: 'easy', label: '🟢 Cơ bản' },
  { value: 'intermediate', label: '🟡 Trung bình' },
  { value: 'hard', label: '🔴 Phức tạp' },
];

export default function QnaPostForm({ onSuccess }: QnaPostFormProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: '',
    difficulty: 'easy',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.topic) {
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
        tags: ['hoidap', formData.topic],
        meta: {
          topic: formData.topic,
          difficulty: formData.difficulty,
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>📚 Chủ đề *</Label>
          <Select value={formData.topic} onValueChange={(value) => setFormData(prev => ({ ...prev, topic: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn chủ đề" />
            </SelectTrigger>
            <SelectContent>
              {TOPICS.map(topic => (
                <SelectItem key={topic.value} value={topic.value}>{topic.label}</SelectItem>
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

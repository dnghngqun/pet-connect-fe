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

interface BreedingPostFormProps {
  onSuccess: (newPost: any) => void;
}

export default function BreedingPostForm({ onSuccess }: BreedingPostFormProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    petBreed: '',
    petGender: 'male',
    age: '',
    lookingFor: '',
    requirements: [''],
    fee: '',
    isVaccinated: true,
    healthCertified: true,
  });

  const addRequirement = () => setFormData(prev => ({ ...prev, requirements: [...prev.requirements, ''] }));
  const removeRequirement = (idx: number) => setFormData(prev => ({
    ...prev,
    requirements: prev.requirements.filter((_, i) => i !== idx)
  }));
  const updateRequirement = (idx: number, value: string) => setFormData(prev => ({
    ...prev,
    requirements: prev.requirements.map((r, i) => i === idx ? value : r)
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.petBreed || !formData.lookingFor) {
      toast({ title: 'Vui lòng điền đầy đủ thông tin', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const fee = formData.fee ? parseInt(formData.fee.replace(/\D/g, '')) : 0;

      const response = await petPostService.createPost({
        title: formData.title,
        description: formData.description,
        postType: 'BREEDING',
        petType: formData.petBreed,
        status: 'GENERAL',
        city: 'TP. Hồ Chí Minh',
        district: '',
        tags: ['phoigiong', formData.petBreed.toLowerCase()],
        meta: {
          petBreed: formData.petBreed,
          petGender: formData.petGender,
          age: parseInt(formData.age) || 0,
          isNeutered: false,
          isVaccinated: formData.isVaccinated,
          healthCertified: formData.healthCertified,
          lookingFor: formData.lookingFor,
          requirements: formData.requirements.filter(r => r.trim()),
          fee,
        },
      }, images);

      toast({ title: '🎉 Đã đăng thông tin phối giống!' });
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
        <Label>💕 Tiêu đề *</Label>
        <Input
          placeholder="VD: Tìm bạn đời cho Husky đực 2 tuổi"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label>📝 Mô tả *</Label>
        <Textarea
          placeholder="Mô tả về bé cưng của bạn..."
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>🐾 Giống loài *</Label>
          <Input
            placeholder="VD: Husky"
            value={formData.petBreed}
            onChange={(e) => setFormData(prev => ({ ...prev, petBreed: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label>⚥ Giới tính</Label>
          <Select value={formData.petGender} onValueChange={(value) => setFormData(prev => ({ ...prev, petGender: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">♂️ Đực</SelectItem>
              <SelectItem value="female">♀️ Cái</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>📆 Tuổi (tháng)</Label>
          <Input
            type="number"
            placeholder="24"
            value={formData.age}
            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label>💑 Tìm kiếm *</Label>
        <Input
          placeholder="VD: Husky cái thuần chủng, 18-36 tháng tuổi"
          value={formData.lookingFor}
          onChange={(e) => setFormData(prev => ({ ...prev, lookingFor: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label className="flex items-center justify-between">
          <span>⚠️ Yêu cầu</span>
          <Button type="button" size="sm" variant="outline" onClick={addRequirement}>
            <Plus className="h-4 w-4 mr-1" /> Thêm
          </Button>
        </Label>
        <div className="space-y-2 mt-2">
          {formData.requirements.map((req, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="VD: Có giấy chứng nhận sức khỏe"
                value={req}
                onChange={(e) => updateRequirement(idx, e.target.value)}
              />
              {formData.requirements.length > 1 && (
                <Button type="button" size="icon" variant="ghost" onClick={() => removeRequirement(idx)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>💰 Phí dịch vụ (VND, để trống nếu miễn phí)</Label>
        <Input
          placeholder="0"
          value={formatPrice(formData.fee)}
          onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value }))}
        />
      </div>

      <div className="space-y-2 border rounded-lg p-4 bg-pink-50">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="vaccinated"
            checked={formData.isVaccinated}
            onChange={(e) => setFormData(prev => ({ ...prev, isVaccinated: e.target.checked }))}
            className="h-4 w-4"
          />
          <Label htmlFor="vaccinated" className="cursor-pointer">
            💉 Đã tiêm phòng đầy đủ
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="health-cert"
            checked={formData.healthCertified}
            onChange={(e) => setFormData(prev => ({ ...prev, healthCertified: e.target.checked }))}
            className="h-4 w-4"
          />
          <Label htmlFor="health-cert" className="cursor-pointer">
            📜 Có giấy chứng nhận sức khỏe
          </Label>
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
          '🚀 Đăng thông tin'
        )}
      </Button>
    </form>
  );
}

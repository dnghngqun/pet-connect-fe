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
import { Loader2, ArrowRight, ArrowLeft, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneralPostFormProps {
  postType: string;
  onSuccess: (newPost: any) => void;
}

const PET_TYPES = [
  { value: 'dog', label: '🐕 Chó', color: 'bg-orange-100 border-orange-200' },
  { value: 'cat', label: '🐈 Mèo', color: 'bg-blue-100 border-blue-200' },
  { value: 'bird', label: '🦜 Chim', color: 'bg-green-100 border-green-200' },
  { value: 'rabbit', label: '🐰 Thỏ', color: 'bg-pink-100 border-pink-200' },
  { value: 'hamster', label: '🐹 Hamster', color: 'bg-yellow-100 border-yellow-200' },
  { value: 'other', label: '🐾 Khác', color: 'bg-gray-100 border-gray-200' },
];

const LOST_FOUND_STATUS = [
  { value: 'LOST', label: '❌ Bị mất', desc: 'Tôi bị lạc thú cưng' },
  { value: 'FOUND', label: '✅ Tìm thấy', desc: 'Tôi tìm thấy thú cưng đi lạc' },
];

const STEPS = [
  { id: 1, label: 'Thông tin' },
  { id: 2, label: 'Chi tiết' },
  { id: 3, label: 'Hình ảnh' },
];

export default function GeneralPostForm({ postType, onSuccess }: GeneralPostFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleNext = () => {

    if (currentStep === 1) {
      if (!formData.title || !formData.petType) {
        toast({ title: 'Vui lòng nhập tiêu đề và chọn loại thú cưng', variant: 'destructive' });
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.description) {
        toast({ title: 'Vui lòng nhập mô tả chi tiết', variant: 'destructive' });
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
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

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      
      <div className="flex justify-between items-center mb-6 px-4">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-300
              ${currentStep >= step.id 
                ? 'bg-blue-600 text-white shadow-lg scale-110' 
                : 'bg-gray-100 text-gray-400'
              }
            `}>
              {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
            </div>
            {index < STEPS.length - 1 && (
              <div className={`w-12 h-1 mx-2 rounded transition-all duration-300 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-100'}`} />
            )}
          </div>
        ))}
      </div>

      
      <div className="flex-1 overflow-y-auto px-1">
        <AnimatePresence mode="wait" initial={false}>
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {postType === 'LOST_FOUND' ? (
                <div className="grid grid-cols-2 gap-3">
                  {LOST_FOUND_STATUS.map(s => (
                    <div
                      key={s.value}
                      onClick={() => setFormData(prev => ({ ...prev, status: s.value }))}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                        formData.status === s.value 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-bold text-lg mb-1">{s.label}</div>
                      <div className="text-xs text-gray-500">{s.desc}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="font-bold text-green-700 flex items-center gap-2">
                    🏠 Tìm nhà mới
                  </h3>
                  <p className="text-sm text-green-600">Hãy cung cấp thông tin chi tiết để bé sớm tìm được gia đình yêu thương!</p>
                </div>
              )}

              <div>
                <Label>📝 Tiêu đề bài viết</Label>
                <Input
                  className="mt-1.5"
                  placeholder={postType === 'LOST_FOUND' ? 'VD: Tìm chó Husky lạc tại Q1' : 'VD: Tìm chủ cho bé Mèo Anh lông ngắn'}
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label>🐾 Loại thú cưng</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1.5">
                  {PET_TYPES.map(type => (
                    <div
                      key={type.value}
                      onClick={() => setFormData(prev => ({ ...prev, petType: type.value }))}
                      className={`
                        cursor-pointer p-3 rounded-lg border-2 text-center transition-all hover:scale-105 active:scale-95
                        ${formData.petType === type.value 
                          ? `${type.color} ring-2 ring-offset-1 ring-blue-400 border-transparent` 
                          : 'border-gray-100 hover:border-gray-300 bg-gray-50'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">{type.label.split(' ')[0]}</div>
                      <div className="text-xs font-semibold">{type.label.split(' ').slice(1).join(' ')}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>🏷️ Tên thú cưng (nếu có)</Label>
                <Input
                  className="mt-1.5"
                  placeholder="VD: Lu, Miki..."
                  value={formData.petName}
                  onChange={(e) => setFormData(prev => ({ ...prev, petName: e.target.value }))}
                />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <Label>💬 Mô tả chi tiết</Label>
                <Textarea
                  className="mt-1.5"
                  placeholder="Mô tả đặc điểm, tình trạng sức khỏe, tính cách..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>🏙️ Thành phố</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="TP.HCM"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>📍 Quận/Huyện</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="Quận 1"
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>📌 Địa điểm cụ thể</Label>
                <Input
                  className="mt-1.5"
                  placeholder="VD: Công viên Lê Văn Tám"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <Label>📞 Số điện thoại liên hệ</Label>
                <Input
                  className="mt-1.5"
                  placeholder="0912..."
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                />
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                <h4 className="font-bold text-blue-800 mb-1">📸 Hình ảnh là rất quan trọng!</h4>
                <p className="text-sm text-blue-600">
                  Hãy đăng tải những hình ảnh rõ nét nhất để mọi người dễ dàng nhận diện thú cưng của bạn.
                </p>
              </div>

              <ImageUpload images={images} onImagesChange={setImages} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        {currentStep > 1 ? (
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 3 ? (
          <Button onClick={handleNext} className="gap-2 bg-blue-600 hover:bg-blue-700">
            Tiếp tục <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Đăng ngay
          </Button>
        )}
      </div>
    </div>
  );
}

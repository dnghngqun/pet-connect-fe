'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import ReviewPostForm from './review-post-form';
import TipPostForm from './tip-post-form';
import QnaPostForm from './qna-post-form';
import MarketplacePostForm from './marketplace-post-form';
import BreedingPostForm from './breeding-post-form';
import GeneralPostForm from './general-post-form';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: (newPost: any) => void;
}

const POST_TYPES = [
  { 
    value: 'LOST_FOUND', 
    label: 'Thất lạc / Tìm thấy',
    icon: '🔍',
    description: 'Báo mất hoặc tìm thấy thú cưng',
    color: 'from-red-100 to-orange-100'
  },
  { 
    value: 'ADOPTION', 
    label: 'Nhận nuôi',
    icon: '🏠',
    description: 'Tìm nhà mới cho bé cưng',
    color: 'from-green-100 to-emerald-100'
  },
  { 
    value: 'REVIEW', 
    label: 'Review dịch vụ',
    icon: '⭐',
    description: 'Đánh giá phòng khám, cửa hàng...',
    color: 'from-purple-100 to-pink-100'
  },
  { 
    value: 'QNA', 
    label: 'Hỏi đáp',
    icon: '❓',
    description: 'Đặt câu hỏi hoặc chia sẻ kinh nghiệm',
    color: 'from-blue-100 to-cyan-100'
  },
  { 
    value: 'TIP', 
    label: 'Mẹo nuôi thú',
    icon: '💡',
    description: 'Chia sẻ kinh nghiệm chăm sóc',
    color: 'from-amber-100 to-yellow-100'
  },
  { 
    value: 'MARKETPLACE', 
    label: 'Chợ đồ pet',
    icon: '🛒',
    description: 'Mua bán đồ dùng cho thú cưng',
    color: 'from-cyan-100 to-blue-100'
  },
  { 
    value: 'BREEDING', 
    label: 'Phối giống',
    icon: '💕',
    description: 'Tìm bạn đời cho thú cưng',
    color: 'from-pink-100 to-rose-100'
  },
];

export default function CreatePostModal({ open, onOpenChange, onPostCreated }: CreatePostModalProps) {
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [selectedType, setSelectedType] = useState<string>('');

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setStep('form');
  };

  const handleBack = () => {
    setStep('select');
    setSelectedType('');
  };

  const handleClose = () => {
    setStep('select');
    setSelectedType('');
    onOpenChange(false);
  };

  const handlePostCreated = (newPost: any) => {
    if (onPostCreated) {
      onPostCreated(newPost);
    }
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {step === 'select' ? '🐾 Tạo bài viết mới' : '✍️ ' + POST_TYPES.find(t => t.value === selectedType)?.label}
            </span>
            {step === 'form' && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                ← Quay lại
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4">
            {POST_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleSelectType(type.value)}
                className={`p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-lg text-left bg-gradient-to-br ${type.color}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{type.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{type.label}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-4">
            {selectedType === 'REVIEW' && <ReviewPostForm onSuccess={handlePostCreated} />}
            {selectedType === 'TIP' && <TipPostForm onSuccess={handlePostCreated} />}
            {selectedType === 'QNA' && <QnaPostForm onSuccess={handlePostCreated} />}
            {selectedType === 'MARKETPLACE' && <MarketplacePostForm onSuccess={handlePostCreated} />}
            {selectedType === 'BREEDING' && <BreedingPostForm onSuccess={handlePostCreated} />}
            {(selectedType === 'LOST_FOUND' || selectedType === 'ADOPTION') && (
              <GeneralPostForm postType={selectedType} onSuccess={handlePostCreated} />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    color: 'from-orange-100 to-red-100',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:border-orange-400',
    textColor: 'text-orange-700'
  },
  { 
    value: 'ADOPTION', 
    label: 'Nhận nuôi',
    icon: '🏠',
    description: 'Tìm nhà mới cho bé cưng',
    color: 'from-green-100 to-emerald-100',
    borderColor: 'border-green-200',
    hoverColor: 'hover:border-green-400',
    textColor: 'text-green-700'
  },
  { 
    value: 'REVIEW', 
    label: 'Review dịch vụ',
    icon: '⭐',
    description: 'Đánh giá phòng khám, cửa hàng...',
    color: 'from-purple-100 to-pink-100',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:border-purple-400',
    textColor: 'text-purple-700'
  },
  { 
    value: 'QNA', 
    label: 'Hỏi đáp',
    icon: '❓',
    description: 'Đặt câu hỏi hoặc chia sẻ kinh nghiệm',
    color: 'from-blue-100 to-cyan-100',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:border-blue-400',
    textColor: 'text-blue-700'
  },
  { 
    value: 'TIP', 
    label: 'Mẹo nuôi thú',
    icon: '💡',
    description: 'Chia sẻ kinh nghiệm chăm sóc',
    color: 'from-amber-100 to-yellow-100',
    borderColor: 'border-amber-200',
    hoverColor: 'hover:border-amber-400',
    textColor: 'text-amber-700'
  },
  { 
    value: 'MARKETPLACE', 
    label: 'Chợ đồ pet',
    icon: '🛒',
    description: 'Mua bán đồ dùng cho thú cưng',
    color: 'from-cyan-100 to-blue-100',
    borderColor: 'border-cyan-200',
    hoverColor: 'hover:border-cyan-400',
    textColor: 'text-cyan-700'
  },
  { 
    value: 'BREEDING', 
    label: 'Phối giống',
    icon: '💕',
    description: 'Tìm bạn đời cho thú cưng',
    color: 'from-pink-100 to-rose-100',
    borderColor: 'border-pink-200',
    hoverColor: 'hover:border-pink-400',
    textColor: 'text-pink-700'
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
    setTimeout(() => setSelectedType(''), 300); // Clear type after animation
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 transition-all duration-300">
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between bg-white z-10 sticky top-0">
          <div className="flex items-center gap-3">
            {step === 'form' && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {step === 'select' ? (
                <>
                  <span className="text-2xl">✨</span> Tạo bài viết mới
                </>
              ) : (
                <>
                  <span className="text-2xl">{POST_TYPES.find(t => t.value === selectedType)?.icon}</span>
                  {POST_TYPES.find(t => t.value === selectedType)?.label}
                </>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <AnimatePresence mode="wait">
            {step === 'select' ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4"
              >
                {POST_TYPES.map((type, index) => (
                  <motion.button
                    key={type.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectType(type.value)}
                    className={`relative overflow-hidden p-5 rounded-2xl border ${type.borderColor} ${type.hoverColor} bg-gradient-to-br ${type.color} transition-all hover:shadow-md group text-left w-full`}
                  >
                    <div className="flex items-start gap-4 relative z-10">
                      <span className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {type.icon}
                      </span>
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg mb-1 ${type.textColor}`}>{type.label}</h3>
                        <p className="text-sm text-gray-600 font-medium">{type.description}</p>
                      </div>
                    </div>
                    {/* Decorative Circle */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors" />
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {selectedType === 'REVIEW' && <ReviewPostForm onSuccess={handlePostCreated} />}
                {selectedType === 'TIP' && <TipPostForm onSuccess={handlePostCreated} />}
                {selectedType === 'QNA' && <QnaPostForm onSuccess={handlePostCreated} />}
                {selectedType === 'MARKETPLACE' && <MarketplacePostForm onSuccess={handlePostCreated} />}
                {selectedType === 'BREEDING' && <BreedingPostForm onSuccess={handlePostCreated} />}
                {(selectedType === 'LOST_FOUND' || selectedType === 'ADOPTION') && (
                  <GeneralPostForm postType={selectedType} onSuccess={handlePostCreated} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

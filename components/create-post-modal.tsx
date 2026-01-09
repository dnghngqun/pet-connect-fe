'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
const CompactPostWizard = dynamic(() => import('./compact-post-wizard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  ),
});

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: (newPost: any) => void;
  presetType?: string;
  initialPost?: any;
}

export default function CreatePostModal({
  open,
  onOpenChange,
  onPostCreated,
  presetType,
  initialPost,
}: CreatePostModalProps) {
  const [key, setKey] = useState(0);

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (!value) {
      setKey((prev) => prev + 1);
    }
  };

  const handleClose = () => handleOpenChange(false);

  const isEditing = !!initialPost;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            {isEditing ? 'Chỉnh sửa bài đăng ✏️' : 'Đăng bài mới 🐾'}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[75vh] px-2">
          <CompactPostWizard
            key={key}
            presetType={presetType}
            initialPost={initialPost}
            isEditing={isEditing}
            onPostCreated={(post) => {
              onPostCreated?.(post);
              handleClose();
            }}
            onCancel={handleClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

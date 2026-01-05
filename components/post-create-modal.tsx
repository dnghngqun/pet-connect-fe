'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

// Lazy-load wizard to keep homepage bundle light
const NewPostPage = dynamic(() => import('@/app/post/new/page').then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  ),
});

interface PostCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presetType?: string;
}

export default function PostCreateModal({ open, onOpenChange, presetType }: PostCreateModalProps) {
  // A tiny state toggle to force rerender when presetType changes
  const [key, setKey] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (value === false) setKey((k) => k + 1);
      }}
    >
      <DialogContent className="max-w-6xl w-[95vw] max-h-[85vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Đăng bài mới</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[78vh] px-6 pb-6">
          <div className="rounded-lg border bg-white shadow-sm">
            <NewPostPage key={key} presetType={presetType} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

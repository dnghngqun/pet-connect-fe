'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import petPostService from '@/services/petPostService';

interface DeletePostDialogProps {
  postId: number;
  postTitle: string;
  redirectTo?: string;
}

export default function DeletePostDialog({
  postId,
  postTitle,
  redirectTo = '/profile',
}: DeletePostDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await petPostService.deletePost(postId);
      
      toast({
        title: 'Thành công',
        description: 'Đã xóa bài đăng',
      });
      
      router.push(redirectTo);
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa bài đăng. Vui lòng thử lại.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa bài đăng
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa bài đăng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa bài đăng &quot;{postTitle}&quot;? 
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Xóa bài đăng
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

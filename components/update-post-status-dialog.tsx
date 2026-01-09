'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import petPostService from '@/services/petPostService';

interface UpdatePostStatusDialogProps {
  postId: number;
  currentStatus: string;
  onStatusUpdated?: (newStatus: string) => void;
}
const getStatusOptions = (currentStatus: string) => {
  const baseOptions = {
    lost: [
      { value: 'FOUND', label: 'Đã tìm thấy' },
    ],
    found: [
      { value: 'LOST', label: 'Thất lạc (chưa có chủ)' },
      { value: 'FOR_ADOPTION', label: 'Cần được nhận nuôi' },
    ],
    'for-adoption': [
      { value: 'RESCUE', label: 'Đã được nhận nuôi' },
    ],
    rescue: [
      { value: 'FOR_ADOPTION', label: 'Cần tìm nhà mới' },
    ],
  };

  return baseOptions[currentStatus as keyof typeof baseOptions] || [];
};

export default function UpdatePostStatusDialog({
  postId,
  currentStatus,
  onStatusUpdated,
}: UpdatePostStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const statusOptions = getStatusOptions(currentStatus);

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn trạng thái mới',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await petPostService.updatePost(postId, { status: selectedStatus });
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật trạng thái bài đăng',
      });
      
      onStatusUpdated?.(selectedStatus);
      setOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (statusOptions.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Cập nhật trạng thái
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái bài đăng</DialogTitle>
          <DialogDescription>
            Chọn trạng thái mới cho bài đăng của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái mới" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleUpdateStatus} disabled={loading || !selectedStatus}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

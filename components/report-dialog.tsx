'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId?: string;
  userId?: string;
  postTitle?: string;
  userName?: string;
}

const POST_REPORT_REASONS = [
  { id: 'spam', label: 'Spam hoặc quảng cáo' },
  { id: 'inappropriate', label: 'Nội dung không phù hợp' },
  { id: 'harassment', label: 'Quấy rối hoặc bắt nạt' },
  { id: 'scam', label: 'Lừa đảo hoặc gian dối' },
  { id: 'animal_abuse', label: 'Hành hạ động vật' },
  { id: 'misleading', label: 'Thông tin sai lệch' },
  { id: 'other', label: 'Lý do khác' },
];

const USER_REPORT_REASONS = [
  { id: 'spam', label: 'Spam hoặc quảng cáo' },
  { id: 'inappropriate', label: 'Hành vi không phù hợp' },
  { id: 'harassment', label: 'Quấy rối hoặc bắt nạt' },
  { id: 'scam', label: 'Lừa đảo hoặc gian dối' },
  { id: 'dangerous', label: 'Hành vi nguy hiểm' },
  { id: 'impersonation', label: 'Giả mạo' },
  { id: 'other', label: 'Lý do khác' },
];

export default function ReportDialog({
  open,
  onOpenChange,
  postId,
  userId,
  postTitle,
  userName,
}: ReportDialogProps) {
  const [activeTab, setActiveTab] = useState<'post' | 'user'>('post');
  const [postReason, setPostReason] = useState<string>('');
  const [userReason, setUserReason] = useState<string>('');
  const [postOtherReason, setPostOtherReason] = useState<string>('');
  const [userOtherReason, setUserOtherReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostReportSubmit = async () => {
    if (!postReason) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn lý do báo cáo',
        variant: 'destructive',
      });
      return;
    }

    if (postReason === 'other' && !postOtherReason.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do khác',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const reportData = {
        type: 'post',
        postId,
        reason: postReason,
        otherReason: postReason === 'other' ? postOtherReason : undefined,
      };

      // TODO: Call API to submit report
      console.log('Post Report:', reportData);

      toast({
        title: 'Thành công',
        description: 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ kiểm tra ngay.',
        variant: 'default',
      });

      onOpenChange(false);
      setPostReason('');
      setPostOtherReason('');
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi báo cáo. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserReportSubmit = async () => {
    if (!userReason) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn lý do báo cáo',
        variant: 'destructive',
      });
      return;
    }

    if (userReason === 'other' && !userOtherReason.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do khác',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const reportData = {
        type: 'user',
        userId,
        reason: userReason,
        otherReason: userReason === 'other' ? userOtherReason : undefined,
      };

      // TODO: Call API to submit report
      console.log('User Report:', reportData);

      toast({
        title: 'Thành công',
        description: 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ kiểm tra ngay.',
        variant: 'default',
      });

      onOpenChange(false);
      setUserReason('');
      setUserOtherReason('');
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi báo cáo. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle>Báo cáo</DialogTitle>
          <DialogDescription>
            Giúp chúng tôi cải thiện cộng đồng bằng cách báo cáo nội dung không phù hợp
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'post' | 'user')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="post">Báo cáo bài đăng</TabsTrigger>
            <TabsTrigger value="user">Báo cáo người dùng</TabsTrigger>
          </TabsList>

          {/* Post Report Tab */}
          <TabsContent value="post" className="space-y-4">
            {postTitle && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Bài đăng:</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{postTitle}</p>
              </div>
            )}

            <div className="space-y-3">
              <p className="font-medium text-sm">Lý do báo cáo:</p>
              <RadioGroup value={postReason} onValueChange={setPostReason}>
                {POST_REPORT_REASONS.map((reason) => (
                  <div key={reason.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason.id} id={`post-${reason.id}`} />
                    <Label
                      htmlFor={`post-${reason.id}`}
                      className="font-normal cursor-pointer flex-1"
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {postReason === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="post-other-reason" className="text-sm font-medium">
                  Vui lòng mô tả lý do khác:
                </Label>
                <Textarea
                  id="post-other-reason"
                  placeholder="Nhập lý do khác của bạn..."
                  value={postOtherReason}
                  onChange={(e) => setPostOtherReason(e.target.value)}
                  className="min-h-24 resize-none"
                />
              </div>
            )}

            <Button
              onClick={handlePostReportSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          </TabsContent>

          {/* User Report Tab */}
          <TabsContent value="user" className="space-y-4">
            {userName && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Người dùng:</p>
                <p className="text-sm text-muted-foreground">{userName}</p>
              </div>
            )}

            <div className="space-y-3">
              <p className="font-medium text-sm">Lý do báo cáo:</p>
              <RadioGroup value={userReason} onValueChange={setUserReason}>
                {USER_REPORT_REASONS.map((reason) => (
                  <div key={reason.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason.id} id={`user-${reason.id}`} />
                    <Label
                      htmlFor={`user-${reason.id}`}
                      className="font-normal cursor-pointer flex-1"
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {userReason === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="user-other-reason" className="text-sm font-medium">
                  Vui lòng mô tả lý do khác:
                </Label>
                <Textarea
                  id="user-other-reason"
                  placeholder="Nhập lý do khác của bạn..."
                  value={userOtherReason}
                  onChange={(e) => setUserOtherReason(e.target.value)}
                  className="min-h-24 resize-none"
                />
              </div>
            )}

            <Button
              onClick={handleUserReportSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}


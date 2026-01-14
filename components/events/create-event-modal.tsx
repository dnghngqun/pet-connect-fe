'use client';

import { useState } from 'react';
import eventService from '@/services/eventService';
import uploadService from '@/services/uploadService';
import { useToast } from '@/components/ui/use-toast';
import { useRef } from 'react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
  groupId?: number; // Optional: If creating event for a specific group
}

export default function CreateEventModal({ isOpen, onClose, onEventCreated, groupId }: CreateEventModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    city: '',
    date: '',
    time: '',
    coverImageUrl: '',
    maxParticipants: '',
    isPrivate: false,
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Tên sự kiện là bắt buộc' });
      return;
    }
    if (!formData.location.trim()) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Địa điểm là bắt buộc' });
      return;
    }
    if (!formData.date) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Ngày diễn ra là bắt buộc' });
      return;
    }

    setIsLoading(true);
    try {
      // Combine date and time into ISO datetime
      const dateTime = formData.time 
        ? `${formData.date}T${formData.time}:00`
        : `${formData.date}T09:00:00`;

      if (new Date(dateTime) < new Date()) {
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Thời gian diễn ra không thể ở trong quá khứ' });
        setIsLoading(false);
        return;
      }

      let finalCoverUrl = formData.coverImageUrl;

      if (coverFile) {
        finalCoverUrl = await uploadService.uploadFile(coverFile, "events");
      }

      const requestData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        city: formData.city,
        startAt: dateTime,
        coverImageUrl: finalCoverUrl,
        isPrivate: formData.isPrivate,
        ...(groupId && { groupId }),
      };

      const response = await eventService.createEvent(requestData);
      if (response.success) {
        toast({ title: 'Thành công', description: 'Đã tạo sự kiện mới!' });
        setFormData({ title: '', description: '', location: '', city: '', date: '', time: '', coverImageUrl: '', maxParticipants: '', isPrivate: false });
        setCoverFile(null);
        setCoverPreview('');
        onEventCreated?.();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Create event error:', error);
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tạo sự kiện. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-6" role="dialog">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#3c3632] rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shrink-0 bg-white dark:bg-[#3c3632] z-10">
          <h3 className="text-xl font-bold text-[#1d0e0c] dark:text-white">Tạo sự kiện mới</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-[#1d0e0c] dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1d0e0c] dark:text-white">Ảnh bìa sự kiện</label>
            <div 
              onClick={() => coverInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[#ff7366]/50 hover:bg-[#ff7366]/5 transition-all cursor-pointer group"
            >
              {coverPreview || formData.coverImageUrl ? (
                <div className="relative w-full h-40 bg-cover bg-center rounded-lg" style={{ backgroundImage: `url("${coverPreview || formData.coverImageUrl}")` }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverFile(null);
                      setCoverPreview('');
                      setFormData(prev => ({ ...prev, coverImageUrl: '' }));
                    }}
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1 hover:bg-black/70"
                  >
                    <span className="material-symbols-outlined text-white text-[18px]">close</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-gray-500">add_photo_alternate</span>
                  </div>
                  <p className="text-sm font-medium text-[#1d0e0c] dark:text-white">Nhấn để tải ảnh lên</p>
                  <p className="text-xs text-gray-500 mt-1">Hoặc dán URL ảnh bên dưới</p>
                </>
              )}
            </div>
            <input 
              ref={coverInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleCoverChange} 
            />
            <input
              type="text"
              placeholder="URL ảnh bìa (tùy chọn)"
              value={formData.coverImageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, coverImageUrl: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl bg-white dark:bg-[#3c3632] border border-gray-200 dark:border-gray-700 focus:border-[#ff7366] focus:ring-2 focus:ring-[#ff7366]/20 outline-none text-sm text-[#1d0e0c] dark:text-white placeholder:text-gray-400"
            />
          </div>

          {/* Event Name */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1d0e0c] dark:text-white">Tên sự kiện *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ví dụ: Offline công viên Tao Đàn"
              className="w-full px-4 py-3 rounded-xl bg-[#fcf8f8] dark:bg-[#2a2622] border-gray-200 dark:border-gray-700 focus:border-[#ff7366] focus:ring-[#ff7366] text-[#1d0e0c] dark:text-white placeholder:text-gray-400"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1d0e0c] dark:text-white">Ngày diễn ra *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                </span>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#fcf8f8] dark:bg-[#2a2622] border-gray-200 dark:border-gray-700 focus:border-[#ff7366] focus:ring-[#ff7366] text-[#1d0e0c] dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1d0e0c] dark:text-white">Giờ bắt đầu</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                </span>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#fcf8f8] dark:bg-[#2a2622] border-gray-200 dark:border-gray-700 focus:border-[#ff7366] focus:ring-[#ff7366] text-[#1d0e0c] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1d0e0c] dark:text-white">Địa điểm *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-[#ff7366] pointer-events-none">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
              </span>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Nhập địa điểm tổ chức sự kiện"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#fcf8f8] dark:bg-[#2a2622] border-gray-200 dark:border-gray-700 focus:border-[#ff7366] focus:ring-[#ff7366] text-[#1d0e0c] dark:text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1d0e0c] dark:text-white">Thành phố</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Ví dụ: TP. Hồ Chí Minh"
              className="w-full px-4 py-3 rounded-xl bg-[#fcf8f8] dark:bg-[#2a2622] border-gray-200 dark:border-gray-700 focus:border-[#ff7366] focus:ring-[#ff7366] text-[#1d0e0c] dark:text-white placeholder:text-gray-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1d0e0c] dark:text-white">Mô tả nội dung sự kiện</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả chi tiết về các hoạt động, lưu ý khi tham gia..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[#fcf8f8] dark:bg-[#2a2622] border-gray-200 dark:border-gray-700 focus:border-[#ff7366] focus:ring-[#ff7366] text-[#1d0e0c] dark:text-white placeholder:text-gray-400 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-[#3c3632] shrink-0 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#ff7366] hover:bg-[#ff7366]/90 shadow-lg shadow-[#ff7366]/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Đang tạo...' : 'Đăng sự kiện'}
          </button>
        </div>
      </div>
    </div>
  );
}

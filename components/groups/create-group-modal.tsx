'use client';

import { useState } from 'react';
import groupService, { CreateGroupRequest } from '@/services/groupService';
import uploadService from '@/services/uploadService';
import { useToast } from '@/components/ui/use-toast';
import { useRef } from 'react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated?: () => void;
}

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: '',
    description: '',
    category: 'OTHER',
    isPrivate: false,
    city: '',
    avatarUrl: '',
    coverImageUrl: '',
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Tên nhóm là bắt buộc' });
      return;
    }

    // Get current pet
    const storedPet = localStorage.getItem('current-pet');
    if (!storedPet) {
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Vui lòng chọn thú cưng để tạo nhóm' });
        return;
    }
    const currentPet = JSON.parse(storedPet);

    setIsLoading(true);
    try {
      let finalAvatarUrl = formData.avatarUrl;
      let finalCoverUrl = formData.coverImageUrl;

      if (avatarFile) {
        finalAvatarUrl = await uploadService.uploadFile(avatarFile, "groups/avatars");
      }
      if (coverFile) {
        finalCoverUrl = await uploadService.uploadFile(coverFile, "groups/covers");
      }

      // Fix: Pass petId as second argument
      const response = await groupService.createGroup({
        ...formData,
        avatarUrl: finalAvatarUrl,
        coverImageUrl: finalCoverUrl
      }, currentPet.id);
      
      if (response.success) {
        toast({ title: 'Thành công', description: 'Đã tạo nhóm mới!' });
        setFormData({ name: '', description: '', category: 'OTHER', isPrivate: false, city: '', avatarUrl: '', coverImageUrl: '' });
        setAvatarFile(null);
        setCoverFile(null);
        setAvatarPreview('');
        setCoverPreview('');
        onGroupCreated?.();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Create group error:', error);
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tạo nhóm. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white dark:bg-[#3c3632] shadow-2xl transition-all flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 z-10 bg-white dark:bg-[#3c3632]">
          <h3 className="text-xl font-bold text-[#1d0e0c] dark:text-white">Tạo nhóm mới</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-[#1d0e0c] dark:text-gray-400 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1d0e0c] dark:text-white">Ảnh bìa nhóm</label>
            <div 
              onClick={() => coverInputRef.current?.click()}
              className="relative w-full aspect-[21/9] rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-[#ff7366]/50 transition-all cursor-pointer flex flex-col items-center justify-center group overflow-hidden"
            >
              {coverPreview || formData.coverImageUrl ? (
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${coverPreview || formData.coverImageUrl}")` }}>
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
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-[#3c3632] shadow-sm flex items-center justify-center mb-3 text-[#ff7366]">
                    <span className="material-symbols-outlined">add_photo_alternate</span>
                  </div>
                  <p className="text-sm font-semibold text-[#1d0e0c] dark:text-white">Tải ảnh bìa lên</p>
                  <p className="text-xs text-gray-500 mt-1">Hoặc dán URL ảnh bên dưới</p>
                </div>
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

          {/* Group Avatar & Name */}
          <div className="flex gap-4 items-start">
            <div className="shrink-0 space-y-2">
              <label className="block text-sm font-bold text-[#1d0e0c] dark:text-white text-center">Avatar</label>
              <div 
                onClick={() => avatarInputRef.current?.click()}
                className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-[#ff7366] bg-cover bg-center relative group"
                style={{ backgroundImage: avatarPreview || formData.avatarUrl ? `url("${avatarPreview || formData.avatarUrl}")` : undefined }}
              >
                {!avatarPreview && !formData.avatarUrl && (
                  <span className="material-symbols-outlined text-gray-400">add_a_photo</span>
                )}
                <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-white">edit</span>
                </div>
              </div>
              <input 
                ref={avatarInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange} 
              />
            </div>
            
            <div className="space-y-2 flex-1">
              <label className="block text-sm font-bold text-[#1d0e0c] dark:text-white">Tên nhóm *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ví dụ: Hội Corgi Sài Gòn"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#3c3632] border border-gray-200 dark:border-gray-700 focus:border-[#ff7366] focus:ring-2 focus:ring-[#ff7366]/20 outline-none text-[#1d0e0c] dark:text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1d0e0c] dark:text-white">Loại nhóm</label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#3c3632] border border-gray-200 dark:border-gray-700 focus:border-[#ff7366] focus:ring-2 focus:ring-[#ff7366]/20 outline-none text-[#1d0e0c] dark:text-white appearance-none cursor-pointer"
                >
                  <option value="BREED">Theo giống loài</option>
                  <option value="LOCATION">Theo địa điểm</option>
                  <option value="INTEREST">Sở thích chung</option>
                  <option value="ACTIVITY">Hoạt động</option>
                  <option value="OTHER">Khác</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none material-symbols-outlined">expand_more</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1d0e0c] dark:text-white">Địa điểm</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Quận 1, TP.HCM"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-[#3c3632] border border-gray-200 dark:border-gray-700 focus:border-[#ff7366] focus:ring-2 focus:ring-[#ff7366]/20 outline-none text-[#1d0e0c] dark:text-white placeholder:text-gray-400"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">location_on</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1d0e0c] dark:text-white">Mô tả & Quy định tham gia</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Giới thiệu ngắn về nhóm của bạn và những điều cần lưu ý cho thành viên mới..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#3c3632] border border-gray-200 dark:border-gray-700 focus:border-[#ff7366] focus:ring-2 focus:ring-[#ff7366]/20 outline-none text-[#1d0e0c] dark:text-white placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isPrivate ? 'bg-[#ff7366]' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm font-medium text-[#1d0e0c] dark:text-white">
              {formData.isPrivate ? 'Nhóm riêng tư (cần duyệt)' : 'Nhóm công khai'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-black/20 flex items-center justify-end gap-3 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#ff7366] hover:bg-[#ff7366]/90 shadow-lg shadow-[#ff7366]/25 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Đang tạo...' : 'Tạo nhóm ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}

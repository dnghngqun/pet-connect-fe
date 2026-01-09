'use client';

import { Camera, Edit, MessageCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import FriendRequestButton from '@/components/friend-request-button';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useMiniChat } from '@/contexts/mini-chat-context';
import { toast } from '@/components/ui/use-toast';
import userService from '@/services/userService';

interface UserProfile {
  id: number;
  fullName: string;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  isOwnProfile?: boolean;
  stats?: {
    postsCount: number;
    friendsCount: number;
    [key: string]: any;
  };
}

interface ProfileHeaderProps {
  profile: UserProfile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl || 'https:
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { openMiniChat } = useMiniChat();
  

  const handleSendMessage = () => {
    openMiniChat(String(profile.id), {
      id: String(profile.id),
      name: profile.fullName,
      avatar: profile.avatarUrl,
    });
  };
  const handleCoverPhotoClick = () => {
    coverInputRef.current?.click();
  };

  const handleCoverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Chỉ chấp nhận file ảnh', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File quá lớn (tối đa 10MB)', variant: 'destructive' });
      return;
    }

    setIsUploadingCover(true);
    try {
      const result = await userService.uploadCoverPhoto(file);
      if (result.success && result.data?.coverUrl) {
        setCoverUrl(result.data.coverUrl);
        toast({ title: '🎉 Cập nhật ảnh bìa thành công!' });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload cover photo:', error);
      toast({ title: 'Có lỗi xảy ra khi tải ảnh bìa', variant: 'destructive' });
    } finally {
      setIsUploadingCover(false);

      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }
    }
  };
  
  return (
    <div className="bg-white shadow-sm pb-4">
      <div className="relative max-w-5xl mx-auto">
        
        <div className="h-[200px] md:h-[350px] w-full rounded-b-xl overflow-hidden relative group">
          <img 
            src={coverUrl} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          
          {profile.isOwnProfile && (
            <>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverPhotoChange}
              />
              <Button 
                variant="secondary" 
                size="sm" 
                className="absolute bottom-4 right-4 bg-white/80 hover:bg-white text-black hidden group-hover:flex gap-2"
                onClick={handleCoverPhotoClick}
                disabled={isUploadingCover}
              >
                {isUploadingCover ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {isUploadingCover ? 'Đang tải...' : 'Chỉnh sửa ảnh bìa'}
              </Button>
            </>
          )}
        </div>

        
        <div className="px-4 pb-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end -mt-[30px] md:-mt-[40px] relative z-10">
            
            
            <div className="relative">
              <div className="p-1 bg-white rounded-full">
                <Avatar className="w-[120px] h-[120px] md:w-[168px] md:h-[168px] border-4 border-white">
                  <AvatarImage src={profile.avatarUrl} className="object-cover" />
                  <AvatarFallback className="text-4xl">{profile.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              
              {profile.isOwnProfile && (
                <div className="absolute bottom-2 right-2 bg-gray-200 p-2 rounded-full cursor-pointer hover:bg-gray-300 border border-white">
                  <Camera className="h-5 w-5 text-black" />
                </div>
              )}
            </div>

            
            <div className="flex-1 mt-2 md:mt-0 md:mb-4 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">{profile.fullName}</h1>
              {profile.stats?.friendsCount !== undefined && (
                <p className="text-muted-foreground font-semibold mt-1">
                  {profile.stats.friendsCount} bạn bè
                </p>
              )}
              {profile.bio && (
                <p className="text-gray-600 mt-1 max-w-lg">{profile.bio}</p>
              )}
            </div>

            
            <div className="flex flex-row gap-2 mt-4 md:mt-0 md:mb-4 w-full md:w-auto justify-center">
              {profile.isOwnProfile ? (
                <>
                  <Button className="flex-1 md:flex-none gap-2 bg-primary hover:bg-primary/90">
                    <span className="text-lg">+</span> Thêm vào tin
                  </Button>
                  <Button variant="secondary" className="flex-1 md:flex-none gap-2 bg-gray-200 hover:bg-gray-300 text-black">
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa trang cá nhân
                  </Button>
                </>
              ) : (
                <>
                  <FriendRequestButton userId={profile.id} userName={profile.fullName} />
                  
                  <Button 
                    variant="secondary" 
                    className="gap-2 bg-gray-200 hover:bg-gray-300 text-black"
                    onClick={handleSendMessage}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Nhắn tin
                  </Button>
                </>
              )}
              
              <Button variant="ghost" size="icon" className="bg-gray-100 hover:bg-gray-200">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="mt-6 md:mt-8 border-t pt-1">
            
          </div>
        </div>
      </div>
    </div>
  );
}

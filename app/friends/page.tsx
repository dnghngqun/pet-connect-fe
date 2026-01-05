import FriendRequestList from '@/components/friend-request/friend-request-list';
import { Users, PawPrint, Heart, Sparkles } from 'lucide-react';

export default function FriendsPage() {
  return (
    <div className="min-h-screen py-8 relative">
      {/* Decorative stickers */}
      <div className="absolute top-24 right-12 text-orange-200/30 animate-pulse">
        <Users size={36} />
      </div>
      <div className="absolute bottom-32 left-10 text-amber-200/30">
        <PawPrint size={32} className="rotate-12" />
      </div>
      <div className="absolute top-48 left-16 text-pink-200/30">
        <Heart size={24} />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Bạn bè
                </h1>
                <p className="text-sm text-muted-foreground">Kết nối với những người yêu thú cưng 🐾</p>
              </div>
            </div>
          </div>

          {/* Requests Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-400" />
                Lời mời kết bạn
              </h2>
              <span className="text-orange-500 hover:underline cursor-pointer text-sm font-medium">Xem tất cả</span>
            </div>
            
            <FriendRequestList />
          </div>

          {/* My Friends Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-400" />
                Danh sách bạn bè
              </h2>
            </div>
            <div className="p-8 text-center bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 mb-4">
                <Users className="h-8 w-8 text-orange-400" />
              </div>
              <p className="text-muted-foreground">Chưa có danh sách bạn bè 🐕</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


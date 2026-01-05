'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface FriendPreview {
  id: number;
  name: string;
  avatarUrl: string;
}

interface ProfileFriendsProps {
  friends: FriendPreview[];
  totalFriends?: number;
  seeAllLink?: string;
}

export default function ProfileFriendsPreview({ friends, totalFriends = 0, seeAllLink = '#' }: ProfileFriendsProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-bold text-xl">Bạn bè</h2>
          <p className="text-muted-foreground text-sm">{totalFriends} người bạn</p>
        </div>
        <Link href={seeAllLink} className="text-primary hover:bg-primary/10 px-2 py-1 rounded text-sm transition">
          Xem tất cả
        </Link>
      </div>
      
      {friends.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {friends.slice(0, 9).map((friend) => (
            <Link key={friend.id} href={`/profile/${friend.id}`} className="block group">
              <div className="aspect-square rounded-lg overflow-hidden mb-1">
                <img 
                  src={friend.avatarUrl} 
                  alt={friend.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <p className="text-xs font-medium truncate group-hover:underline">
                {friend.name}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-4">Chưa có bạn bè nào</p>
      )}
    </Card>
  );
}

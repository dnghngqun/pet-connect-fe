import { Users, MapPin, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Group } from '@/services/groupService';
import Link from 'next/link';

interface GroupCardProps {
  group: Group;
}

const CATEGORY_LABELS: Record<string, string> = {
  BREED: 'Giống',
  LOCATION: 'Khu vực',
  INTEREST: 'Sở thích',
  ACTIVITY: 'Hoạt động',
  OTHER: 'Khác',
};

const CATEGORY_COLORS: Record<string, string> = {
  BREED: 'bg-blue-100 text-blue-700',
  LOCATION: 'bg-green-100 text-green-700',
  INTEREST: 'bg-purple-100 text-purple-700',
  ACTIVITY: 'bg-orange-100 text-orange-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

export default function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="p-0">
          {/* Cover Image */}
          <div className="relative h-32 bg-gradient-to-r from-primary/20 to-orange-500/20">
            {group.coverImageUrl ? (
              <img
                src={group.coverImageUrl}
                alt={group.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Users className="h-12 w-12 text-muted-foreground opacity-50" />
              </div>
            )}
            {group.isPrivate && (
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Riêng tư
              </div>
            )}
          </div>

          {/* Group Info */}
          <div className="p-4">
            {/* Avatar & Title */}
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="h-12 w-12 border-2 border-background -mt-8 relative z-10">
                <AvatarImage src={group.avatarUrl} alt={group.name} />
                <AvatarFallback className="bg-primary/10">
                  {group.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
                  {group.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge
                    variant="secondary"
                    className={CATEGORY_COLORS[group.category]}
                  >
                    {CATEGORY_LABELS[group.category]}
                  </Badge>
                  {group.isMember && (
                    <Badge variant="default" className="text-xs">
                      {group.memberRole === 'ADMIN' && '👑 Admin'}
                      {group.memberRole === 'MODERATOR' && '⭐ Mod'}
                      {group.memberRole === 'MEMBER' && '✓ Thành viên'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {group.description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{group.memberCount} thành viên</span>
              </div>
              {group.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{group.city}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

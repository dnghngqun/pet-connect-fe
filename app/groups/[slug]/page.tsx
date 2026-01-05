'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  MapPin,
  Calendar,
  Settings,
  UserPlus,
  UserMinus,
  Lock,
  Globe,
  Crown,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getGroupBySlug,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  Group,
  GroupMember,
} from '@/services/groupService';
import authService from '@/services/authService';

const CATEGORY_LABELS: Record<string, string> = {
  BREED: 'Giống',
  LOCATION: 'Khu vực',
  INTEREST: 'Sở thích',
  ACTIVITY: 'Hoạt động',
  OTHER: 'Khác',
};

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (slug) {
      loadGroup();
      loadMembers();
    }
  }, [slug]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const response = await getGroupBySlug(slug);
      if (response.success) {
        setGroup(response.data);
      }
    } catch (error) {
      console.error('Error loading group:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const response = await getGroupMembers(parseInt(slug), 0, 20);
      if (response.success) {
        setMembers(response.data || []);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleJoinLeave = async () => {
    if (!currentUser) {
      router.push('/sign-in');
      return;
    }

    if (!group) return;

    try {
      setJoining(true);
      if (group.isMember) {
        await leaveGroup(group.id);
      } else {
        await joinGroup(group.id);
      }
      // Reload group to update member status
      await loadGroup();
      await loadMembers();
    } catch (error) {
      console.error('Error joining/leaving group:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Không tìm thấy hội nhóm</p>
          <Button onClick={() => router.push('/groups')}>Về trang hội nhóm</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-primary/20 to-orange-500/20">
        {group.coverImageUrl && (
          <img
            src={group.coverImageUrl}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Group Header */}
          <div className="relative -mt-20 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6 flex-col sm:flex-row">
                  {/* Avatar */}
                  <Avatar className="h-32 w-32 border-4 border-background">
                    <AvatarImage src={group.avatarUrl} alt={group.name} />
                    <AvatarFallback className="text-3xl bg-primary/10">
                      {group.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <Badge variant="secondary">
                            {CATEGORY_LABELS[group.category]}
                          </Badge>
                          {group.isPrivate ? (
                            <Badge variant="outline" className="gap-1">
                              <Lock className="h-3 w-3" />
                              Riêng tư
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <Globe className="h-3 w-3" />
                              Công khai
                            </Badge>
                          )}
                          {group.isMember && group.memberRole && (
                            <Badge className="gap-1">
                              {group.memberRole === 'ADMIN' && <><Crown className="h-3 w-3" /> Admin</>}
                              {group.memberRole === 'MODERATOR' && <><Star className="h-3 w-3" /> Moderator</>}
                              {group.memberRole === 'MEMBER' && 'Thành viên'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{group.memberCount} thành viên</span>
                          </div>
                          {group.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{group.city}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Tạo {new Date(group.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {currentUser && (
                          <>
                            <Button
                              onClick={handleJoinLeave}
                              disabled={joining}
                              variant={group.isMember ? 'outline' : 'default'}
                              className="gap-2"
                            >
                              {group.isMember ? (
                                <>
                                  <UserMinus className="h-4 w-4" />
                                  Rời nhóm
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-4 w-4" />
                                  Tham gia
                                </>
                              )}
                            </Button>
                            {(group.memberRole === 'ADMIN' || group.memberRole === 'MODERATOR') && (
                              <Button variant="outline" size="icon">
                                <Settings className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList>
              <TabsTrigger value="about">Giới thiệu</TabsTrigger>
              <TabsTrigger value="members">Thành viên</TabsTrigger>
              <TabsTrigger value="posts">Bài viết</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Về nhóm</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {group.description}
                  </p>
                </CardContent>
              </Card>

              {group.rules && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nội quy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {group.rules}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Admins */}
              {group.admins && group.admins.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quản trị viên</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {group.admins.map((admin) => (
                        <div key={admin.id} className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={admin.userAvatar} />
                            <AvatarFallback>
                              {admin.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{admin.userName}</p>
                            <p className="text-sm text-muted-foreground">
                              {admin.role === 'ADMIN' ? 'Quản trị viên' : 'Điều hành viên'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Thành viên ({group.memberCount})</CardTitle>
                </CardHeader>
                <CardContent>
                  {members.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Chưa có thành viên nào
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                        >
                          <Avatar>
                            <AvatarImage src={member.userAvatar} />
                            <AvatarFallback>
                              {member.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{member.userName}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                {member.role === 'ADMIN' && '👑 Admin'}
                                {member.role === 'MODERATOR' && '⭐ Moderator'}
                                {member.role === 'MEMBER' && 'Thành viên'}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts">
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    Tính năng bài viết nhóm đang được phát triển
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

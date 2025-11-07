'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import authService from '@/services/authService';
import userService from '@/services/userService';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      setUser(currentUser);

      try {
        const resp = await userService.getProfile();
        const profile = resp?.data || resp;

        setUser((prev) => ({
          id: profile.id || prev?.id || '',
          fullName: profile.fullName || profile.name || prev?.fullName || '',
          email: profile.email || prev?.email || '',
          phoneNumber: profile.phoneNumber || profile.phone || prev?.phoneNumber || '',
          avatar: profile.avatar || prev?.avatar,
          createdAt: profile.createdAt || prev?.createdAt || new Date().toISOString(),
        }));
      } catch (err) {

      }
    };

    fetchProfile();
  }, []);

  if (!user) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Vui lòng đăng nhập để xem thông tin cá nhân</p>
            <Button className="mt-4" variant="default" onClick={() => window.location.href = '/sign-in'}>
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} alt={user.fullName} />
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{user.fullName}</h1>
                <p className="text-muted-foreground">Thành viên từ {new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                <Button className="mt-4" variant="outline">Chỉnh sửa hồ sơ</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="posts">Bài đăng của tôi</TabsTrigger>
            <TabsTrigger value="saved">Đã lưu</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-muted-foreground">Họ và tên</p>
                  <p>{user.fullName}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Số điện thoại</p>
                  <p>{user.phoneNumber}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Bài đăng của tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chưa có bài đăng nào</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Bài đăng đã lưu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chưa có bài đăng nào được lưu</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
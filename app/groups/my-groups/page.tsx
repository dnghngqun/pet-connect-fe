'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GroupCard from '@/components/group-card';
import { getMyGroups, Group } from '@/services/groupService';
import authService from '@/services/authService';

export default function MyGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      router.push('/sign-in');
      return;
    }
    loadMyGroups();
  }, []);

  const loadMyGroups = async () => {
    try {
      setLoading(true);
      const response = await getMyGroups(0, 50);
      if (response.success) {
        setGroups(response.data || []);
      }
    } catch (error) {
      console.error('Error loading my groups:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-100">
      
      <div className="bg-gradient-to-r from-primary to-orange-500 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-2">Hội nhóm của tôi</h1>
            <p className="text-lg opacity-90">
              Các nhóm bạn đã tham gia
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {groups.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                Bạn chưa tham gia nhóm nào
              </p>
              <p className="text-muted-foreground mb-6">
                Tìm và tham gia các nhóm để kết nối với cộng đồng
              </p>
              <Button onClick={() => router.push('/groups')}>
                Khám phá nhóm
              </Button>
            </Card>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground">
                  {groups.length} nhóm
                </p>
                <Button onClick={() => router.push('/groups/create')}>
                  Tạo nhóm mới
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

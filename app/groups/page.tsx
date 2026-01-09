'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import GroupCard from '@/components/group-card';
import { getGroups, getPopularGroups, Group } from '@/services/groupService';
import authService from '@/services/authService';
import PageHeader from '@/components/page-header';
import { Users } from 'lucide-react';

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [popularGroups, setPopularGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadGroups();
    loadPopularGroups();
  }, [category, city]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (search || category || city) {
        loadGroups();
      }
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [search]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await getGroups({
        category: category || undefined,
        city: city || undefined,
        search: search || undefined,
        page: 0,
        size: 20,
      });

      if (response.success) {
        setGroups(response.data || []);
        setHasMore((response.data || []).length === 20);
        setPage(0);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPopularGroups = async () => {
    try {
      const response = await getPopularGroups(5);
      if (response.success) {
        setPopularGroups(response.data || []);
      }
    } catch (error) {
      console.error('Error loading popular groups:', error);
    }
  };

  const loadMore = async () => {
    try {
      const nextPage = page + 1;
      const response = await getGroups({
        category: category || undefined,
        city: city || undefined,
        search: search || undefined,
        page: nextPage,
        size: 20,
      });

      if (response.success) {
        setGroups((prev) => [...prev, ...(response.data || [])]);
        setHasMore((response.data || []).length === 20);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more groups:', error);
    }
  };

  const handleCreateGroup = () => {
    if (!currentUser) {
      router.push('/sign-in');
      return;
    }
    router.push('/groups/create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-pink-50 to-white">
      {/* Header */}
      <PageHeader
        title="Hội Nhóm"
        description="Tìm và tham gia các cộng đồng yêu thú cưng gần bạn"
        icon={<Users className="h-8 w-8 text-white" />}
        action={{
          label: '+ Tạo hội nhóm mới',
          onClick: handleCreateGroup,
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-4 sticky top-4 shadow-lg border-orange-100">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Bộ lọc
                </h3>

                {/* Search */}
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">
                    Tìm kiếm
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tên nhóm..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">
                    Danh mục
                  </label>
                  <Select value={category} onValueChange={(val) => setCategory(val === 'ALL' ? '' : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả</SelectItem>
                      <SelectItem value="BREED">Giống</SelectItem>
                      <SelectItem value="LOCATION">Khu vực</SelectItem>
                      <SelectItem value="INTEREST">Sở thích</SelectItem>
                      <SelectItem value="ACTIVITY">Hoạt động</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* City Filter */}
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">
                    Thành phố
                  </label>
                  <Select value={city} onValueChange={(val) => setCity(val === 'ALL' ? '' : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả</SelectItem>
                      <SelectItem value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</SelectItem>
                      <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                      <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                      <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Popular Groups */}
                {popularGroups.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-3">Phổ biến</h3>
                    <div className="space-y-2">
                      {popularGroups.map((group) => (
                        <button
                          key={group.id}
                          onClick={() => router.push(`/groups/${group.slug}`)}
                          className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
                        >
                          <p className="text-sm font-medium line-clamp-1">
                            {group.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {group.memberCount} thành viên
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {loading && groups.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                  <p className="mt-4 text-muted-foreground">Đang tải...</p>
                </div>
              ) : groups.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    Không tìm thấy hội nhóm nào
                  </p>
                  <Button onClick={() => {
                    setSearch('');
                    setCategory('');
                    setCity('');
                  }}>
                    Xóa bộ lọc
                  </Button>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.map((group) => (
                      <GroupCard key={group.id} group={group} />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="text-center mt-6">
                      <Button onClick={loadMore} variant="outline">
                        Xem thêm
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Compass, Filter, Heart, Loader2, MapPin, PawPrint, Sparkles, Store } from 'lucide-react'
import PetPostCard from '@/components/pet-post-card'
import ShopFilters from '@/components/shop-filters'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import petPostService from '@/services/petPostService'

interface PostData {
  id: string
  title: string
  slug: string
  description: string
  image: string
  petType: string
  status: string
  postType?: string
  location: string
  postedBy: {
    id: string
    name: string
    phone: string
    avatar?: string
  }
  createdAt: string
  tags: string[]
  views?: number
  featured?: boolean
}

function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  const status = searchParams.get('status')
  const petType = searchParams.get('petType')
  const location = searchParams.get('location')
  const sort = searchParams.get('sort')
  const postType = searchParams.get('type')

  useEffect(() => {
    setCurrentPage(0)
  }, [status, petType, location, sort, postType])

  useEffect(() => {
    loadPosts()
  }, [status, petType, location, sort, postType, currentPage])

  const loadPosts = async () => {
    try {
      setLoading(true)

      let sortParam = undefined
      if (sort === 'newest') sortParam = 'createdAt,desc'
      else if (sort === 'oldest') sortParam = 'createdAt,asc'
      else if (sort === 'views') sortParam = 'views,desc'

      const response = await petPostService.getPosts({
        status: status ? status.toUpperCase().replace('-', '_') : undefined,
        petType: petType || undefined,
        type: postType || undefined,
        city: location || undefined,
        page: currentPage,
        size: 12,
        sort: sortParam,
      })

      const list = (response.data?.data?.posts || response.data?.data?.content || []) as any[]
      const transformedPosts: PostData[] = list.map((post: any) => ({
        id: String(post.id),
        title: post.title,
        slug: post.slug,
        description: post.description,
        image: post.image || 'https:
        petType: post.petType,
        status: post.status?.toLowerCase().replace('_', '-') || 'general',
        postType: post.postType,
        location: post.location || `${post.district || ''}, ${post.city || ''}`,
        postedBy: {
          id: String(post.postedBy?.id || ''),
          name: post.postedBy?.name || 'Người dùng',
          phone: post.postedBy?.phone || '',
          avatar: post.postedBy?.avatar,
        },
        createdAt: post.createdAt,
        tags: post.tags || [],
        views: post.views,
        featured: post.featured,
      }))

      setPosts(transformedPosts)
      setTotalPages(response.data?.pagination?.totalPages || response.data?.data?.totalPages || 0)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickLinks = [
    { href: '/shop?status=lost', icon: PawPrint, label: 'Thất lạc gần bạn', desc: 'Ưu tiên LOST/FOUND' },
    { href: '/shop?type=REVIEW', icon: Sparkles, label: 'Review dịch vụ', desc: 'Spa/khách sạn/clinic' },
    { href: '/shop?type=TIP', icon: Heart, label: 'Mẹo & chia sẻ', desc: 'Trải nghiệm từ cộng đồng' },
    { href: '/shop?type=MARKETPLACE', icon: Store, label: 'Phụ kiện thú cưng', desc: 'Thanh lý nhẹ nhàng' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-white to-amber-50/60">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-48 w-48 rounded-full bg-orange-300/20 blur-3xl" />
        </div>

        <div className="container px-4 py-8 md:py-12 space-y-6 relative">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between rounded-3xl border bg-white/80 backdrop-blur-xl p-6 md:p-8 shadow-lg shadow-primary/5">
            <div className="space-y-3 max-w-2xl">
              <Badge variant="secondary" className="w-fit gap-1 px-3">
                <Compass className="h-4 w-4 text-primary" />
                Khám phá nhanh
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                Lướt bảng tin, lọc nội dung giống Facebook cho thú cưng
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Tìm bài thất lạc, nhận nuôi, review dịch vụ, hỏi đáp, phối giống hay marketplace.
                Bộ lọc gọn nhẹ giúp bạn đến đúng nội dung trong một cú click.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild>
                  <Link href="/post/new">+ Đăng bài mới</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('#filters')}>
                  <Filter className="h-4 w-4 mr-2" />
                  Mở bộ lọc
                </Button>
                <div className="flex flex-wrap gap-2">
                  {['lost', 'adoption', 'review', 'tip', 'qna', 'breed'].map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-white/60 cursor-pointer"
                      onClick={() => router.push(`/shop?type=${tag.toUpperCase()}`)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:flex relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-300/30 rounded-2xl blur-3xl" />
              <div className="relative rounded-2xl border bg-white/90 px-6 py-5 shadow-md shadow-primary/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    PC
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Bảng tin</p>
                    <p className="font-semibold">PetConnect Social</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Review, mẹo, Q&A</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>Gần bạn & tổ chức cứu hộ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <span>Nhận nuôi & cứu hộ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6 items-start">
            <div id="filters" className="space-y-4 lg:sticky lg:top-20">
              <Card className="bg-white/90 backdrop-blur border-primary/10 shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Bộ lọc nâng cao</p>
                      <p className="font-semibold">Thu gọn như sidebar Facebook</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push('/shop')}>
                      Làm mới
                    </Button>
                  </div>
                  <ShopFilters />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {quickLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="group">
                    <Card className="border border-dashed bg-white/90 hover:border-primary/40 transition-all duration-300">
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold group-hover:text-primary transition-colors">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Bảng tin tìm kiếm</p>
                  <h2 className="text-xl font-semibold">Kết quả phù hợp</h2>
                  <p className="text-sm text-muted-foreground">
                    Hiển thị bài đăng theo filter, đủ cả review, hỏi đáp, marketplace chứ không còn kiểu chợ.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(0)}>
                    Làm mới trang
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/post/new">+ Đăng bài</Link>
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Card key={idx} className="h-[260px] animate-pulse bg-white/80" />
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {posts.map((post) => (
                      <PetPostCard key={post.id} post={post as any} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                      >
                        Trước
                      </Button>
                      <span className="flex items-center px-4 text-sm">
                        Trang {currentPage + 1} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                      >
                        Sau
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card className="bg-white/90 border-dashed">
                  <CardContent className="py-12 text-center space-y-3">
                    <PawPrint className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-lg font-semibold">Chưa có bài đăng phù hợp</p>
                    <p className="text-muted-foreground">Thử đổi tag/loại bài hoặc đăng bài mới cho cộng đồng.</p>
                    <div className="flex justify-center gap-2">
                      <Button asChild>
                        <Link href="/post/new">+ Đăng bài</Link>
                      </Button>
                      <Button variant="outline" onClick={() => router.push('/shop')}>
                        Xóa bộ lọc
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ShopContent />
    </Suspense>
  )
}

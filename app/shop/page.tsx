'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PetPostCard from '@/components/pet-post-card'
import ShopFilters from '@/components/shop-filters'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import petPostService from '@/services/petPostService'

interface PostData {
  id: string
  title: string
  slug: string
  description: string
  image: string
  petType: string
  status: string
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
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  const status = searchParams.get('status')
  const petType = searchParams.get('petType')
  const location = searchParams.get('location')
  const sort = searchParams.get('sort')

  useEffect(() => {
    loadPosts()
  }, [status, petType, location, sort, currentPage])

  const loadPosts = async () => {
    try {
      setLoading(true)
      
      // Build sort parameter
      let sortParam = undefined
      if (sort === 'newest') sortParam = 'createdAt,desc'
      else if (sort === 'oldest') sortParam = 'createdAt,asc'
      else if (sort === 'views') sortParam = 'views,desc'

      const response = await petPostService.getPosts({
        status: status || undefined,
        petType: petType || undefined,
        city: location || undefined,
        page: currentPage,
        size: 12,
        sort: sortParam,
      })

      // Transform API response - using postedBy from backend
      const transformedPosts: PostData[] = (response.data?.content || []).map((post: any) => ({
        id: String(post.id),
        title: post.title,
        slug: post.slug,
        description: post.description,
        image: post.image || 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
        petType: post.petType,
        status: post.status?.toLowerCase().replace('_', '-') || 'lost',
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
      setTotalPages(response.data?.totalPages || 0)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bài đăng thú cưng</h1>
          <p className="text-muted-foreground mt-2">Tìm thú cưng thất lạc, cứu hộ hoặc nhận nuôi</p>
        </div>
        <Button asChild>
          <Link href="/post/new">Đăng bài mới</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <ShopFilters />

        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PetPostCard key={post.id} post={post as any} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    Trước
                  </Button>
                  <span className="flex items-center px-4">
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-semibold mb-2">Không có bài đăng nào</p>
              <p className="text-muted-foreground mb-6">Hãy thử thay đổi bộ lọc hoặc đăng bài mới</p>
              <Button asChild>
                <Link href="/post/new">Đăng bài mới</Link>
              </Button>
            </div>
          )}
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

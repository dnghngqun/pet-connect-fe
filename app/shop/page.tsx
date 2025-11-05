import { Suspense } from "react"
import { petPosts } from "@/lib/pet-posts"
import PetPostCard from "@/components/pet-post-card"
import ShopFilters from "@/components/shop-filters"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ShopPageProps {
  searchParams: {
    status?: string
    petType?: string
    location?: string
    sort?: string
  }
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  // Filter posts based on search params
  let filteredPosts = [...petPosts]

  // Filter by status
  if (searchParams.status) {
    const statuses = searchParams.status.split(',')
    filteredPosts = filteredPosts.filter((post) => statuses.includes(post.status))
  }

  // Filter by pet type
  if (searchParams.petType) {
    filteredPosts = filteredPosts.filter((post) => post.petType.toLowerCase().includes(searchParams.petType!.toLowerCase()))
  }

  // Filter by location
  if (searchParams.location) {
    filteredPosts = filteredPosts.filter((post) => post.location.toLowerCase().includes(searchParams.location!.toLowerCase()))
  }

  // Sort posts
  if (searchParams.sort) {
    switch (searchParams.sort) {
      case "newest":
        filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        filteredPosts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "views":
        filteredPosts.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      default:
        break
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
          <Suspense fallback={<PetPostGridSkeleton />}>
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <PetPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-semibold mb-2">Không có bài đăng nào</p>
                <p className="text-muted-foreground mb-6">Hãy thử thay đổi bộ lọc hoặc đăng bài mới</p>
                <Button asChild>
                  <Link href="/post/new">Đăng bài mới</Link>
                </Button>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function PetPostGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-60 w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
    </div>
  )
}

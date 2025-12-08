import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { petPosts } from '@/lib/pet-posts';
import PetDetailClient from '@/components/pet-detail-client';

interface PetDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return petPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PetDetailPage({ params }: PetDetailPageProps) {
  const { slug } = await params;
  const post = petPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="container px-4 py-12 text-center">
        <p className="text-lg font-semibold mb-4">Bài đăng không tìm thấy</p>
        <Button asChild>
          <Link href="/shop">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  const statusConfig = {
    lost: { label: 'Thất lạc', color: 'bg-red-500' },
    found: { label: 'Tìm thấy', color: 'bg-blue-500' },
    'for-adoption': { label: 'Cần nhà', color: 'bg-green-500' },
    rescue: { label: 'Cứu hộ', color: 'bg-orange-500' },
  };

  return <PetDetailClient post={post} statusConfig={statusConfig} />;
}


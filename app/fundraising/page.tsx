'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fundraisingCampaigns } from '@/lib/fundraising'
import { Heart, TrendingUp } from 'lucide-react'

export default function FundraisingPage() {
  const activeCampaigns = fundraisingCampaigns.filter((c) => c.status === 'active')
  const completedCampaigns = fundraisingCampaigns.filter((c) => c.status === 'completed')
  const totalRaised = fundraisingCampaigns.reduce((sum, c) => sum + c.currentAmount, 0)

  const categoryLabels: Record<string, string> = {
    medical: '🏥 Y tế',
    rescue: '🆘 Cứu hộ',
    shelter: '🏠 Nơi trú ẩn',
    food: '🍖 Thức ăn',
    other: '📌 Khác',
  }

  const categoryColors: Record<string, string> = {
    medical: 'bg-red-100 text-red-800',
    rescue: 'bg-orange-100 text-orange-800',
    shelter: 'bg-blue-100 text-blue-800',
    food: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Gây quỹ & Quyên góp</h1>
            <p className="text-muted-foreground text-lg">
              Hãy cùng chúng tôi giúp đỡ các thú cưng cần sự giúp đỡ
            </p>
          </div>
          <Button asChild size="lg" className="w-full md:w-auto">
            <Link href="/fundraising/create">Tạo chiến dịch</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {totalRaised.toLocaleString('vi-VN')}₫
                </div>
                <p className="text-muted-foreground mt-2">Tổng số tiền quyên góp</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {activeCampaigns.length}
                </div>
                <p className="text-muted-foreground mt-2">Chiến dịch đang hoạt động</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {completedCampaigns.length}
                </div>
                <p className="text-muted-foreground mt-2">Chiến dịch hoàn thành</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Chiến dịch đang hoạt động</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCampaigns.map((campaign) => {
            const progress = (campaign.currentAmount / campaign.targetAmount) * 100
            return (
              <Card
                key={campaign.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <Image
                    src={campaign.image}
                    alt={campaign.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className={categoryColors[campaign.category]}>
                      {categoryLabels[campaign.category]}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                    {campaign.title}
                  </h3>

                  {campaign.relatedPet && (
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-muted-foreground">
                        Giúp {campaign.relatedPet.name}
                      </span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-pink-500 transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{campaign.currentAmount.toLocaleString('vi-VN')}₫</span>
                      <span>{campaign.targetAmount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground mb-4">
                    {progress.toFixed(0)}% đạt được
                  </div>

                  {/* Button */}
                  <Button asChild className="w-full">
                    <Link href={`/fundraising/${campaign.slug}`}>Xem chi tiết & Góp</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Completed Campaigns */}
      {completedCampaigns.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-6">Chiến dịch hoàn thành</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedCampaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="overflow-hidden opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="relative h-40 overflow-hidden bg-gray-200">
                  <Image
                    src={campaign.image}
                    alt={campaign.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Badge className="text-lg">✓ Hoàn thành</Badge>
                  </div>
                </div>

                <CardContent className="pt-4">
                  <h3 className="font-semibold line-clamp-2 mb-2">
                    {campaign.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Đã quyên góp {campaign.currentAmount.toLocaleString('vi-VN')}₫
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/fundraising/${campaign.slug}`}>Xem chi tiết</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


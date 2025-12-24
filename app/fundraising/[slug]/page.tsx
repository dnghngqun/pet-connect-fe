'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Heart, Share2, ArrowLeft, User, QrCode, Loader2 } from 'lucide-react'
import PetQRImage from '@/components/pet-qr-image'
import fundraisingService, { CampaignDetail, DonationItem } from '@/services/fundraisingService'
import { use } from 'react'

interface FundraisingDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function FundraisingDetailPage({ params }: FundraisingDetailPageProps) {
  const resolvedParams = use(params)
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
  const [donations, setDonations] = useState<DonationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [donationAmount, setDonationAmount] = useState('')
  const [donationMessage, setDonationMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [donating, setDonating] = useState(false)

  useEffect(() => {
    loadCampaign()
  }, [resolvedParams.slug])

  const loadCampaign = async () => {
    try {
      setLoading(true)
      const response = await fundraisingService.getCampaignDetail(resolvedParams.slug)
      setCampaign(response.data)
      
      // Load donations
      if (response.data?.id) {
        const donationsResponse = await fundraisingService.getCampaignDonations(response.data.id)
        setDonations(donationsResponse.data?.content || [])
      }
    } catch (error) {
      console.error('Failed to load campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDonate = async (paymentMethod: 'MOMO' | 'ZALOPAY' | 'BANK' | 'CARD') => {
    if (!donationAmount || parseFloat(donationAmount) <= 0 || !campaign) {
      alert('Vui lòng nhập số tiền hợp lệ')
      return
    }
    try {
      setDonating(true)
      await fundraisingService.donate(campaign.id, {
        amount: parseFloat(donationAmount),
        message: donationMessage || undefined,
        isAnonymous,
        paymentMethod,
      })
      alert('Cảm ơn bạn đã đóng góp!')
      setDonationAmount('')
      setDonationMessage('')
      loadCampaign() // Reload to update amounts
    } catch (error) {
      console.error('Donation failed:', error)
      alert('Có lỗi xảy ra khi đóng góp. Vui lòng thử lại.')
    } finally {
      setDonating(false)
    }
  }

  if (loading) {
    return (
      <div className="container px-4 py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container px-4 py-12 text-center">
        <p className="text-lg font-semibold mb-4">Chiến dịch không tìm thấy</p>
        <Button asChild>
          <Link href="/fundraising">Quay lại danh sách</Link>
        </Button>
      </div>
    )
  }

  const progress = (campaign.currentAmount / campaign.targetAmount) * 100

  const categoryLabels: Record<string, string> = {
    MEDICAL: '🏥 Y tế',
    RESCUE: '🆘 Cứu hộ',
    SHELTER: '🏠 Nơi trú ẩn',
    FOOD: '🍖 Thức ăn',
    OTHER: '📌 Khác',
    medical: '🏥 Y tế',
    rescue: '🆘 Cứu hộ',
    shelter: '🏠 Nơi trú ẩn',
    food: '🍖 Thức ăn',
    other: '📌 Khác',
  }

  const categoryColors: Record<string, string> = {
    MEDICAL: 'bg-red-100 text-red-800',
    RESCUE: 'bg-orange-100 text-orange-800',
    SHELTER: 'bg-blue-100 text-blue-800',
    FOOD: 'bg-green-100 text-green-800',
    OTHER: 'bg-gray-100 text-gray-800',
    medical: 'bg-red-100 text-red-800',
    rescue: 'bg-orange-100 text-orange-800',
    shelter: 'bg-blue-100 text-blue-800',
    food: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="container px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/fundraising">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image & Header */}
          <div className="space-y-4">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src={campaign.image || '/placeholder.jpg'}
                alt={campaign.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {campaign.title}
                  </h1>
                  <Badge className={categoryColors[campaign.category] || 'bg-gray-100 text-gray-800'}>
                    {categoryLabels[campaign.category] || campaign.category}
                  </Badge>
                </div>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Creator Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  {campaign.createdBy.avatarUrl ? (
                    <Image
                      src={campaign.createdBy.avatarUrl}
                      alt={campaign.createdBy.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{campaign.createdBy.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Tạo vào {new Date(campaign.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base leading-relaxed">
                {campaign.descriptionDetailed || campaign.description}
              </p>
              {campaign.beneficiary && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Tổ chức hưởng lợi
                  </p>
                  <p className="font-semibold">{campaign.beneficiary}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Updates */}
          {campaign.updates && campaign.updates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cập nhật chiến dịch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {campaign.updates.map((update) => (
                  <div key={update.id} className="border-b last:border-0 pb-6 last:pb-0">
                    <h3 className="font-semibold mb-2">{update.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(update.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="mb-3">{update.content}</p>
                    {update.images && update.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {update.images.map((image, idx) => (
                          <div key={idx} className="relative h-32 rounded-lg overflow-hidden">
                            <Image
                              src={image}
                              alt={`Update image ${idx}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Donation Wall */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Những người đã đóng góp ({donations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {donations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có ai đóng góp. Hãy là người đầu tiên!
                </p>
              ) : (
                donations.map((donation) => (
                  <div key={donation.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">
                        {donation.isAnonymous ? 'Ẩn danh' : (donation.donor?.name || 'Nhà tài trợ')}
                      </span>
                      <span className="text-primary font-bold">
                        +{donation.amount.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                    {donation.message && (
                      <p className="text-sm text-muted-foreground italic">
                        "{donation.message}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Donation Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent sticky top-4">
            <CardHeader>
              <CardTitle className="text-xl">Quyên góp ngay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-pink-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold">
                    {campaign.currentAmount.toLocaleString('vi-VN')}₫
                  </span>
                  <span className="text-muted-foreground">
                    {campaign.targetAmount.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <p className="text-sm font-semibold text-primary">
                  {progress.toFixed(0)}% đạt được
                </p>
              </div>

              <div className="border-t pt-4 space-y-3">
                <label className="text-sm font-semibold block">Số tiền (VND)</label>
                <Input
                  type="number"
                  placeholder="Nhập số tiền"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  min="1000"
                  step="10000"
                />

                <div className="text-sm">
                  <p className="font-semibold mb-2">Gợi ý:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[50000, 100000, 500000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setDonationAmount(amount.toString())}
                      >
                        {(amount / 1000).toFixed(0)}K
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <label className="text-sm font-semibold block">Lời nhắn (tùy chọn)</label>
                <Textarea
                  placeholder="Gửi lời cảm thương của bạn..."
                  value={donationMessage}
                  onChange={(e) => setDonationMessage(e.target.value)}
                  rows={3}
                />

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded"
                  />
                  <span>Ẩn danh</span>
                </label>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!donationAmount || parseFloat(donationAmount) <= 0 || donating}
                  >
                    {donating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Heart className="h-4 w-4 mr-2" />}
                    Góp {donationAmount ? `${parseInt(donationAmount).toLocaleString('vi-VN')}₫` : '...'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Chọn phương thức thanh toán</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    {[
                      { id: 'MOMO' as const, name: 'Momo', icon: '📱' },
                      { id: 'ZALOPAY' as const, name: 'ZaloPay', icon: '📲' },
                      { id: 'BANK' as const, name: 'Chuyển khoản', icon: '🏦' },
                      { id: 'CARD' as const, name: 'Thẻ tín dụng', icon: '💳' },
                    ].map((method) => (
                      <Button
                        key={method.id}
                        variant="outline"
                        className="w-full justify-start text-lg h-12"
                        onClick={() => handleDonate(method.id)}
                        disabled={donating}
                      >
                        <span className="mr-3 text-2xl">{method.icon}</span>
                        {method.name}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Campaign Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin chiến dịch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Trạng thái</p>
                <Badge className={campaign.status === 'ACTIVE' || campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {campaign.status === 'ACTIVE' || campaign.status === 'active' ? '🟢 Đang hoạt động' : '⚪ Đã kết thúc'}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Ngày bắt đầu</p>
                <p className="font-semibold">
                  {new Date(campaign.startDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              {campaign.endDate && (
                <div>
                  <p className="text-muted-foreground">Ngày kết thúc</p>
                  <p className="font-semibold">
                    {new Date(campaign.endDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Pet */}
          {campaign.relatedPet && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Thú cưng liên quan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.relatedPet.image && (
                  <div className="relative h-32 rounded-lg overflow-hidden">
                    <Image
                      src={campaign.relatedPet.image}
                      alt={campaign.relatedPet.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="font-semibold text-lg">{campaign.relatedPet.name}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

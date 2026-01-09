'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getUserLocation, calculateDistance } from '@/lib/location-utils'
import { Star, MapPin, Phone, Globe, Clock, AlertCircle, Loader2 } from 'lucide-react'
import MapComponent from '@/components/map-component'
import rescueCenterService, { RescueCenterListItem } from '@/services/rescueCenterService'

export default function RescueCentersPage() {
  const [centers, setCenters] = useState<RescueCenterListItem[]>([])
  const [nearestCenter, setNearestCenter] = useState<RescueCenterListItem | null>(null)
  const [userLocation, setUserLocation] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const location = await getUserLocation()
      setUserLocation(location)
      const response = await rescueCenterService.getRescueCenters({
        latitude: location.latitude,
        longitude: location.longitude,
        size: 100,
      })

      const centersData = response.data?.content || []
      setCenters(centersData)
      if (centersData.length > 0) {
        setNearestCenter(centersData[0])
      }
    } catch (err: any) {
      setError(err.message || 'Không thể lấy vị trí của bạn')

      try {
        const response = await rescueCenterService.getRescueCenters({ size: 100 })
        setCenters(response.data?.content || [])
      } catch {

      }
    } finally {
      setLoading(false)
    }
  }
  const sortedCenters = [...centers].sort((a, b) => {
    if (sortBy === 'distance') {
      return (a.distance || 999) - (b.distance || 999)
    }
    return (b.rating || 0) - (a.rating || 0)
  })

  if (loading) {
    return (
      <div className="container px-4 py-8 md:py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 py-8 md:py-12">
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Trung Tâm Cứu Hộ & Tiếp Nhận</h1>
          <p className="text-muted-foreground text-lg">
            Tìm các trung tâm cứu hộ, nơi tiếp nhận thú cưng ở gần bạn
          </p>
        </div>

        
        {error && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900">Lưu ý</h3>
                  <p className="text-sm text-amber-700 mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        
        {nearestCenter && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">🎯 Trung tâm cứu hộ gần nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{nearestCenter.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{nearestCenter.location.address}</span>
                    </div>
                    {nearestCenter.distance && (
                      <div className="inline-block">
                        <Badge className="bg-green-600">
                          📍 {nearestCenter.distance.toFixed(1)} km
                        </Badge>
                      </div>
                    )}
                    {nearestCenter.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(nearestCenter.rating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold">{nearestCenter.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button asChild variant="default">
                    <a href={`tel:${nearestCenter.phone}`}>📞 Gọi</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a
                      href={`https:
                        nearestCenter.name
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🗺️
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        
        <div className="mb-8 flex gap-2">
          <Button
            variant={sortBy === 'distance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('distance')}
          >
            Sắp xếp theo khoảng cách
          </Button>
          <Button
            variant={sortBy === 'rating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('rating')}
          >
            Sắp xếp theo đánh giá
          </Button>
        </div>

        
        {sortedCenters.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Không tìm thấy trung tâm cứu hộ nào
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {sortedCenters.map((center) => (
              <Card key={center.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">{center.name}</CardTitle>
                    {center.distance && (
                      <Badge variant="secondary" className="flex-shrink-0">
                        {center.distance.toFixed(1)} km
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {center.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(center.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-sm">{center.rating}</span>
                      <span className="text-xs text-muted-foreground">
                        ({center.reviewCount} đánh giá)
                      </span>
                    </div>
                  )}

                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0 mt-1" />
                      <p className="text-sm">{center.location.address}</p>
                    </div>
                  </div>

                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a
                        href={`tel:${center.phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {center.phone}
                      </a>
                    </div>

                    {center.hours && (
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">{center.hours}</p>
                      </div>
                    )}

                    {center.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <a
                          href={`https:
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate"
                        >
                          {center.website}
                        </a>
                      </div>
                    )}
                  </div>

                  
                  {center.specialties && center.specialties.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Chuyên môn
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {center.specialties.map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec === 'dog' || spec === 'DOG'
                              ? '🐕 Chó'
                              : spec === 'cat' || spec === 'CAT'
                                ? '🐱 Mèo'
                                : spec === 'bird' || spec === 'BIRD'
                                  ? '🦜 Chim'
                                  : '🐰 ' + spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <a href={`tel:${center.phone}`}>📞</a>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <a
                        href={`https:
                          center.name
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🗺️ Chỉ đường
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        
        {userLocation && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Bản đồ tất cả trung tâm cứu hộ</CardTitle>
            </CardHeader>
            <CardContent>
              <MapComponent
                userLocation={userLocation}
                rescueCenters={centers.map(c => ({
                  id: String(c.id),
                  name: c.name,
                  location: c.location,
                  phone: c.phone,
                  email: c.email ?? undefined,
                  website: c.website ?? undefined,
                  hours: c.hours ?? undefined,
                  specialties: c.specialties,
                  distance: c.distance ?? undefined,
                  rating: c.rating ?? undefined,
                  reviewCount: c.reviewCount,
                }))}
                height="600px"
              />
            </CardContent>
          </Card>
        )}

        
        <Card>
          <CardHeader>
            <CardTitle>Thông tin thêm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">❓ Làm sao để tìm trung tâm cứu hộ gần nhất?</h3>
              <p className="text-sm text-muted-foreground">
                Bật quyền định vị để chúng tôi hiển thị các trung tâm cứu hộ gần nhất với vị trí hiện tại
                của bạn. Danh sách sẽ tự động sắp xếp theo khoảng cách.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📞 Liên hệ trực tiếp</h3>
              <p className="text-sm text-muted-foreground">
                Nhấp vào số điện thoại để gọi trực tiếp hoặc sử dụng nút "Chỉ đường" để xem đường đi trên
                Google Maps.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">⭐ Đánh giá</h3>
              <p className="text-sm text-muted-foreground">
                Đánh giá sao giúp bạn lựa chọn trung tâm có chất lượng dịch vụ tốt nhất.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

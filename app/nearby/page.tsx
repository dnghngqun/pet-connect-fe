
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import NearbyPets from '@/components/nearby-pets'
import NearbyRescueCenters from '@/components/nearby-rescue-centers'
import MapComponent from '@/components/map-component'
import { petPosts } from '@/lib/pet-posts'
import { rescueCenters } from '@/lib/rescue-centers'
import { getUserLocation } from '@/lib/location-utils'
import { Button } from '@/components/ui/button'
import { MapPin, AlertCircle } from 'lucide-react'

export default function NearbyPage() {
  const [userLocation, setUserLocation] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleEnableLocation = async () => {
    try {
      const location = await getUserLocation()
      setUserLocation(location)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Không thể lấy vị trí của bạn')
    }
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Khám phá gần bạn</h1>
        <p className="text-muted-foreground text-lg">
          Tìm thú cưng, trung tâm cứu hộ và cơ sở tiếp nhận gần vị trí của bạn
        </p>
      </div>

      {/* Enable Location Button */}
      {!userLocation && (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900">
                    Bật quyền định vị để tìm kiếm gần bạn
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Chúng tôi sẽ sử dụng vị trí của bạn để hiển thị thú cưng, trung tâm cứu hộ và
                    cơ sở tiếp nhận gần nhất.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleEnableLocation}
                className="whitespace-nowrap"
              >
                Bật định vị
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900">
                  Không thể lấy vị trí của bạn
                </h3>
                <p className="text-sm text-amber-700 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="nearby-pets" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="nearby-pets">Thú cưng gần bạn</TabsTrigger>
          <TabsTrigger value="rescue-centers">Trung tâm cứu hộ</TabsTrigger>
          <TabsTrigger value="map">Bản đồ</TabsTrigger>
        </TabsList>

        {/* Nearby Pets Tab */}
        <TabsContent value="nearby-pets">
          <NearbyPets
            pets={petPosts}
            userLocation={userLocation}
            radiusKm={10}
            maxResults={10}
          />
        </TabsContent>

        {/* Rescue Centers Tab */}
        <TabsContent value="rescue-centers">
          <NearbyRescueCenters
            userLocation={userLocation}
            radiusKm={15}
            limit={10}
          />
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Bản đồ tương tác</CardTitle>
            </CardHeader>
            <CardContent>
              <MapComponent
                userLocation={userLocation}
                rescueCenters={rescueCenters}
                pets={petPosts.filter((p) => p.location)}
                height="600px"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cách sử dụng tính năng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-1">📍 Thú cưng gần bạn</h4>
              <p className="text-muted-foreground">
                Xem danh sách tất cả các bài đăng thú cưng trong vòng bán kính từ vị trí hiện tại của bạn.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">🏥 Trung tâm cứu hộ</h4>
              <p className="text-muted-foreground">
                Tìm các trung tâm cứu hộ, nơi nhận nuôi thú cưng gần nhất với các thông tin liên hệ.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">🗺️ Bản đồ</h4>
              <p className="text-muted-foreground">
                Xem toàn bộ vị trí trên bản đồ tương tác để dễ dàng định vị và tìm đường.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quyền riêng tư</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-1">🔒 Bảo vệ dữ liệu</h4>
              <p className="text-muted-foreground">
                Vị trí của bạn chỉ được lưu trên thiết bị của bạn, không được gửi lên máy chủ.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">🚫 Kiểm soát quyền</h4>
              <p className="text-muted-foreground">
                Bạn có thể bật/tắt quyền định vị bất cứ lúc nào trong cài đặt trình duyệt.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">📊 Công khai</h4>
              <p className="text-muted-foreground">
                Chúng tôi không chia sẻ vị trí của bạn với bất kỳ ai hoặc bất kỳ bên thứ ba nào.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


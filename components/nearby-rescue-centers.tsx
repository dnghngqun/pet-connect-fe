'use client'

import { useMemo } from 'react'
import { findNearbyRescueCenters } from '@/lib/rescue-centers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Globe } from 'lucide-react'

interface Coordinates {
  latitude: number
  longitude: number
}

interface RescueCenter {
  id: string
  name: string
  location: {
    address?: string
    latitude: number
    longitude: number
  }
  phone?: string
  website?: string
  specialties?: string[]
  distance?: number
  rating?: number
  reviewCount?: number
}

interface NearbyRescueCentersProps {
  userLocation?: Coordinates | null
  radiusKm?: number
  limit?: number
  isLoading?: boolean
  rescueCentersData?: RescueCenter[]
}

export default function NearbyRescueCenters({
  userLocation,
  radiusKm = 10,
  limit = 5,
  isLoading = false,
  rescueCentersData,
}: NearbyRescueCentersProps) {

  const centers = useMemo(() => {

    if (rescueCentersData && rescueCentersData.length > 0) {
      return rescueCentersData.slice(0, limit)
    }

    if (!userLocation) return []
    return findNearbyRescueCenters(
      userLocation.latitude,
      userLocation.longitude,
      radiusKm,
      limit
    )
  }, [userLocation, radiusKm, limit, rescueCentersData])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trung tâm cứu hộ gần bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Đang tìm trung tâm cứu hộ gần bạn...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userLocation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trung tâm cứu hộ gần bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Vui lòng bật định vị để xem trung tâm cứu hộ gần bạn
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Trung tâm cứu hộ gần bạn</span>
          <Badge variant="secondary">{centers.length} trung tâm</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {centers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Không có trung tâm cứu hộ nào gần bạn trong vòng {radiusKm}km
          </div>
        ) : (
          <div className="space-y-4">
            {centers.map((center: any) => (
              <div
                key={center.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="font-semibold text-lg mb-3">{center.name}</h3>

                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{center.distance?.toFixed(1) || '?'} km</span>
                  </div>

                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {center.location?.address || 'Chưa có địa chỉ'}
                  </p>

                  
                  <div className="space-y-2 mb-3">
                    {center.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <a
                          href={`tel:${center.phone}`}
                          className="text-primary hover:underline"
                        >
                          {center.phone}
                        </a>
                      </div>
                    )}
                    {center.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-primary" />
                        <a
                          href={center.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Trang web
                        </a>
                      </div>
                    )}
                  </div>

                  
                  {center.specialties && center.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {center.specialties.map((specialty: string) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

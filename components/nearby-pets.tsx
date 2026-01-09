'use client'

import { useMemo } from 'react'
import {
  filterNearbyPets,
  calculateDistance,
} from '@/lib/location-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Coordinates {
  latitude: number
  longitude: number
}

interface NearbyPetsProps {
  pets: any[]
  userLocation?: Coordinates | null
  radiusKm?: number
  maxResults?: number
  isLoading?: boolean
}
function getTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Vừa xong'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`
  return `${Math.floor(seconds / 86400)} ngày trước`
}

export default function NearbyPets({
  pets,
  userLocation,
  radiusKm = 5,
  maxResults = 5,
  isLoading = false,
}: NearbyPetsProps) {

  const nearbyPets = useMemo(() => {
    if (!userLocation || pets.length === 0) return []

    const petsWithCoords = pets.filter((p) => p.locationCoords)
    const filtered = filterNearbyPets(petsWithCoords, userLocation, radiusKm)
    const withDistance = filtered.map((pet) => ({
      ...pet,
      distance: calculateDistance(userLocation, {
        latitude: pet.locationCoords?.latitude || 10.7769,
        longitude: pet.locationCoords?.longitude || 106.7009,
      }),
    }))
    return withDistance.slice(0, maxResults)
  }, [userLocation, pets, radiusKm, maxResults])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thú cưng gần bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Đang tìm thú cưng gần bạn...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userLocation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thú cưng gần bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Vui lòng bật định vị để xem thú cưng gần bạn
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Thú cưng gần bạn</span>
          <Badge variant="secondary">{nearbyPets.length} thú cưng</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {nearbyPets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Không có thú cưng nào gần bạn trong vòng {radiusKm}km
          </div>
        ) : (
          <div className="space-y-4">
            {nearbyPets.map((pet) => (
              <div
                key={pet.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {pet.image && (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={pet.image}
                        alt={pet.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{pet.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {pet.petType}
                        </p>
                      </div>
                      <Badge
                        variant={
                          pet.status === 'lost' ? 'destructive' : 'default'
                        }
                      >
                        {pet.status === 'lost'
                          ? '❌ Thất lạc'
                          : pet.status === 'found'
                            ? '✅ Tìm thấy'
                            : '🏠 Cần nhà'}
                      </Badge>
                    </div>

                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {pet.distance?.toFixed(1) || '?'} km - {pet.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{getTimeAgo(pet.createdAt)}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="w-full"
                      >
                        <Link href={`/pet/${pet.slug}`}>Xem chi tiết</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

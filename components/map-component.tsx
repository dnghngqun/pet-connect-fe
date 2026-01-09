'use client'

import { useEffect, useRef, useState } from 'react'
import { RescueCenter } from '@/lib/types'

interface MapProps {
  userLocation?: { latitude: number; longitude: number }
  rescueCenters?: RescueCenter[]
  pets?: any[]
  height?: string
  onLocationChange?: (coords: { latitude: number; longitude: number }) => void
}

const MapComponent = ({
  userLocation,
  rescueCenters = [],
  pets = [],
  height = '400px',
  onLocationChange,
}: MapProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !containerRef.current) return
    const initMap = async () => {
      const L = (await import('leaflet')).default
      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current!).setView(
          [
            userLocation?.latitude || 10.7769,
            userLocation?.longitude || 106.7009,
          ],
          13
        )

        L.tileLayer('https:
          attribution:
            '&copy; <a href="https:
          maxZoom: 19,
        }).addTo(mapRef.current)
      }
      if (userLocation && mapRef.current) {
        L.circleMarker(
          [userLocation.latitude, userLocation.longitude],
          {
            radius: 8,
            fillColor: '#4f46e5',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }
        )
          .addTo(mapRef.current)
          .bindPopup('Vị trí hiện tại của bạn')
      }
      rescueCenters.forEach((center) => {
        if (!mapRef.current) return

        const marker = L.marker([
          center.location.latitude,
          center.location.longitude,
        ])
          .addTo(mapRef.current)
          .bindPopup(
            `
            <div class="text-sm">
              <strong>${center.name}</strong><br/>
              <span class="text-xs">${center.location.address}</span><br/>
              <span class="text-xs">📞 ${center.phone}</span><br/>
              <span class="text-xs">⭐ ${center.rating || 'N/A'}</span>
            </div>
          `
          )
        marker.setIcon(
          L.icon({
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNi41OS02LjU5TDE4IDE5eiIgZmlsbD0iIzRmNDZlNSIvPjwvc3ZnPg==',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          })
        )
      })
      pets.forEach((pet) => {
        if (!mapRef.current || !pet.locationCoords) return

        const petIcon = pet.status === 'lost' ? '🔴' : '🟢'

        L.marker([
          pet.locationCoords.latitude,
          pet.locationCoords.longitude,
        ])
          .addTo(mapRef.current)
          .bindPopup(
            `
            <div class="text-sm">
              <strong>${petIcon} ${pet.title}</strong><br/>
              <span class="text-xs">${pet.location}</span><br/>
              <span class="text-xs">Trạng thái: ${
                pet.status === 'lost'
                  ? '❌ Thất lạc'
                  : pet.status === 'found'
                    ? '✅ Tìm thấy'
                    : '🏠 Cần nhà'
              }</span>
            </div>
          `
          )
      })
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isClient, userLocation, rescueCenters, pets])

  if (!isClient) {
    return (
      <div 
        style={{ height, borderRadius: '8px' }} 
        className="bg-muted flex items-center justify-center"
      >
        <span className="text-muted-foreground">Đang tải bản đồ...</span>
      </div>
    )
  }

  return <div ref={containerRef} style={{ height, borderRadius: '8px' }} />
}

export default MapComponent

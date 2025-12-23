'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
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
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Khởi tạo bản đồ
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView(
        [
          userLocation?.latitude || 10.7769,
          userLocation?.longitude || 106.7009,
        ],
        13
      )

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)
    }

    // Thêm marker cho vị trí người dùng
    if (userLocation && mapRef.current) {
      const userMarker = L.circleMarker(
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

    // Thêm markers cho rescue centers
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

      // Thay đổi icon cho rescue centers
      marker.setIcon(
        L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNi41OS02LjU5TDE4IDE5eiIgZmlsbD0iIzRmNDZlNSIvPjwvc3ZnPg==',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })
      )
    })

    // Thêm markers cho pets
    pets.forEach((pet) => {
      if (!mapRef.current || !pet.locationCoords) return

      const petIcon = pet.status === 'lost' ? '🔴' : '🟢'

      const marker = L.marker([
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

    return () => {
      // Cleanup
    }
  }, [userLocation, rescueCenters, pets])

  return <div ref={containerRef} style={{ height, borderRadius: '8px' }} />
}

export default MapComponent


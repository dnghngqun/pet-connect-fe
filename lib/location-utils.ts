/**
 * Utility functions for location-based features
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Tính khoảng cách giữa 2 điểm theo công thức Haversine
 * @returns khoảng cách tính bằng km
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371 // Bán kính Trái Đất (km)
  const dLat = toRad(coord2.latitude - coord1.latitude)
  const dLon = toRad(coord2.longitude - coord1.longitude)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Lấy vị trí hiện tại của người dùng
 */
export async function getUserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation không được hỗ trợ'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Chuyển đổi tọa độ GPS thành địa chỉ (Reverse Geocoding)
 * Sử dụng Nominatim API (OpenStreetMap) - miễn phí
 */
export async function getAddressFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'Accept-Language': 'vi-VN',
        },
      }
    )
    const data = await response.json()
    return data.address?.road || data.address?.city || 'Địa chỉ không xác định'
  } catch (error) {
    console.error('Lỗi reverse geocoding:', error)
    return 'Địa chỉ không xác định'
  }
}

/**
 * Lọc danh sách pets gần người dùng
 */
export function filterNearbyPets(
  pets: any[],
  userLocation: Coordinates,
  radiusKm: number = 5
): any[] {
  return pets.filter((pet) => {
    if (!pet.locationCoords) return false
    const distance = calculateDistance(userLocation, {
      latitude: pet.locationCoords.latitude,
      longitude: pet.locationCoords.longitude,
    })
    return distance <= radiusKm
  })
}

/**
 * Tính thời gian cập nhật
 */
export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'vừa xong'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} ngày trước`
  return `${Math.floor(seconds / 2592000)} tháng trước`
}


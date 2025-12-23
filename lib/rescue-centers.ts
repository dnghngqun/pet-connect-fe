import { RescueCenter } from '@/lib/types'

export const rescueCenters: RescueCenter[] = [
  {
    id: 'rc-1',
    name: 'Trung Tâm Cứu Hộ Động Vật HCM',
    location: {
      latitude: 10.7769,
      longitude: 106.7009,
      address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
      district: 'Quận 1',
      city: 'TP.HCM',
    },
    phone: '0283456789',
    email: 'contact@rescuehcm.org',
    website: 'www.rescuehcm.org',
    hours: '7:00 - 19:00 (Thứ 2 - Chủ nhật)',
    specialties: ['dog', 'cat', 'bird'],
    rating: 4.8,
    reviewCount: 156,
  },
  {
    id: 'rc-2',
    name: 'Trạm Cứu Hộ Chó Mèo Quận 3',
    location: {
      latitude: 10.7922,
      longitude: 106.6867,
      address: '456 Đường Phan Xích Long, Quận 3, TP.HCM',
      district: 'Quận 3',
      city: 'TP.HCM',
    },
    phone: '0287654321',
    email: 'info@rescueq3.vn',
    website: 'www.rescueq3.vn',
    hours: '8:00 - 18:00 (Thứ 2 - Thứ 6)',
    specialties: ['dog', 'cat'],
    rating: 4.6,
    reviewCount: 89,
  },
  {
    id: 'rc-3',
    name: 'Nơi Trú Ẩn Động Vật Tình Nguyện',
    location: {
      latitude: 10.8256,
      longitude: 106.7331,
      address: '789 Đường Trần Xuyên, Quận 7, TP.HCM',
      district: 'Quận 7',
      city: 'TP.HCM',
    },
    phone: '0285556666',
    email: 'volunteer@petshome.vn',
    website: 'www.petshome.vn',
    hours: '9:00 - 17:00 (Hàng ngày)',
    specialties: ['dog', 'cat', 'bird', 'rabbit'],
    rating: 4.7,
    reviewCount: 234,
  },
  {
    id: 'rc-4',
    name: 'Viện Bảo Vệ Động Vật Bình Tân',
    location: {
      latitude: 10.7519,
      longitude: 106.6211,
      address: '321 Đường Phạm Văn Chiêu, Quận Bình Tân, TP.HCM',
      district: 'Bình Tân',
      city: 'TP.HCM',
    },
    phone: '0281112222',
    email: 'contact@binhtan-rescue.vn',
    hours: '8:00 - 17:00 (Thứ 2 - Thứ 7)',
    specialties: ['dog', 'cat'],
    rating: 4.5,
    reviewCount: 124,
  },
  {
    id: 'rc-5',
    name: 'Tổ Chức Yêu Thương Thú Cưng',
    location: {
      latitude: 10.7611,
      longitude: 106.7468,
      address: '654 Đường Cách Mạng Tháng 8, Quận 3, TP.HCM',
      district: 'Quận 3',
      city: 'TP.HCM',
    },
    phone: '0289999999',
    email: 'help@petlovevn.org',
    website: 'www.petlovevn.org',
    hours: '10:00 - 19:00 (Hàng ngày)',
    specialties: ['dog', 'cat'],
    rating: 4.9,
    reviewCount: 312,
  },
]

/**
 * Tìm các trạm cứu hộ gần nhất
 */
export function findNearbyRescueCenters(
  userLat: number,
  userLon: number,
  radiusKm: number = 10,
  limit: number = 5
): RescueCenter[] {
  const { calculateDistance } = require('@/lib/location-utils')

  const centersWithDistance = rescueCenters.map((center) => ({
    ...center,
    distance: calculateDistance(
      { latitude: userLat, longitude: userLon },
      {
        latitude: center.location.latitude,
        longitude: center.location.longitude,
      }
    ),
  }))

  return centersWithDistance
    .filter((center) => center.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
}


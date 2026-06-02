import { requestLocationPermission } from './permission'

export interface LocationResult {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  address?: string
}

/**
 * 获取当前GPS位置
 * @returns 位置信息
 */
export async function getCurrentLocation(): Promise<LocationResult> {
  const granted = await requestLocationPermission()
  if (!granted) {
    throw new Error('未获得定位权限')
  }

  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      altitude: true,
      geocode: true,
      success: (res) => {
        const result: LocationResult = {
          latitude: res.latitude,
          longitude: res.longitude,
          accuracy: res.accuracy,
          altitude: res.altitude
        }
        // 部分平台支持地址信息
        if ((res as any).address) {
          result.address = JSON.stringify((res as any).address)
        }
        resolve(result)
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '定位失败'))
      }
    })
  })
}

/**
 * 使用 Haversine 公式计算两点之间的距离
 * @returns 距离（单位：米）
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // 地球半径（米）
  const toRad = (deg: number): number => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

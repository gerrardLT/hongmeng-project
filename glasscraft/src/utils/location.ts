/**
 * 获取当前地理位置
 * @returns Promise 包含 latitude 和 longitude 的对象
 */
export function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '获取位置失败'))
      }
    })
  })
}

/**
 * 计算两点之间的距离（Haversine 公式）
 * @param lat1 起始点纬度
 * @param lon1 起始点经度
 * @param lat2 终点纬度
 * @param lon2 终点经度
 * @returns 距离（单位：km）
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // 地球半径（km）
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 将角度转换为弧度
 * @param deg 角度
 * @returns 弧度
 */
function toRadians(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * 格式化距离显示
 * @param km 距离（单位：km）
 * @returns 格式化后的距离字符串，如 800m 或 1.5km
 */
export function formatDistance(km: number): string {
  if (km < 0) return '0m'
  const meters = km * 1000
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${km.toFixed(1)}km`
}

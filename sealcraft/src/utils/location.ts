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
 * @returns 距离（单位：米）
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // 地球半径（米）
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
 * 格式化地址，提取省市区信息
 * @param address 完整地址字符串
 * @returns 格式化后的地址
 */
export function formatAddress(address: string): string {
  if (!address) return ''

  // 去除多余空格
  let result = address.trim().replace(/\s+/g, ' ')

  // 提取省市区并简化
  const provinceMatch = result.match(/^([^省]+省|[^自治区]+自治区|[^市]+市|[^特别]+特别行政区)/)
  const cityMatch = result.match(/([^市]+市|[^盟]+盟|[^州]+州)/)
  const districtMatch = result.match(/([^区]+区|[^县]+县|[^旗]+旗)/)

  if (provinceMatch && cityMatch && districtMatch) {
    return `${provinceMatch[0]} ${cityMatch[0]} ${districtMatch[0]}`
  }

  return result
}

/**
 * 根据用户坐标对工作室列表排序（按距离从近到远）
 * @param studios 工作室列表（含 location 字段）
 * @param userLat 用户纬度
 * @param userLon 用户经度
 * @returns 附带 distance 字段并已排序的工作室列表
 */
export function sortStudiosByDistance<T extends { location: { latitude: number; longitude: number }; distance?: number }>(
  studios: T[],
  userLat: number,
  userLon: number
): T[] {
  return studios
    .map((studio) => ({
      ...studio,
      distance: calculateDistance(userLat, userLon, studio.location.latitude, studio.location.longitude)
    }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
}

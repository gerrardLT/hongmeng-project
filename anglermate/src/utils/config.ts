/**
 * AnglerMate 应用配置
 * 
 * 使用前请完成以下配置：
 * 1. 注册和风天气开发者账号：https://dev.qweather.com/
 * 2. 在控制台创建项目，获取项目ID、凭据ID和 Ed25519 私钥
 * 3. 将项目ID填入下方 PROJECT_ID
 * 4. 如有自建后端，修改 API_BASE_URL
 */

// 后端服务地址（如使用自建后端）
export const API_BASE_URL = ''

// 和风天气配置（JWT 认证方式）
export const QWEATHER_CONFIG = {
  // JWT 认证 API 地址
  BASE_URL: 'https://devapi.qweather.com/v7',
  // GeoAPI 地址（城市搜索）
  GEO_URL: 'https://geoapi.qweather.com/v2',
  // 凭据ID（kid）
  CREDENTIAL_ID: 'TDWGVEDAPC',
  // 项目ID（sub）
  PROJECT_ID: '3H2CNX2CNW',
  // Ed25519 私钥
  PRIVATE_KEY: `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIMA3RzFLSPtheW3W49kBWUwhEAfIP9iIKPOib5gk6jRw
-----END PRIVATE KEY-----`
}

// 华为云服务配置（鸿蒙端）
export const HUAWEI_CONFIG = {
  APP_ID: '',
  CLIENT_ID: '',
  CLIENT_SECRET: ''
}

// 应用常量
export const APP_CONFIG = {
  APP_NAME: 'AnglerMate',
  VERSION: '1.0.0',
  // 天气数据缓存时间（毫秒）- 30分钟
  WEATHER_CACHE_DURATION: 30 * 60 * 1000,
  // 照片最大数量
  MAX_PHOTOS: 5,
  // 照片压缩最大大小（字节）- 500KB
  MAX_PHOTO_SIZE: 500 * 1024,
  // 默认地理围栏半径（米）
  DEFAULT_GEOFENCE_RADIUS: 100
}

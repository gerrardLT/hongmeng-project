/** 后端服务地址 */
export const API_BASE_URL = ''

/** 华为云服务配置 */
export const HUAWEI_CONFIG = {
  APP_ID: '',
  CLIENT_ID: '',
  CLIENT_SECRET: ''
}

/** 应用常量 */
export const APP_CONFIG = {
  APP_NAME: 'CampReady',
  VERSION: '1.0.0',
  MAX_PHOTOS: 3,
  MAX_PHOTO_SIZE: 300 * 1024,
  DEFAULT_WEIGHT_UNIT: 'g' as const,
  DEFAULT_WEIGHT_THRESHOLD: 15000,  // 15kg 背包露营重量预警
  MAX_CHECKLIST_ITEMS: 100
}

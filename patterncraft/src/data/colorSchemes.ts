export interface PresetColorScheme {
  colorId: string
  name: string
  type: 'traditional' | 'modern' | 'festival'
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
}

export const presetColorSchemes: PresetColorScheme[] = [
  // ========== 传统配色 (10套) ==========
  {
    colorId: 'c001',
    name: '故宫红墙金瓦',
    type: 'traditional',
    primaryColor: '#C41A16',
    secondaryColor: '#D4A017',
    accentColor: '#8B0000',
    backgroundColor: '#FFF8E7'
  },
  {
    colorId: 'c002',
    name: '青花蓝白',
    type: 'traditional',
    primaryColor: '#2E5FA1',
    secondaryColor: '#FFFFFF',
    accentColor: '#1A3A6B',
    backgroundColor: '#F0F4FA'
  },
  {
    colorId: 'c003',
    name: '敦煌重彩',
    type: 'traditional',
    primaryColor: '#B8420F',
    secondaryColor: '#3D7A47',
    accentColor: '#D4A017',
    backgroundColor: '#F5E6C8'
  },
  {
    colorId: 'c004',
    name: '水墨黑白',
    type: 'traditional',
    primaryColor: '#2C2C2C',
    secondaryColor: '#787878',
    accentColor: '#B0B0B0',
    backgroundColor: '#F5F5F0'
  },
  {
    colorId: 'c005',
    name: '翡翠绿金',
    type: 'traditional',
    primaryColor: '#0C7A3E',
    secondaryColor: '#D4A017',
    accentColor: '#065C2E',
    backgroundColor: '#F0F8F0'
  },
  {
    colorId: 'c006',
    name: '粉黛桃红',
    type: 'traditional',
    primaryColor: '#E8909C',
    secondaryColor: '#F2C4C8',
    accentColor: '#C0526F',
    backgroundColor: '#FFF5F5'
  },
  {
    colorId: 'c007',
    name: '景泰蓝',
    type: 'traditional',
    primaryColor: '#1B4F8A',
    secondaryColor: '#2B9EB3',
    accentColor: '#D4A017',
    backgroundColor: '#E8F0F8'
  },
  {
    colorId: 'c008',
    name: '朱砂红',
    type: 'traditional',
    primaryColor: '#CC3333',
    secondaryColor: '#E8D5B5',
    accentColor: '#8B1A1A',
    backgroundColor: '#FFF0E0'
  },
  {
    colorId: 'c009',
    name: '琥珀金',
    type: 'traditional',
    primaryColor: '#D4A017',
    secondaryColor: '#C08B30',
    accentColor: '#8B6914',
    backgroundColor: '#FFFBE6'
  },
  {
    colorId: 'c010',
    name: '靛蓝白瓷',
    type: 'traditional',
    primaryColor: '#003366',
    secondaryColor: '#F8F8FF',
    accentColor: '#4A6FA5',
    backgroundColor: '#F0F5FA'
  },

  // ========== 现代配色 (5套) ==========
  {
    colorId: 'c011',
    name: '莫兰迪粉',
    type: 'modern',
    primaryColor: '#C8A2A6',
    secondaryColor: '#D4BEB2',
    accentColor: '#A67B7E',
    backgroundColor: '#F5EFEB'
  },
  {
    colorId: 'c012',
    name: '莫兰迪蓝',
    type: 'modern',
    primaryColor: '#8BA4B5',
    secondaryColor: '#B5C4CC',
    accentColor: '#617D8A',
    backgroundColor: '#EFF3F5'
  },
  {
    colorId: 'c013',
    name: '马卡龙彩',
    type: 'modern',
    primaryColor: '#FFB6C1',
    secondaryColor: '#B0E0E6',
    accentColor: '#FFDAB9',
    backgroundColor: '#FFFAFA'
  },
  {
    colorId: 'c014',
    name: '渐变暖阳',
    type: 'modern',
    primaryColor: '#FF7E5F',
    secondaryColor: '#FEB47B',
    accentColor: '#FF5E3A',
    backgroundColor: '#FFF8F0'
  },
  {
    colorId: 'c015',
    name: '渐变冷月',
    type: 'modern',
    primaryColor: '#667DB6',
    secondaryColor: '#0082C8',
    accentColor: '#5B86E5',
    backgroundColor: '#F0F3FA'
  },

  // ========== 节日配色 (5套) ==========
  {
    colorId: 'c016',
    name: '春节红金',
    type: 'festival',
    primaryColor: '#DE2910',
    secondaryColor: '#FFD700',
    accentColor: '#8B0000',
    backgroundColor: '#FFF5E5'
  },
  {
    colorId: 'c017',
    name: '中秋黄橙',
    type: 'festival',
    primaryColor: '#F5A623',
    secondaryColor: '#F7C948',
    accentColor: '#D4880F',
    backgroundColor: '#FFFBF0'
  },
  {
    colorId: 'c018',
    name: '端午青绿',
    type: 'festival',
    primaryColor: '#2E8B57',
    secondaryColor: '#98D8C8',
    accentColor: '#1B5E3B',
    backgroundColor: '#F0FFF0'
  },
  {
    colorId: 'c019',
    name: '婚礼红金',
    type: 'festival',
    primaryColor: '#CC0000',
    secondaryColor: '#FFD700',
    accentColor: '#990000',
    backgroundColor: '#FFF8F0'
  },
  {
    colorId: 'c020',
    name: '元宵灯红',
    type: 'festival',
    primaryColor: '#E03C31',
    secondaryColor: '#FFB347',
    accentColor: '#C0392B',
    backgroundColor: '#FFF5E8'
  }
]

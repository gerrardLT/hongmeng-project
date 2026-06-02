import type { Studio, Project } from '@/types/models'
import { dbGet, dbSet, dbList } from '@/utils/db'

const STUDIO_COLLECTION = 'studios'
const PROJECT_COLLECTION = 'projects'

/** Mock 烧玻璃工作室数据 */
const MOCK_STUDIOS: Studio[] = [
  {
    studioId: 'studio_01',
    name: '琉光工坊',
    address: '北京市朝阳区三里屯太古里北区N3-26',
    location: { latitude: 39.9362, longitude: 116.4551 },
    phone: '010-64171234',
    photos: ['/static/studio/studio01_1.jpg', '/static/studio/studio01_2.jpg'],
    rating: 4.9,
    businessHours: '周一至周日 10:00-22:00',
    description: '琉光工坊是一家专注于热熔玻璃艺术体验的高端工作室，拥有专业级窑炉和经验丰富的工艺师团队。在这里，你可以亲手将平凡的玻璃原料变成璀璨的艺术品。我们提供从入门到进阶的完整课程体系，适合各个年龄段的爱好者。',
    priceRange: '￥180-580',
    distance: 1.2
  },
  {
    studioId: 'studio_02',
    name: '玻璃花园',
    address: '上海市静安区南京西路1266号恒隆广场4层',
    location: { latitude: 31.2304, longitude: 121.4551 },
    phone: '021-62881234',
    photos: ['/static/studio/studio02_1.jpg', '/static/studio/studio02_2.jpg'],
    rating: 4.8,
    businessHours: '周一至周日 10:00-21:00',
    description: '玻璃花园融合了自然美学与玻璃工艺，在充满绿植的空间中体验烧玻璃的乐趣。工作室以植物为主题的玻璃饰品闻名，独创的"花瓣吹制技法"深受学员喜爱。',
    priceRange: '￥200-600',
    distance: 2.5
  },
  {
    studioId: 'studio_03',
    name: '晶艺坊',
    address: '广州市天河区天河路383号太古汇M层',
    location: { latitude: 23.138, longitude: 113.3288 },
    phone: '020-38881234',
    photos: ['/static/studio/studio03_1.jpg', '/static/studio/studio03_2.jpg'],
    rating: 4.7,
    businessHours: '周二至周日 11:00-20:00',
    description: '晶艺坊是华南地区最具影响力的玻璃艺术体验中心，引进意大利穆拉诺岛传统吹制工艺。工作室拥有开放式窑炉观赏区，顾客可以近距离欣赏大师级工艺表演。',
    priceRange: '￥150-500',
    distance: 3.8
  },
  {
    studioId: 'studio_04',
    name: '火焰工作室',
    address: '深圳市南山区科苑南路2888号深圳湾万象城B1层',
    location: { latitude: 22.5201, longitude: 113.9431 },
    phone: '0755-86661234',
    photos: ['/static/studio/studio04_1.jpg', '/static/studio/studio04_2.jpg'],
    rating: 4.6,
    businessHours: '周一至周日 10:00-22:00',
    description: '火焰工作室以工业风装修风格和专业灯光系统著称，是拍照打卡与烧玻璃体验两不误的网红工作室。我们提供定制情侣对戒服务，见证每一对恋人的甜蜜时刻。',
    priceRange: '￥220-680',
    distance: 5.1
  },
  {
    studioId: 'studio_05',
    name: '水晶之心',
    address: '成都市锦江区春熙路8号群光广场7层',
    location: { latitude: 30.6575, longitude: 104.0822 },
    phone: '028-86661234',
    photos: ['/static/studio/studio05_1.jpg', '/static/studio/studio05_2.jpg'],
    rating: 4.9,
    businessHours: '周一至周日 09:30-21:30',
    description: '水晶之心是国内首家引进德国精密温控系统的烧玻璃工作室，温度控制精确到±1°C，确保每一件作品都达到最佳效果。我们特别擅长制作晶莹剔透的水晶质感饰品。',
    priceRange: '￥250-720',
    distance: 4.3
  },
  {
    studioId: 'studio_06',
    name: '琉璃梦境',
    address: '杭州市西湖区南山路147号西湖天地',
    location: { latitude: 30.2436, longitude: 120.1554 },
    phone: '0571-88881234',
    photos: ['/static/studio/studio06_1.jpg', '/static/studio/studio06_2.jpg'],
    rating: 4.5,
    businessHours: '周三至周一 10:00-19:00',
    description: '琉璃梦境坐落于西湖之畔，工作室以中式琉璃工艺为特色，将传统文化与现代设计完美结合。在体验烧玻璃的同时，还能品尝特色茶点，感受江南文化的独特韵味。',
    priceRange: '￥180-520',
    distance: 6.7
  },
  {
    studioId: 'studio_07',
    name: '光之器皿',
    address: '南京市玄武区中山路18号德基广场二期3层',
    location: { latitude: 32.0504, longitude: 118.7841 },
    phone: '025-83881234',
    photos: ['/static/studio/studio07_1.jpg', '/static/studio/studio07_2.jpg'],
    rating: 4.7,
    businessHours: '周一至周六 10:00-20:00',
    description: '光之器皿专注于功能性玻璃器皿的制作体验，从咖啡杯到花瓶，每一件作品都可以融入日常生活。工作室配备专业退火窑，确保作品的耐用性和安全性。',
    priceRange: '￥160-480',
    distance: 2.9
  }
]

/** Mock 工作室项目数据 */
const MOCK_PROJECTS: Project[] = [
  {
    projectId: 'proj_01',
    studioId: 'studio_01',
    name: '琉璃戒指',
    category: 'ring',
    duration: 90,
    difficulty: 'easy',
    price: 198,
    photos: ['/static/project/proj01_1.jpg'],
    description: '学习基础玻璃塑形技法，制作一枚独一无二的琉璃戒指。适合零基础学员，全程有专业工艺师指导。',
    suitableFor: '情侣、朋友、单人体验',
    process: ['选择喜欢的玻璃颜色', '加热玻璃至可塑状态', '使用工具塑形为戒圈', '调整尺寸并冷却退火', '打磨抛光成品'],
    colors: ['琥珀金', '深海蓝', '樱花粉', '翡翠绿', '透明色'],
    shapes: ['圆环', '波浪', '扭曲']
  },
  {
    projectId: 'proj_02',
    studioId: 'studio_01',
    name: '彩虹耳环',
    category: 'earring',
    duration: 120,
    difficulty: 'medium',
    price: 268,
    photos: ['/static/project/proj02_1.jpg'],
    description: '运用层叠技法，将多种颜色的玻璃融合，制作出渐变彩虹效果的耳环。每一件作品都是自然的色彩流动。',
    suitableFor: '时尚爱好者、手工达人',
    process: ['准备多种彩色玻璃棒', '逐层熔合不同颜色', '拉丝并切割成型', '安装耳钩配件', '最终质检与包装'],
    colors: ['彩虹渐变', '日落橙红', '海洋蓝绿', '紫罗兰'],
    shapes: ['水滴', '圆形', '长条']
  },
  {
    projectId: 'proj_03',
    studioId: 'studio_02',
    name: '水晶吊坠',
    category: 'pendant',
    duration: 150,
    difficulty: 'medium',
    price: 328,
    photos: ['/static/project/proj03_1.jpg'],
    description: '学习精密切割与抛光技法，将玻璃打造成晶莹剔透的水晶吊坠。可内嵌金箔或干花，增添独特个性。',
    suitableFor: '送礼、纪念日、自用',
    process: ['设计吊坠造型', '切割玻璃基底', '精细打磨棱角', '内嵌装饰元素', '穿绳安装扣件'],
    colors: ['冰透白', '香槟金', '玫瑰粉', '夜空蓝'],
    shapes: ['心形', '菱形', '椭圆', '六边形']
  },
  {
    projectId: 'proj_04',
    studioId: 'studio_02',
    name: '玻璃花瓶',
    category: 'decoration',
    duration: 180,
    difficulty: 'hard',
    price: 480,
    photos: ['/static/project/proj04_1.jpg'],
    description: '体验传统吹制工艺，亲手吹制一个属于自己的玻璃花瓶。从熔融玻璃到成型，感受古老技艺的魅力。',
    suitableFor: '有一定基础的爱好者',
    process: ['取料并加热', '初步吹制成型', '开口并修整边缘', '添加纹理或颜色', '退火处理'],
    colors: ['透明', '磨砂白', '渐变蓝', '琥珀黄'],
    shapes: ['圆球', '细长颈', '宽口']
  },
  {
    projectId: 'proj_05',
    studioId: 'studio_03',
    name: '星空摆件',
    category: 'decoration',
    duration: 120,
    difficulty: 'easy',
    price: 258,
    photos: ['/static/project/proj05_1.jpg'],
    description: '将闪粉与彩色玻璃结合，制作出璀璨夺目的星空球摆件。黑暗中隐约发光，仿佛将整个宇宙握在手中。',
    suitableFor: '亲子体验、初学者',
    process: ['选择球体模具', '混合闪粉与玻璃', '加热融合', '冷却脱模', '底座安装'],
    colors: ['深蓝星空', '紫色星云', '银河银白', '极光绿'],
    shapes: ['圆球', '立方体', '水滴']
  },
  {
    projectId: 'proj_06',
    studioId: 'studio_04',
    name: '迷你多肉盆栽',
    category: 'other',
    duration: 100,
    difficulty: 'easy',
    price: 188,
    photos: ['/static/project/proj06_1.jpg'],
    description: '用玻璃塑造可爱的多肉植物造型，永不凋谢的绿色陪伴。可以制作多个不同品种，组成迷你花园。',
    suitableFor: '植物爱好者、办公室装饰',
    process: ['选择多肉品种造型', '分色加热玻璃', '逐层堆叠叶片', '制作花盆底座', '组装固定'],
    colors: ['翡翠绿', '粉边绿', '蓝灰', '果冻色'],
    shapes: ['莲花掌', '石莲花', '佛珠']
  },
  {
    projectId: 'proj_07',
    studioId: 'studio_05',
    name: '玻璃风铃',
    category: 'decoration',
    duration: 140,
    difficulty: 'medium',
    price: 298,
    photos: ['/static/project/proj07_1.jpg'],
    description: '制作一套清脆悦耳的玻璃风铃，每一个音管都经过精心调校。风吹过，叮咚声如清泉流淌。',
    suitableFor: '家居装饰、送礼佳品',
    process: ['制作音管造型', '调校音高频率', '制作顶部悬挂架', '穿线组装', '测试音色'],
    colors: ['透明', '浅蓝', '淡紫', '薄荷绿'],
    shapes: ['直筒', '锥形', '螺旋']
  },
  {
    projectId: 'proj_08',
    studioId: 'studio_06',
    name: '古法琉璃手链',
    category: 'other',
    duration: 110,
    difficulty: 'medium',
    price: 238,
    photos: ['/static/project/proj08_1.jpg'],
    description: '运用中式脱蜡铸造工艺，制作带有传统纹样的琉璃珠，串成典雅的手链。每一颗珠子都承载着匠心。',
    suitableFor: '传统文化爱好者',
    process: ['制作蜡模', '包裹耐火材料', '熔融玻璃浇注', '去除模具', '打磨穿绳'],
    colors: ['朱砂红', '孔雀蓝', '琥珀黄', '墨玉黑'],
    shapes: ['圆珠', '桶珠', '扁圆']
  }
]

/**
 * 初始化 Mock 工作室数据
 */
function ensureMockStudios(): void {
  const existing = dbList<Studio>(STUDIO_COLLECTION)
  if (existing.length > 0) return

  MOCK_STUDIOS.forEach((studio) => {
    dbSet(STUDIO_COLLECTION, studio.studioId, studio)
  })
}

/**
 * 初始化 Mock 项目数据
 */
function ensureMockProjects(): void {
  const existing = dbList<Project>(PROJECT_COLLECTION)
  if (existing.length > 0) return

  MOCK_PROJECTS.forEach((project) => {
    dbSet(PROJECT_COLLECTION, project.projectId, project)
  })
}

/**
 * 获取工作室列表
 * @returns 工作室列表
 */
export async function getStudioList(): Promise<Studio[]> {
  ensureMockStudios()
  return dbList<Studio>(STUDIO_COLLECTION)
}

/**
 * 获取工作室详情
 * @param studioId 工作室 ID
 * @returns 工作室详情或 null
 */
export async function getStudioDetail(studioId: string): Promise<Studio | null> {
  ensureMockStudios()
  return dbGet<Studio>(STUDIO_COLLECTION, studioId)
}

/**
 * 获取工作室的项目列表
 * @param studioId 工作室 ID
 * @returns 项目列表
 */
export async function getStudioProjects(studioId: string): Promise<Project[]> {
  ensureMockProjects()
  const projects = dbList<Project>(PROJECT_COLLECTION)
  return projects.filter((p) => p.studioId === studioId)
}

/**
 * 搜索工作室
 * @param keyword 搜索关键词
 * @returns 匹配的工作室列表
 */
export async function searchStudios(keyword: string): Promise<Studio[]> {
  ensureMockStudios()
  const studios = dbList<Studio>(STUDIO_COLLECTION)
  if (!keyword.trim()) return studios

  const kw = keyword.toLowerCase()
  return studios.filter(
    (s) =>
      s.name.toLowerCase().includes(kw) ||
      s.address.toLowerCase().includes(kw) ||
      s.description.toLowerCase().includes(kw)
  )
}

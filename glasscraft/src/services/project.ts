import type { Project, ProjectCategory } from '@/types/models'
import { dbGet, dbSet, dbList } from '@/utils/db'

const PROJECT_COLLECTION = 'projects'

/** Mock 烧玻璃项目数据（至少8个，覆盖所有分类） */
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
 * 获取项目列表
 * @param category 可选分类筛选
 * @returns 项目列表
 */
export async function getProjectList(category?: ProjectCategory): Promise<Project[]> {
  ensureMockProjects()
  const projects = dbList<Project>(PROJECT_COLLECTION)

  if (category) {
    return projects.filter((p) => p.category === category)
  }

  return projects
}

/**
 * 获取项目详情
 * @param projectId 项目 ID
 * @returns 项目详情或 null
 */
export async function getProjectDetail(projectId: string): Promise<Project | null> {
  ensureMockProjects()
  return dbGet<Project>(PROJECT_COLLECTION, projectId)
}

/**
 * 获取热门项目（按价格降序取前4个作为热门推荐）
 * @returns 热门项目列表
 */
export async function getHotProjects(): Promise<Project[]> {
  ensureMockProjects()
  const projects = dbList<Project>(PROJECT_COLLECTION)

  return projects
    .sort((a, b) => b.price - a.price)
    .slice(0, 4)
}

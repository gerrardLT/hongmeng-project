import type { Pattern } from '@/types/models'

export const builtinPatterns: Pattern[] = [
  // ==================== 中国传统纹样 (20种) ====================
  {
    patternId: 'p001',
    name: '云纹',
    category: 'traditional',
    subCategory: '自然纹样',
    previewUrl: '/static/patterns/cloud.png',
    description: '云纹是中国最古老的装饰纹样之一，以卷曲流动的线条模拟天空中云朵的形态，象征高升祥瑞，广泛应用于建筑、服饰、瓷器等领域',
    origin: '起源于商周时期的青铜器装饰，由原始的涡旋纹演变而来',
    meaning: '象征高升、祥瑞、如意',
    history: '云纹从商周青铜器涡旋纹发展而来，经汉代定型，唐代趋于华丽，宋代简约雅致，明清融合多种元素形成复合云纹',
    usageScenarios: ['建筑装饰', '服饰纹样', '瓷器绘制', '家具雕刻', '文创产品'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { curlDegree: 50, tailLength: 50 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p002',
    name: '回纹',
    category: 'traditional',
    subCategory: '几何纹样',
    previewUrl: '/static/patterns/meander.png',
    description: '回纹由横竖短线折绕组成的方形或圆形回环状花纹，形似"回"字，是中国古典装饰中最具代表性的几何纹样之一',
    origin: '源自新石器时代彩陶上的雷纹图案，距今约四千年历史',
    meaning: '象征吉利永长、富贵不断',
    history: '回纹起源于新石器彩陶雷纹，商周时期在青铜器上大量使用，后逐渐成为建筑、家具、瓷器的标准装饰边框纹样',
    usageScenarios: ['边框装饰', '建筑彩绘', '家具镶嵌', '瓷器边饰', '服饰织锦'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { cornerStyle: 'sharp', lineWidth: 3 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p003',
    name: '如意纹',
    category: 'traditional',
    subCategory: '吉祥纹样',
    previewUrl: '/static/patterns/ruyi.png',
    description: '如意纹取自如意器物的造型，头部呈灵芝或心形云朵状，寓意称心如意，是中国传统吉祥纹样中使用最广泛的纹样之一',
    origin: '源自汉代如意器物的造型，融合灵芝与祥云元素演化而成',
    meaning: '象征万事如意、吉祥顺遂',
    history: '如意纹从汉代如意器物造型演化，唐代融入佛教莲花元素，明清时期成为皇家御用纹饰，广泛用于宫廷建筑与服饰',
    usageScenarios: ['宫廷装饰', '玉器雕刻', '服饰刺绣', '建筑彩绘', '首饰设计'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { headSize: 50, curveSmoothness: 70 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p004',
    name: '缠枝纹',
    category: 'traditional',
    subCategory: '植物纹样',
    previewUrl: '/static/patterns/interlocking-branches.png',
    description: '缠枝纹以波状曲线为主干，向两侧交替伸展卷曲的枝叶花朵，构成连续流畅的二方连续纹样，又称万寿藤或转枝纹',
    origin: '起源于汉代，受西域忍冬纹影响，与本土卷草纹融合发展而成',
    meaning: '象征生生不息、万代绵长',
    history: '缠枝纹汉代初现，唐代受外来文化影响趋于成熟华丽，宋元时期在瓷器上广泛使用，明清达到艺术巅峰',
    usageScenarios: ['瓷器装饰', '织锦纹样', '建筑雕刻', '金属器皿', '漆器装饰'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { curvature: 50, flowerDensity: 50 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p005',
    name: '万字纹',
    category: 'traditional',
    subCategory: '几何纹样',
    previewUrl: '/static/patterns/swastika.png',
    description: '万字纹即"卍"字纹，由"卍"字四端向外延伸并相互连锁而成的连续几何纹样，在中国传统文化中寓意万福万寿',
    origin: '源自古印度宗教符号，汉代随佛教传入中国并本土化发展',
    meaning: '象征万福万寿、吉祥如意',
    history: '万字纹随佛教传入中国后，唐代武则天定其读音为"万"，此后广泛用于建筑、织物、瓷器装饰，成为中华吉祥符号',
    usageScenarios: ['织锦纹样', '建筑装饰', '瓷器底纹', '家具雕刻', '窗棂设计'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { armWidth: 3, interlockDensity: 50 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p006',
    name: '水波纹',
    category: 'traditional',
    subCategory: '自然纹样',
    previewUrl: '/static/patterns/wave.png',
    description: '水波纹以规律的波浪曲线描绘水面涟漪的动态美感，层叠起伏间展现水的柔韧与力量，是东方美学中重要的装饰母题',
    origin: '起源于商代青铜器纹饰，取自对自然水流形态的艺术抽象',
    meaning: '象征绵延不绝、源远流长',
    history: '水波纹商代即已出现，唐宋时期在瓷器上大量运用，日本浮世绘中的海浪纹亦受其深刻影响，成为东亚共同的审美符号',
    usageScenarios: ['瓷器绘制', '织物印染', '建筑装饰', '漆器纹样', '现代插画'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { amplitude: 50, frequency: 50 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p007',
    name: '龙纹',
    category: 'traditional',
    subCategory: '瑞兽纹样',
    previewUrl: '/static/patterns/dragon.png',
    description: '龙纹是中华民族最具象征意义的装饰纹样，以神话中龙的形象为蓝本，融合蛇身鹿角鹰爪等多种动物特征，气势磅礴',
    origin: '起源于新石器时代，红山文化玉龙是已知最早的龙形象之一',
    meaning: '象征权威、尊贵、祥瑞',
    history: '龙纹从新石器时代原始图腾发展，商周定型，汉唐趋于成熟，明清时期五爪金龙成为皇家专用纹饰，民间则用四爪三爪',
    usageScenarios: ['皇家装饰', '建筑雕刻', '服饰刺绣', '瓷器绘制', '金属工艺'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { bodyCoils: 3, detailLevel: 70 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p008',
    name: '凤纹',
    category: 'traditional',
    subCategory: '瑞兽纹样',
    previewUrl: '/static/patterns/phoenix.png',
    description: '凤纹以凤凰形象为原型，长尾飘逸华丽，是中国传统文化中与龙纹并列的最重要瑞兽纹样，常象征女性尊贵之美',
    origin: '起源于商代甲骨文与青铜器装饰，融合多种鸟类特征创造而成',
    meaning: '象征祥瑞、高贵、美德',
    history: '凤纹商代已见于青铜器，周代凤鸟纹盛行，唐代凤纹华美绚丽达到高峰，明清时期凤纹成为皇后专用纹饰标志',
    usageScenarios: ['皇家服饰', '建筑装饰', '首饰设计', '瓷器绘制', '婚庆用品'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { tailSpread: 60, plumageDetail: 70 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p009',
    name: '麒麟纹',
    category: 'traditional',
    subCategory: '瑞兽纹样',
    previewUrl: '/static/patterns/qilin.png',
    description: '麒麟纹以传说中的仁兽麒麟为原型，集龙头鹿身牛尾马蹄于一身，全身鳞甲火焰缭绕，是中国传统四大瑞兽之一',
    origin: '起源于春秋战国时期，古人融合多种动物形象创造的瑞兽形象',
    meaning: '象征仁德、太平、送子吉祥',
    history: '麒麟纹春秋战国初现，汉代墓室画像石中常见，明代成为一品武官补子纹样，清代麒麟送子图广泛流传于民间',
    usageScenarios: ['官服补子', '建筑石刻', '瓷器装饰', '年画创作', '吉祥摆件'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { flameIntensity: 50, scalePattern: 'diamond' }
    },
    isBuiltin: true
  },
  {
    patternId: 'p010',
    name: '莲花纹',
    category: 'traditional',
    subCategory: '植物纹样',
    previewUrl: '/static/patterns/lotus.png',
    description: '莲花纹以荷花为创作原型，花瓣层叠舒展，出淤泥而不染的品格使其成为佛教艺术与世俗装饰中共同喜爱的纹样题材',
    origin: '起源于南北朝时期佛教艺术传入，与本土荷花审美融合发展',
    meaning: '象征纯洁高雅、圆满和谐',
    history: '莲花纹随佛教传入在南北朝兴盛，唐代宝相花融合莲花元素，宋代青瓷莲瓣纹经典，明清时期缠枝莲纹成为瓷器主流',
    usageScenarios: ['瓷器装饰', '佛教艺术', '织物印花', '建筑彩绘', '首饰设计'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { petalLayers: 3, openDegree: 70 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p011',
    name: '牡丹纹',
    category: 'traditional',
    subCategory: '植物纹样',
    previewUrl: '/static/patterns/peony.png',
    description: '牡丹纹以花中之王牡丹为原型，花朵硕大层叠，枝叶繁茂丰满，雍容华贵之态使其成为中国传统花卉纹样之首',
    origin: '唐代牡丹被封为国花后，牡丹纹开始大量出现于各类装饰艺术中',
    meaning: '象征富贵荣华、繁荣昌盛',
    history: '牡丹纹唐代随牡丹文化兴盛而流行，宋代写实风格达到极致，明清时期与其他吉祥元素组合形成富贵牡丹等经典图案',
    usageScenarios: ['服饰刺绣', '瓷器装饰', '漆器绘制', '壁纸设计', '婚庆用品'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { petalFullness: 70, leafDensity: 50 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p012',
    name: '蝙蝠纹',
    category: 'traditional',
    subCategory: '吉祥纹样',
    previewUrl: '/static/patterns/bat.png',
    description: '蝙蝠纹取"蝠"与"福"谐音，以蝙蝠展翅形象进行艺术化处理，是中国民间最常见的谐音吉祥纹样，寓意福从天降',
    origin: '明代开始广泛流行，源于中国民间谐音取吉的文化传统',
    meaning: '象征福气、幸福、福寿双全',
    history: '蝙蝠纹明代开始盛行，清代达到巅峰，五蝠捧寿、蝠到福到等组合图案层出不穷，成为清代装饰艺术的标志元素',
    usageScenarios: ['建筑装饰', '服饰纹样', '瓷器绘制', '家具雕刻', '剪纸艺术'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { wingSpread: 60, bodyStyle: 'round' }
    },
    isBuiltin: true
  },
  {
    patternId: 'p013',
    name: '鹿纹',
    category: 'traditional',
    subCategory: '动物纹样',
    previewUrl: '/static/patterns/deer.png',
    description: '鹿纹以梅花鹿形象为原型，取"鹿"与"禄"谐音，鹿姿优雅灵动，常与松树仙鹤等元素组合，是传统吉祥纹样之一',
    origin: '商周青铜器已见鹿纹装饰，汉代以后因谐音寓意而广泛流行',
    meaning: '象征功名利禄、福禄寿喜',
    history: '鹿纹商周已有，汉代画像砖中常见，唐代鹿纹更加写实，明清时期鹿与蝠桃等组合形成福禄寿三星系列图案',
    usageScenarios: ['瓷器绘制', '织物纹样', '年画创作', '玉器雕刻', '文创设计'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { antlerBranches: 4, poseStyle: 'standing' }
    },
    isBuiltin: true
  },
  {
    patternId: 'p014',
    name: '仙鹤纹',
    category: 'traditional',
    subCategory: '动物纹样',
    previewUrl: '/static/patterns/crane.png',
    description: '仙鹤纹以丹顶鹤为原型，身姿修长优雅，翅展云间，在中国文化中被视为仙人坐骑，是最受文人推崇的吉祥鸟类纹样',
    origin: '起源于先秦时期，古人将丹顶鹤视为仙禽瑞鸟加以艺术创作',
    meaning: '象征长寿、高洁、仙风道骨',
    history: '仙鹤纹先秦已有，唐宋文人画中大量出现，明代成为一品文官补子纹样，清代松鹤延年图成为祝寿经典题材',
    usageScenarios: ['官服补子', '国画创作', '瓷器装饰', '建筑彩绘', '祝寿用品'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { wingPosition: 'spread', neckCurve: 50 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p015',
    name: '鱼纹',
    category: 'traditional',
    subCategory: '动物纹样',
    previewUrl: '/static/patterns/fish.png',
    description: '鱼纹以各类鱼的形象为蓝本，取"鱼"与"余"谐音，双鱼对游或鱼戏莲间是最经典的构图，寓意年年有余',
    origin: '新石器时代半坡遗址彩陶上的鱼纹是中国最早的装饰纹样之一',
    meaning: '象征年年有余、富足安康',
    history: '鱼纹是中国最古老的纹样之一，仰韶文化彩陶鱼纹距今六千余年，历经各朝发展，鲤鱼跃龙门等故事赋予其更丰富寓意',
    usageScenarios: ['瓷器绘制', '剪纸艺术', '年画创作', '织物印花', '建筑装饰'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { finDetail: 50, scaleTexture: 'fine' }
    },
    isBuiltin: true
  },
  {
    patternId: 'p016',
    name: '蝴蝶纹',
    category: 'traditional',
    subCategory: '动物纹样',
    previewUrl: '/static/patterns/butterfly.png',
    description: '蝴蝶纹以蝴蝶翩翩起舞的姿态为原型，翅膀对称展开色彩斑斓，取"蝶"与"耋"谐音，在民间象征长寿与爱情美满',
    origin: '唐代开始在织物和瓷器上大量出现，与庄周梦蝶的文化意象相融合',
    meaning: '象征长寿、爱情、自由美好',
    history: '蝴蝶纹唐代开始流行，宋代花蝶图成为经典题材，明清时期蝶恋花纹广泛用于女性服饰与闺阁用品的装饰',
    usageScenarios: ['服饰刺绣', '首饰设计', '瓷器装饰', '扇面绘制', '文创产品'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { wingPattern: 'symmetric', antennaCurve: 40 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p017',
    name: '石榴纹',
    category: 'traditional',
    subCategory: '植物纹样',
    previewUrl: '/static/patterns/pomegranate.png',
    description: '石榴纹以石榴果实开裂露出饱满籽粒的形象为原型，因石榴多籽的特性，在中国传统文化中是最重要的多子多福纹样',
    origin: '石榴汉代由西域传入中国，南北朝时期石榴纹开始出现于装饰艺术中',
    meaning: '象征多子多福、人丁兴旺',
    history: '石榴纹南北朝初现，唐代随石榴文化兴盛而流行，宋代瓷器上常见折枝石榴纹，明清时期榴开百子成为婚嫁必备纹样',
    usageScenarios: ['婚庆装饰', '瓷器绘制', '织物印花', '剪纸艺术', '建筑雕刻'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { openDegree: 60, seedCount: 'dense' }
    },
    isBuiltin: true
  },
  {
    patternId: 'p018',
    name: '竹纹',
    category: 'traditional',
    subCategory: '植物纹样',
    previewUrl: '/static/patterns/bamboo.png',
    description: '竹纹以竹子挺拔的竿节与疏朗的枝叶为创作原型，竹之虚心有节的品格使其成为文人墨客最推崇的植物纹样之一',
    origin: '先秦时期竹已入诗画，唐代墨竹画法成熟后竹纹开始广泛用于装饰',
    meaning: '象征高洁正直、谦虚有节',
    history: '竹纹先秦已见于器物装饰，唐代文同创墨竹画派，宋代竹纹在瓷器织物上广泛使用，与梅兰菊并称四君子纹样',
    usageScenarios: ['国画创作', '瓷器装饰', '家具雕刻', '园林设计', '文房用品'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { nodeCount: 5, leafDensity: 40 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p019',
    name: '梅花纹',
    category: 'traditional',
    subCategory: '植物纹样',
    previewUrl: '/static/patterns/plum-blossom.png',
    description: '梅花纹以梅花傲雪凌霜的形象为原型，五瓣花朵疏影横斜，暗香浮动，是中国传统文化中最具风骨的花卉纹样代表',
    origin: '先秦时期梅已入诗经，宋代梅花纹在瓷器和织物上开始大量使用',
    meaning: '象征坚韧高洁、傲骨迎春',
    history: '梅花纹先秦见于文学，宋代林逋梅妻鹤子后梅花文化达到高峰，明代梅花被定为国花后纹样使用更加广泛',
    usageScenarios: ['瓷器绘制', '织物印花', '国画创作', '家具装饰', '文创产品'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { branchAngle: 45, blossomDensity: 50 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p020',
    name: '铜钱纹',
    category: 'traditional',
    subCategory: '几何纹样',
    previewUrl: '/static/patterns/coin.png',
    description: '铜钱纹以古代方孔圆钱的造型为基础，外圆内方的形制象征天圆地方的宇宙观，多个铜钱相连寓意财源广进',
    origin: '秦代统一货币为圆形方孔钱后，铜钱纹样逐渐成为装饰母题',
    meaning: '象征财富丰裕、天圆地方',
    history: '铜钱纹秦代货币统一后出现，汉代在建筑装饰中使用，宋代钱纹锦流行，明清时期铜钱纹与蝙蝠等组合成福在眼前图',
    usageScenarios: ['建筑装饰', '织锦纹样', '家具设计', '窗棂图案', '吉祥挂饰'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { innerSquareSize: 30, chainStyle: 'overlapping' }
    },
    isBuiltin: true
  },

  // ==================== 少数民族纹样 (15种) ====================
  {
    patternId: 'p021',
    name: '苗族蜡染纹',
    category: 'ethnic',
    subCategory: '苗族纹样',
    previewUrl: '/static/patterns/miao-batik.png',
    description: '苗族蜡染纹以蜡刀在白布上绘制图案后浸染靛蓝而成，线条流畅自然，蓝白对比鲜明，展现苗族妇女高超的手工技艺',
    origin: '源自贵州苗族聚居区的传统蜡染工艺，已有两千余年历史',
    meaning: '象征苗族对自然的崇拜与生命的礼赞',
    history: '苗族蜡染起源于秦汉时期，唐宋时期技艺成熟，明清形成独特的地域风格，现为国家级非物质文化遗产代表性项目',
    usageScenarios: ['民族服饰', '家居布艺', '旅游文创', '艺术展览', '现代时装'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { waxCrackEffect: 30, indigoDepth: 70 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p022',
    name: '苗族刺绣纹',
    category: 'ethnic',
    subCategory: '苗族纹样',
    previewUrl: '/static/patterns/miao-embroidery.png',
    description: '苗族刺绣纹以针线在布面上绣出精美图案，融合蝴蝶妈妈神话与自然万物形象，色彩浓烈多变，被誉为穿在身上的史书',
    origin: '源自苗族古老的蝴蝶妈妈创世神话和对自然万物的崇拜传统',
    meaning: '象征民族记忆、生命崇拜与美好祝愿',
    history: '苗族刺绣有数千年历史，因苗族无文字而以刺绣记录历史，代代相传，形成了极为丰富的纹样体系与独特的审美风格',
    usageScenarios: ['民族服饰', '手工艺品', '时尚设计', '文创产品', '室内装饰'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { stitchDensity: 60, colorLayers: 4 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p023',
    name: '苗族银饰纹',
    category: 'ethnic',
    subCategory: '苗族纹样',
    previewUrl: '/static/patterns/miao-silver.png',
    description: '苗族银饰纹以精细的银丝錾刻工艺呈现花鸟鱼虫图案，造型繁复精美，光泽璀璨，是苗族文化中最具辨识度的装饰艺术',
    origin: '源自明代苗族开始大量使用白银制作装饰品的传统，融合本族审美',
    meaning: '象征财富尊贵、驱邪避灾',
    history: '苗族银饰明代开始盛行，清代技艺达到极致，银饰重量可达数公斤，纹样融合了苗族神话、自然崇拜和审美理想',
    usageScenarios: ['首饰设计', '工艺品制作', '文创开发', '时尚配饰', '艺术收藏'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { filigreeFineness: 70, reliefDepth: 50 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p024',
    name: '藏族唐卡纹',
    category: 'ethnic',
    subCategory: '藏族纹样',
    previewUrl: '/static/patterns/tibetan-thangka.png',
    description: '藏族唐卡纹源自藏传佛教绘画艺术，以矿物颜料绘制佛像与曼陀罗图案，色彩庄严瑰丽，线条精细入微，充满宗教神圣感',
    origin: '起源于松赞干布时期藏传佛教的传入，融合印度和尼泊尔绘画风格',
    meaning: '象征宗教信仰、精神修行与宇宙秩序',
    history: '唐卡艺术始于七世纪吐蕃时期，历经千年发展形成多个流派，其严格的绘制仪轨和精湛技艺使其成为世界级非遗项目',
    usageScenarios: ['宗教用品', '艺术收藏', '室内装饰', '文创设计', '文化展览'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { mandalaRings: 4, pigmentRichness: 80 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p025',
    name: '藏族吉祥八宝纹',
    category: 'ethnic',
    subCategory: '藏族纹样',
    previewUrl: '/static/patterns/tibetan-eight-treasures.png',
    description: '藏族吉祥八宝纹包含宝伞、金鱼、宝瓶、莲花、白螺、吉祥结、胜利幢、法轮八种佛教象征物，组合构成完整吉祥图案',
    origin: '源自印度佛教八瑞相，随藏传佛教传入西藏后融入藏族审美特色',
    meaning: '象征佛法庄严、八方吉祥',
    history: '八宝纹随佛教传入西藏已有千余年历史，在寺庙壁画、法器装饰、建筑门楣中广泛使用，是藏族最核心的装饰纹样系统',
    usageScenarios: ['寺庙装饰', '法器绘制', '建筑彩绘', '织物设计', '文创产品'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { symbolCount: 8, arrangementStyle: 'circular' }
    },
    isBuiltin: true
  },
  {
    patternId: 'p026',
    name: '藏族格桑花纹',
    category: 'ethnic',
    subCategory: '藏族纹样',
    previewUrl: '/static/patterns/tibetan-gesang.png',
    description: '藏族格桑花纹以高原格桑花为原型，八瓣花朵簇拥盛开，色彩艳丽热烈，是藏族人民最喜爱的花卉纹样，象征美好时光',
    origin: '源自青藏高原上广泛生长的格桑花，藏族人民视其为幸福之花',
    meaning: '象征幸福吉祥、美好时光',
    history: '格桑花纹是藏族民间使用最广泛的花卉纹样，从古至今装饰于服饰、帐篷、家具等生活用品中，承载着对美好生活的向往',
    usageScenarios: ['民族服饰', '家居装饰', '旅游纪念品', '包装设计', '现代时装'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { petalCount: 8, clusterSize: 3 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p027',
    name: '彝族刺绣几何纹',
    category: 'ethnic',
    subCategory: '彝族纹样',
    previewUrl: '/static/patterns/yi-geometric.png',
    description: '彝族刺绣几何纹以三角形、菱形、锯齿纹等基本几何元素组合排列，黑红黄三色为主，棱角分明气势强烈，极具民族辨识度',
    origin: '源自彝族先民对自然的抽象概括，与彝族古老的十月太阳历文化密切相关',
    meaning: '象征太阳崇拜、生命力量与宇宙秩序',
    history: '彝族几何纹有数千年传承，其独特的三色体系与几何构成反映了彝族的宇宙观和审美理想，是彝族文化的视觉符号',
    usageScenarios: ['民族服饰', '漆器装饰', '建筑彩绘', '文创产品', '现代设计'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { geometryType: 'diamond', zigzagCount: 5 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p028',
    name: '彝族火纹',
    category: 'ethnic',
    subCategory: '彝族纹样',
    previewUrl: '/static/patterns/yi-fire.png',
    description: '彝族火纹以火焰跳动的形态为创作原型，线条锐利向上攒动，体现了火在彝族文化中至高无上的地位和火把节的热烈氛围',
    origin: '源自彝族对火的原始崇拜，火把节是彝族最重要的传统节日',
    meaning: '象征光明驱邪、热情奔放',
    history: '火纹是彝族最核心的文化符号，贯穿于彝族的宗教仪式、节日庆典和日常装饰中，火把节被誉为东方的狂欢节',
    usageScenarios: ['民族服饰', '节庆装饰', '火把节用品', '漆器纹样', '文化展示'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { flameHeight: 60, flickerIntensity: 50 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p029',
    name: '彝族虎纹',
    category: 'ethnic',
    subCategory: '彝族纹样',
    previewUrl: '/static/patterns/yi-tiger.png',
    description: '彝族虎纹以虎的形象进行高度艺术化处理，造型威猛而质朴，体现了彝族崇虎的图腾文化，认为虎是彝族的祖先和守护神',
    origin: '源自彝族古老的虎图腾崇拜，彝族自称为虎的后代',
    meaning: '象征勇猛威武、驱邪镇宅',
    history: '彝族虎文化源远流长，虎纹在彝族毕摩经书、漆器、服饰中广泛存在，黑虎图腾是彝族最重要的民族文化标识之一',
    usageScenarios: ['民族服饰', '漆器装饰', '图腾艺术', '文创产品', '室内装饰'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { ferocityLevel: 60, stripeStyle: 'bold' }
    },
    isBuiltin: true
  },
  {
    patternId: 'p030',
    name: '壮族织锦纹',
    category: 'ethnic',
    subCategory: '壮族纹样',
    previewUrl: '/static/patterns/zhuang-brocade.png',
    description: '壮族织锦纹以壮锦独特的几何编织图案为原型，菱形骨架内填充各种变形花卉和动物纹样，色彩斑斓对比强烈，织工精巧',
    origin: '源自壮族两千余年的织锦传统，壮锦与蜀锦云锦宋锦并称中国四大名锦',
    meaning: '象征美好生活、勤劳智慧',
    history: '壮锦始于汉代，唐宋时期已成为贡品，明清技艺成熟形成独特风格，现为国家级非物质文化遗产，是壮族文化的瑰宝',
    usageScenarios: ['民族服饰', '家居织品', '旅游纪念品', '时尚设计', '文化展览'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { weaveComplexity: 60, diamondSize: 50 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p031',
    name: '壮族铜鼓纹',
    category: 'ethnic',
    subCategory: '壮族纹样',
    previewUrl: '/static/patterns/zhuang-bronze-drum.png',
    description: '壮族铜鼓纹取自铜鼓鼓面的太阳纹与同心圆纹样，以中心太阳芒为核心向外扩展层层纹饰，是壮族最神圣的文化符号',
    origin: '源自两千余年前壮族先民铸造的青铜鼓面装饰，是权力与信仰的象征',
    meaning: '象征太阳崇拜、权力与团结',
    history: '铜鼓纹随壮族铜鼓文化传承两千余年，广西是世界上铜鼓分布最密集的地区，铜鼓纹是壮族文化最具代表性的视觉符号',
    usageScenarios: ['民族标识', '建筑装饰', '文创产品', '纪念品设计', '城市景观'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { sunRays: 12, concentricRings: 5 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p032',
    name: '壮族花山壁画纹',
    category: 'ethnic',
    subCategory: '壮族纹样',
    previewUrl: '/static/patterns/zhuang-huashan.png',
    description: '壮族花山壁画纹取自广西左江花山岩画中的人物造型，以赤铁矿颜料绘制的蛙形人物正面张臂而立，是最古老的壮族图像',
    origin: '源自战国至东汉时期左江沿岸崖壁上的岩画，距今两千余年',
    meaning: '象征祭祀祈福、民族力量',
    history: '花山岩画是世界文化遗产，壁画中蛙形人物被认为与壮族先民的祭祀活动有关，是目前发现的壮族最早的艺术创作',
    usageScenarios: ['文化展示', '旅游文创', '艺术创作', '城市雕塑', '品牌设计'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { figureCount: 3, primitiveStyle: 70 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p033',
    name: '维吾尔族艾德莱斯绸纹',
    category: 'ethnic',
    subCategory: '维吾尔族纹样',
    previewUrl: '/static/patterns/uyghur-atlas.png',
    description: '艾德莱斯绸纹以经向扎染形成的渐变色彩图案为特征，梳子形、流水形、巴旦木形等纹样竖向排列，色彩瑰丽如彩虹流淌',
    origin: '源自新疆和田地区两千年传承的经向扎染丝绸工艺，丝绸之路的明珠',
    meaning: '象征美丽生活、热情浪漫',
    history: '艾德莱斯绸有两千年历史，是丝绸之路上的珍贵织物，其独特的经向扎染工艺在全世界独一无二，现为国家级非遗项目',
    usageScenarios: ['民族服饰', '时尚设计', '家居装饰', '文创产品', '艺术收藏'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { bleedEffect: 50, stripeWidth: 40 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p034',
    name: '维吾尔族巴旦木纹',
    category: 'ethnic',
    subCategory: '维吾尔族纹样',
    previewUrl: '/static/patterns/uyghur-almond.png',
    description: '维吾尔族巴旦木纹以新疆特产巴旦木果实的杏仁形轮廓为基础，内部填充精细的花草卷纹，层层嵌套造型优雅饱满',
    origin: '源自维吾尔族对巴旦木树的喜爱，融合波斯佩斯利纹样传统发展而成',
    meaning: '象征丰收富饶、甜蜜生活',
    history: '巴旦木纹是维吾尔族装饰艺术的核心母题，广泛用于建筑、地毯、服饰中，与波斯佩斯利纹同源但发展出独特风格',
    usageScenarios: ['地毯编织', '建筑装饰', '服饰纹样', '包装设计', '首饰设计'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { nestingLayers: 3, innerFillDensity: 60 }
    },
    isBuiltin: true
  },
  {
    patternId: 'p035',
    name: '维吾尔族穹顶纹',
    category: 'ethnic',
    subCategory: '维吾尔族纹样',
    previewUrl: '/static/patterns/uyghur-dome.png',
    description: '维吾尔族穹顶纹取自清真寺穹顶内部的放射状几何图案，以中心点向四周辐射展开精密的几何与植物纹样，庄严而华丽',
    origin: '源自伊斯兰建筑穹顶装饰艺术，融合维吾尔族本土审美创造而成',
    meaning: '象征宇宙秩序、信仰庄严',
    history: '穹顶纹随伊斯兰建筑传入新疆已有千余年，在喀什艾提尕尔清真寺等建筑中达到极致，是维吾尔族建筑装饰的精华',
    usageScenarios: ['建筑装饰', '地毯设计', '天花板装饰', '文创产品', '室内设计'],
    parameters: {
      scale: 50,
      rotation: 0,
      opacity: 100,
      spacing: 50,
      advanced: { radialSegments: 8, symmetryOrder: 8 }
    },
    isBuiltin: true
  }
]

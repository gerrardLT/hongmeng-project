/**
 * MamaTrack 知识库服务
 * 提供孕期增重指南、饮食建议、运动建议、常见问题等知识内容
 * 使用内置静态数据，不依赖外部文件
 */
import type { KnowledgeItem } from '@/types/models'

/** 知识库静态数据 */
const KNOWLEDGE_DATA: KnowledgeItem[] = [
  // === guide（增重指南）===
  {
    id: 'guide_1',
    category: 'guide',
    title: '孕期增重总原则',
    summary: '了解孕期合理增重范围，根据孕前BMI管理体重',
    content: '孕期增重应因人而异，主要依据孕前BMI来制定合理的增重目标。BMI低于18.5的偏瘦孕妇建议增重12.5-18kg；BMI在18.5-24.9的正常体重孕妇建议增重11.5-16kg；BMI在25-29.9的超重孕妇建议增重7-11.5kg；BMI≥30的肥胖孕妇建议增重5-9kg。增重应循序渐进，避免暴饮暴食。',
    weekRange: [0, 40],
    icon: '📖'
  },
  {
    id: 'guide_2',
    category: 'guide',
    title: '孕早期增重要点',
    summary: '孕早期增重较少，约0.5-2kg，不必刻意多吃',
    content: '孕早期（1-12周）胎儿还很小，体重增长主要来自母体血容量增加、子宫和乳房增大等。正常体重孕妇整个孕早期增重约0.5-2kg即可，部分孕妇因孕吐反应甚至可能体重下降，这都是正常现象。不必在孕早期刻意加大食量，保持均衡饮食即可。',
    weekRange: [1, 12],
    icon: '📊'
  },
  {
    id: 'guide_3',
    category: 'guide',
    title: '孕中晚期增重节奏',
    summary: '孕中晚期每周增重0.3-0.5kg为宜，稳中有升',
    content: '孕中期（13-27周）开始胎儿快速发育，正常体重孕妇每周增重约0.35-0.5kg为宜。孕晚期（28-40周）继续保持每周0.35-0.5kg的增重速度。建议每周固定时间称量体重，如连续两周增重超过1.5kg或出现体重骤降，应及时就诊咨询医生。',
    weekRange: [13, 40],
    icon: '📈'
  },
  {
    id: 'guide_4',
    category: 'guide',
    title: '增重过快或过慢怎么办',
    summary: '增重偏离目标时及时调整饮食和运动方案',
    content: '增重过快时，应减少高热量零食和含糖饮料，增加蔬菜和优质蛋白摄入，适当增加散步等低强度运动。增重过慢时，可增加少食多餐的频率，选择营养密度高的食物如坚果、牛油果、全谷物等，避免空腹时间过长。无论哪种情况，都应在产检时与医生沟通，不要自行节食或大量进补。',
    weekRange: [4, 40],
    icon: '⚖️'
  },

  // === diet（饮食建议）===
  {
    id: 'diet_1',
    category: 'diet',
    title: '孕期每日营养摄入指南',
    summary: '均衡摄入蛋白质、碳水化合物、脂肪、维生素和矿物质',
    content: '孕期每日饮食应包含：优质蛋白（鸡蛋1个、牛奶300-500ml、瘦肉/鱼100-150g）、碳水化合物（全谷物为主，约200-250g生重）、蔬果（蔬菜300-500g、水果200-350g）、坚果（每天一小把约25g）。注意补充叶酸（400μg/天）、铁（24mg/天）、钙（800-1000mg/天）和DHA（200mg/天）。',
    weekRange: [1, 40],
    icon: '🥗'
  },
  {
    id: 'diet_2',
    category: 'diet',
    title: '缓解孕吐的饮食技巧',
    summary: '少食多餐、干稀搭配、选择清淡易消化食物',
    content: '孕吐期间建议：1.少食多餐，每隔1-2小时进食少量食物；2.晨起先吃几块苏打饼干再起床；3.选择干性食物如馒头、面包，避免油腻和辛辣；4.可以尝试生姜、柠檬等天然食材缓解恶心；5.补充维生素B6（遵医嘱）；6.两餐之间喝水，避免空腹或过饱。严重孕吐导致无法进食时应及时就医。',
    weekRange: [4, 16],
    icon: '🍵'
  },
  {
    id: 'diet_3',
    category: 'diet',
    title: '孕期补铁防贫血',
    summary: '多吃红肉、动物肝脏，搭配维C促进铁吸收',
    content: '孕中晚期铁需求量大增，建议每天摄入24mg铁。食补首选：瘦红肉（牛肉、猪肉）、动物肝脏（每周1-2次，每次约50g）、黑木耳、菠菜等。补铁技巧：搭配维生素C丰富的食物（如橙子、番茄）促进铁吸收；避免与茶、咖啡、牛奶同食影响吸收；如产检发现贫血，应在医生指导下补充铁剂。',
    weekRange: [13, 40],
    icon: '🥩'
  },
  {
    id: 'diet_4',
    category: 'diet',
    title: '控制血糖的饮食策略',
    summary: '选择低GI食物，控制精制碳水，合理搭配三大营养素',
    content: '预防妊娠糖尿病的饮食原则：1.主食选择低GI食物如糙米、燕麦、全麦面包；2.每餐碳水占比不超过40%，蛋白质25%，脂肪35%；3.水果在两餐之间食用，每天不超过350g，选择低糖水果如苹果、柚子；4.避免含糖饮料、甜点和精制零食；5.进餐顺序：先菜后肉最后主食，有助于平稳血糖。',
    weekRange: [13, 40],
    icon: '🥬'
  },

  // === exercise（运动建议）===
  {
    id: 'exercise_1',
    category: 'exercise',
    title: '孕期运动安全指南',
    summary: '无禁忌症的孕妇建议每天进行30分钟中等强度运动',
    content: '孕期运动总体原则：1.无产科禁忌症的孕妇建议每天30分钟中等强度有氧运动；2.运动时能正常说话但不能唱歌的强度为宜；3.避免仰卧位运动（孕16周后）、接触性运动、高空运动和潜水；4.运动前后注意热身和拉伸；5.出现阴道出血、规律宫缩、羊水流出、头晕胸痛等应立即停止并就医。',
    weekRange: [1, 40],
    icon: '🏃'
  },
  {
    id: 'exercise_2',
    category: 'exercise',
    title: '散步——最适合孕期的运动',
    summary: '每天30分钟散步，安全有效控制体重',
    content: '散步是孕期最安全、最易执行的运动方式。建议：1.选择平坦、空气清新的路线，避免人多拥挤处；2.穿舒适的平底鞋或运动鞋；3.每天30-40分钟，可分2次完成；4.步伐稳健，不宜过快，以微微出汗为宜；5.孕晚期可由家人陪伴；6.注意补充水分，避免空腹散步。散步不仅有助于控制体重，还能改善心情、促进睡眠。',
    weekRange: [1, 40],
    icon: '🚶'
  },
  {
    id: 'exercise_3',
    category: 'exercise',
    title: '孕期瑜伽入门',
    summary: '温和的瑜伽动作缓解腰背疼痛，改善体态',
    content: '孕期瑜伽的注意事项：1.选择专业的孕妇瑜伽课程或视频跟练；2.避免深度扭转、倒立、仰卧体式；3.重点练习骨盆底肌训练（凯格尔运动）、猫牛式、侧卧抬腿等温和体式；4.每个动作保持3-5个呼吸，不要过度拉伸；5.如有骨盆疼痛、先兆早产等应避免瑜伽；6.最佳练习时间为孕中期（14-28周），孕早期和晚期需更加谨慎。',
    weekRange: [14, 32],
    icon: '🧘'
  },
  {
    id: 'exercise_4',
    category: 'exercise',
    title: '凯格尔运动——盆底肌训练',
    summary: '每天练习盆底肌收缩，为分娩和产后恢复做准备',
    content: '凯格尔运动是孕期最重要的训练之一：1.找到盆底肌：想象小便时中断尿流的肌肉感觉；2.收缩盆底肌5秒，然后放松5秒，重复10次为一组；3.每天完成3组，可在坐、站、卧位时练习；4.注意只收缩盆底肌，不要同时收缩腹部、大腿或臀部肌肉；5.从孕中期开始坚持练习，可有效预防产后漏尿，有助于分娩和产后恢复。',
    weekRange: [13, 40],
    icon: '💪'
  },

  // === faq（常见问题）===
  {
    id: 'faq_1',
    category: 'faq',
    title: '孕期体重增长不均匀正常吗',
    summary: '体重波动是正常的，关键是长期趋势是否在合理范围',
    content: '孕期体重增长不是线性均匀的，出现波动是完全正常的。影响因素包括：1.水分滞留（尤其是孕晚期可能导致短期内体重快速增加）；2.便秘（可能使体重暂时偏高）；3.孕吐（孕早期可能使体重下降）；4.食欲变化（某几天吃得多些或少些）。建议关注每周平均增重趋势，而非单次称重数据。如一周内体重增加超过1.5kg或连续两周增重异常，建议咨询医生。',
    weekRange: [1, 40],
    icon: '❓'
  },
  {
    id: 'faq_2',
    category: 'faq',
    title: '双胎妊娠的增重标准',
    summary: '双胎孕妇推荐增重比单胎多，需更密切监测',
    content: '双胎妊娠的增重建议与单胎不同：正常体重孕妇推荐增重约17-25kg；超重孕妇推荐增重约14-23kg；肥胖孕妇推荐增重约11-19kg。双胎孕妇孕早期建议增重2-4kg，之后每周增重约0.5-0.7kg。双胎妊娠属于高危妊娠，体重监测频率应更高，建议每1-2周称重一次，并定期产检评估胎儿发育情况。',
    weekRange: [1, 40],
    icon: '👶'
  },
  {
    id: 'faq_3',
    category: 'faq',
    title: '称重的最佳时间和频率',
    summary: '每周固定时间称重，晨起排尿后最为准确',
    content: '准确称重的小技巧：1.最佳时间：每天早晨起床排尿后、进食前；2.穿着相似（或只穿内衣）；3.使用同一台体重秤放在硬质地面上；4.每周称重1-2次即可，不必每天称量；5.记录体重时也记录日期，方便观察趋势；6.如果某天体重波动较大，不必焦虑，关注周趋势更准确。本应用会自动帮您追踪体重趋势并评估增重状态。',
    weekRange: [1, 40],
    icon: '📐'
  }
]

/**
 * 获取知识列表
 * @param category 分类过滤，不传则返回全部
 */
export function getKnowledgeList(category?: string): KnowledgeItem[] {
  try {
    if (category) {
      return KNOWLEDGE_DATA.filter((item) => item.category === category)
    }
    return KNOWLEDGE_DATA
  } catch (e) {
    console.error('[knowledge service] getKnowledgeList error:', e)
    return []
  }
}

/**
 * 获取单条知识
 */
export function getKnowledgeById(id: string): KnowledgeItem | null {
  try {
    return KNOWLEDGE_DATA.find((item) => item.id === id) || null
  } catch (e) {
    console.error('[knowledge service] getKnowledgeById error:', e)
    return null
  }
}

/**
 * 按孕周推荐知识
 * 返回适用孕周范围包含当前周的知识条目
 */
export function getKnowledgeForWeek(week: number): KnowledgeItem[] {
  try {
    return KNOWLEDGE_DATA.filter((item) => {
      if (!item.weekRange) return true
      return week >= item.weekRange[0] && week <= item.weekRange[1]
    })
  } catch (e) {
    console.error('[knowledge service] getKnowledgeForWeek error:', e)
    return []
  }
}

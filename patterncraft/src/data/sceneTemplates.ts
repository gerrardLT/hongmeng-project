export interface SceneTemplateData {
  templateId: string
  name: string
  type: 'wallpaper' | 'card' | 'invitation' | 'preview'
  layout: string
  description: string
}

export const sceneTemplates: SceneTemplateData[] = [
  // ========== 壁纸模板 (3种) ==========
  {
    templateId: 'st001',
    name: '经典平铺壁纸',
    type: 'wallpaper',
    layout: 'tile',
    description: '纹样按规律平铺排列，覆盖整个屏幕，适合作为手机或电脑桌面壁纸，呈现传统织物般的韵律美感'
  },
  {
    templateId: 'st002',
    name: '居中点缀壁纸',
    type: 'wallpaper',
    layout: 'center',
    description: '单个纹样居中放大展示，四周以纯色或渐变背景衬托，突出纹样主体，适合极简风格壁纸'
  },
  {
    templateId: 'st003',
    name: '渐变融合壁纸',
    type: 'wallpaper',
    layout: 'gradient',
    description: '纹样从中心向四周渐变透明，与背景色自然融合，营造朦胧典雅的意境效果'
  },

  // ========== 贺卡模板 (10种) ==========
  {
    templateId: 'st004',
    name: '春节祝福贺卡',
    type: 'card',
    layout: 'festival-vertical',
    description: '竖版春节贺卡，上方纹样装饰边框，中部留白书写祝福，底部点缀吉祥元素，喜庆红金配色'
  },
  {
    templateId: 'st005',
    name: '春节团圆贺卡',
    type: 'card',
    layout: 'festival-horizontal',
    description: '横版春节贺卡，左侧大幅纹样图案，右侧文字区域，适合新年问候与家庭祝福'
  },
  {
    templateId: 'st006',
    name: '春节福字贺卡',
    type: 'card',
    layout: 'festival-center',
    description: '居中福字造型贺卡，纹样环绕福字排列，四角装饰云纹，传统年味浓郁'
  },
  {
    templateId: 'st007',
    name: '中秋团圆贺卡',
    type: 'card',
    layout: 'midautumn-round',
    description: '圆形构图中秋贺卡，纹样环绕月亮造型排列，暖黄色调，洋溢团圆温馨氛围'
  },
  {
    templateId: 'st008',
    name: '中秋赏月贺卡',
    type: 'card',
    layout: 'midautumn-landscape',
    description: '横幅中秋贺卡，上部月亮与纹样交织，下部山水剪影，意境悠远淡雅'
  },
  {
    templateId: 'st009',
    name: '生日快乐贺卡',
    type: 'card',
    layout: 'birthday-festive',
    description: '生日祝福贺卡，纹样组成花环造型环绕祝福文字，色彩明快活泼，适合各年龄段'
  },
  {
    templateId: 'st010',
    name: '生日雅致贺卡',
    type: 'card',
    layout: 'birthday-elegant',
    description: '典雅风格生日贺卡，纹样作为精致边框装饰，留白大方，适合长辈或正式场合'
  },
  {
    templateId: 'st011',
    name: '通用祝福贺卡',
    type: 'card',
    layout: 'general-blessing',
    description: '多用途祝福贺卡，简约纹样装饰上下边缘，中部大面积留白，适合各类节日与场合'
  },
  {
    templateId: 'st012',
    name: '通用感谢贺卡',
    type: 'card',
    layout: 'general-thanks',
    description: '感谢贺卡模板，纹样作为角落装饰点缀，整体素雅温馨，适合表达感恩之情'
  },
  {
    templateId: 'st013',
    name: '通用邀约贺卡',
    type: 'card',
    layout: 'general-invite',
    description: '活动邀约贺卡，纹样边框环绕活动信息区域，正式大方，适合各类聚会邀请'
  },

  // ========== 请柬模板 (8种) ==========
  {
    templateId: 'st014',
    name: '中式婚礼请柬·龙凤呈祥',
    type: 'invitation',
    layout: 'wedding-dragon-phoenix',
    description: '龙凤纹样对称排列的中式婚礼请柬，大红底色配金色纹样，庄重喜庆，适合传统中式婚礼'
  },
  {
    templateId: 'st015',
    name: '中式婚礼请柬·花好月圆',
    type: 'invitation',
    layout: 'wedding-floral',
    description: '牡丹与缠枝纹组合的婚礼请柬，花开富贵寓意美满，配色温婉典雅，适合新中式婚礼'
  },
  {
    templateId: 'st016',
    name: '中式婚礼请柬·琴瑟和鸣',
    type: 'invitation',
    layout: 'wedding-elegant',
    description: '简约中式风格婚礼请柬，如意纹与回纹边框装饰，留白优雅，适合文艺气质的新人'
  },
  {
    templateId: 'st017',
    name: '满月宴请柬·喜得贵子',
    type: 'invitation',
    layout: 'baby-festive',
    description: '满月酒请柬，蝙蝠纹与祥云纹装饰，粉红或浅蓝底色，喜气洋洋，祝愿宝宝健康成长'
  },
  {
    templateId: 'st018',
    name: '满月宴请柬·百日之喜',
    type: 'invitation',
    layout: 'baby-hundred-days',
    description: '百日宴请柬，莲花纹与如意纹组合，清新雅致，象征纯洁吉祥，适合百日或周岁宴'
  },
  {
    templateId: 'st019',
    name: '寿宴请柬·福寿绵长',
    type: 'invitation',
    layout: 'birthday-longevity',
    description: '寿宴请柬，仙鹤纹与万字纹装饰，金色与朱红搭配，寓意福寿安康，适合长辈寿诞'
  },
  {
    templateId: 'st020',
    name: '寿宴请柬·松鹤延年',
    type: 'invitation',
    layout: 'birthday-crane-pine',
    description: '高雅寿宴请柬，鹤纹与松竹纹组合，水墨风格，意境深远，适合文人雅士风格的寿宴'
  },
  {
    templateId: 'st021',
    name: '乔迁请柬·紫气东来',
    type: 'invitation',
    layout: 'housewarming',
    description: '乔迁之喜请柬，回纹边框配如意纹角花，典雅庄重，祝愿新居吉祥如意、幸福安康'
  },

  // ========== 周边预览模板 (5种) ==========
  {
    templateId: 'st022',
    name: '手机壳预览',
    type: 'preview',
    layout: 'phone-case',
    description: '手机壳效果预览，纹样贴合手机壳曲面展示，支持多种机型模板，直观呈现实物效果'
  },
  {
    templateId: 'st023',
    name: '丝巾预览',
    type: 'preview',
    layout: 'silk-scarf',
    description: '方形丝巾效果预览，纹样按对称布局平铺，模拟丝绸质感光泽，展现高端定制效果'
  },
  {
    templateId: 'st024',
    name: '帆布袋预览',
    type: 'preview',
    layout: 'tote-bag',
    description: '帆布袋效果预览，纹样印制于帆布袋正面，模拟布料纹理质感，适合文创周边展示'
  },
  {
    templateId: 'st025',
    name: 'T恤预览',
    type: 'preview',
    layout: 't-shirt',
    description: 'T恤效果预览，纹样印制于T恤胸前区域，支持白色和黑色底衫切换，展现穿着效果'
  },
  {
    templateId: 'st026',
    name: '马克杯预览',
    type: 'preview',
    layout: 'mug',
    description: '马克杯效果预览，纹样环绕杯身展示，模拟陶瓷质感与弧度变形，适合定制礼品展示'
  }
]

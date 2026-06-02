/**
 * 生成 35 张纹样预览图
 * 使用 @napi-rs/canvas 在 Node.js 中绘制并输出 PNG
 */
'use strict';
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const trad = require('./draw-traditional');
const ethnic = require('./draw-ethnic');

const WIDTH = 400;
const HEIGHT = 400;
const BG_COLOR = '#FFF8F0';
const PRIMARY = '#C41A16';
const GOLD = '#D4A843';
const GREEN = '#7BAA8E';
const INK = '#2C2C2C';

const OUTPUT_DIR = path.resolve(__dirname, '..', 'src', 'static', 'patterns');

// 确保输出目录存在
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * 创建画布并填充背景
 */
function makeCanvas() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  return { canvas, ctx };
}

/**
 * 以 4x4 平铺方式绘制纹样
 */
function tilePattern(ctx, drawFn, color, cols = 4, rows = 4, unitSize = 70) {
  const xGap = WIDTH / cols;
  const yGap = HEIGHT / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = xGap * (c + 0.5);
      const cy = yGap * (r + 0.5);
      drawFn(ctx, cx, cy, unitSize, color);
    }
  }
}

/**
 * 单个纹样居中绘制
 */
function centerPattern(ctx, drawFn, color, unitSize = 200) {
  drawFn(ctx, WIDTH / 2, HEIGHT / 2, unitSize, color);
}

/**
 * 保存画布到文件
 */
function saveCanvas(canvas, id) {
  const buf = canvas.toBuffer('image/png');
  const filePath = path.join(OUTPUT_DIR, `${id}.png`);
  fs.writeFileSync(filePath, buf);
  console.log(`  ✓ ${id}.png (${buf.length} bytes)`);
}

// =============== 定义每个纹样的生成方式 ===============

const patterns = [
  // 已有算法的6种 - 平铺展示
  { id: 'p001', name: '云纹', draw: (ctx) => tilePattern(ctx, trad.drawCloud, PRIMARY) },
  { id: 'p002', name: '回纹', draw: (ctx) => tilePattern(ctx, trad.drawFret, PRIMARY, 5, 5, 55) },
  { id: 'p003', name: '如意纹', draw: (ctx) => tilePattern(ctx, trad.drawRuyi, PRIMARY) },
  { id: 'p004', name: '缠枝纹', draw: (ctx) => tilePattern(ctx, trad.drawScroll, GREEN) },
  { id: 'p005', name: '万字纹', draw: (ctx) => tilePattern(ctx, trad.drawSwastika, PRIMARY, 5, 5, 55) },
  { id: 'p006', name: '水波纹', draw: (ctx) => tilePattern(ctx, trad.drawWave, '#3A6B8A', 3, 4, 120) },

  // 瑞兽类 - 居中展示
  { id: 'p007', name: '龙纹', draw: (ctx) => centerPattern(ctx, trad.drawDragon, PRIMARY, 280) },
  { id: 'p008', name: '凤纹', draw: (ctx) => centerPattern(ctx, trad.drawPhoenix, PRIMARY, 280) },
  { id: 'p009', name: '麒麟纹', draw: (ctx) => centerPattern(ctx, trad.drawQilin, PRIMARY, 280) },

  // 吉祥纹样 - 居中/平铺
  { id: 'p010', name: '莲花纹', draw: (ctx) => centerPattern(ctx, trad.drawLotus, PRIMARY, 300) },
  { id: 'p011', name: '牡丹纹', draw: (ctx) => centerPattern(ctx, trad.drawPeony, PRIMARY, 300) },
  { id: 'p012', name: '蝙蝠纹', draw: (ctx) => tilePattern(ctx, trad.drawBat, PRIMARY, 3, 3, 110) },

  // 动物纹样
  { id: 'p013', name: '鹿纹', draw: (ctx) => centerPattern(ctx, trad.drawDeer, INK, 300) },
  { id: 'p014', name: '仙鹤纹', draw: (ctx) => centerPattern(ctx, trad.drawCrane, INK, 280) },
  { id: 'p015', name: '鱼纹', draw: (ctx) => tilePattern(ctx, trad.drawFish, PRIMARY, 3, 3, 100) },
  { id: 'p016', name: '蝴蝶纹', draw: (ctx) => tilePattern(ctx, trad.drawButterfly, PRIMARY, 3, 3, 100) },

  // 植物几何
  { id: 'p017', name: '石榴纹', draw: (ctx) => centerPattern(ctx, trad.drawPomegranate, GREEN, 300) },
  { id: 'p018', name: '竹纹', draw: (ctx) => centerPattern(ctx, trad.drawBamboo, GREEN, 300) },
  { id: 'p019', name: '梅花纹', draw: (ctx) => centerPattern(ctx, trad.drawPlumBlossom, PRIMARY, 350) },
  { id: 'p020', name: '铜钱纹', draw: (ctx) => tilePattern(ctx, trad.drawCoin, GOLD, 4, 4, 75) },

  // 苗族
  { id: 'p021', name: '苗族蜡染纹', draw: (ctx) => tilePattern(ctx, ethnic.drawMiaoBatik, null, 3, 3, 120) },
  { id: 'p022', name: '苗族刺绣纹', draw: (ctx) => centerPattern(ctx, ethnic.drawMiaoEmbroidery, null, 350) },
  { id: 'p023', name: '苗族银饰纹', draw: (ctx) => centerPattern(ctx, ethnic.drawMiaoSilver, null, 300) },

  // 藏族
  { id: 'p024', name: '藏族唐卡纹', draw: (ctx) => centerPattern(ctx, ethnic.drawTibetanThangka, null, 320) },
  { id: 'p025', name: '藏族吉祥八宝纹', draw: (ctx) => centerPattern(ctx, ethnic.drawTibetanEightTreasures, null, 350) },
  { id: 'p026', name: '藏族格桑花纹', draw: (ctx) => centerPattern(ctx, ethnic.drawTibetanGesang, null, 350) },

  // 彝族
  { id: 'p027', name: '彝族刺绣几何纹', draw: (ctx) => centerPattern(ctx, ethnic.drawYiGeometric, null, 350) },
  { id: 'p028', name: '彝族火纹', draw: (ctx) => centerPattern(ctx, ethnic.drawYiFire, null, 350) },
  { id: 'p029', name: '彝族虎纹', draw: (ctx) => centerPattern(ctx, ethnic.drawYiTiger, null, 320) },

  // 壮族
  { id: 'p030', name: '壮族织锦纹', draw: (ctx) => centerPattern(ctx, ethnic.drawZhuangBrocade, null, 380) },
  { id: 'p031', name: '壮族铜鼓纹', draw: (ctx) => centerPattern(ctx, ethnic.drawZhuangBronzeDrum, null, 350) },
  { id: 'p032', name: '壮族花山壁画纹', draw: (ctx) => centerPattern(ctx, ethnic.drawZhuangHuashan, null, 350) },

  // 维吾尔族
  { id: 'p033', name: '维吾尔族艾德莱斯绸纹', draw: (ctx) => centerPattern(ctx, ethnic.drawUyghurAtlas, null, 380) },
  { id: 'p034', name: '维吾尔族巴旦木纹', draw: (ctx) => centerPattern(ctx, ethnic.drawUyghurAlmond, null, 350) },
  { id: 'p035', name: '维吾尔族穹顶纹', draw: (ctx) => centerPattern(ctx, ethnic.drawUyghurDome, null, 350) },
];

// =============== 主流程 ===============

console.log(`正在生成 ${patterns.length} 张纹样预览图...`);
console.log(`输出目录: ${OUTPUT_DIR}\n`);

let success = 0;
let failed = 0;

for (const p of patterns) {
  try {
    const { canvas, ctx } = makeCanvas();
    p.draw(ctx);
    saveCanvas(canvas, p.id);
    success++;
  } catch (err) {
    console.error(`  ✗ ${p.id} (${p.name}): ${err.message}`);
    failed++;
  }
}

console.log(`\n完成！成功 ${success} 个，失败 ${failed} 个`);
if (failed > 0) process.exit(1);

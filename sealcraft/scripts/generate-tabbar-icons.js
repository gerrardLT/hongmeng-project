const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 81;
const LINE_WIDTH = 2.5;
const COLOR_DEFAULT = '#999999';
const COLOR_ACTIVE = '#C41A1A';
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'static', 'tabbar');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function createIcon(drawFn, color) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  drawFn(ctx, color);
  return canvas.toBuffer('image/png');
}

// ===== 1. HOME — 房子图标 =====
function drawHome(ctx, color) {
  const cx = 40.5;

  // 屋顶（三角形）
  ctx.beginPath();
  ctx.moveTo(cx, 12);
  ctx.lineTo(12, 38);
  ctx.lineTo(69, 38);
  ctx.closePath();
  ctx.stroke();

  // 房身（矩形）
  ctx.beginPath();
  ctx.rect(18, 38, 45, 28);
  ctx.stroke();

  // 门（矩形）
  ctx.beginPath();
  ctx.rect(33, 50, 15, 16);
  ctx.stroke();
}

// ===== 2. KNOWLEDGE — 书本/知识图标 =====
function drawKnowledge(ctx, color) {
  const cx = 40.5;

  // 书本外轮廓
  ctx.beginPath();
  ctx.rect(14, 14, 53, 53);
  ctx.stroke();

  // 书脊线（左侧竖线）
  ctx.beginPath();
  ctx.moveTo(26, 14);
  ctx.lineTo(26, 67);
  ctx.stroke();

  // 横线1（文字行模拟）
  ctx.beginPath();
  ctx.moveTo(33, 28);
  ctx.lineTo(60, 28);
  ctx.stroke();

  // 横线2
  ctx.beginPath();
  ctx.moveTo(33, 38);
  ctx.lineTo(60, 38);
  ctx.stroke();

  // 横线3
  ctx.beginPath();
  ctx.moveTo(33, 48);
  ctx.lineTo(60, 48);
  ctx.stroke();

  // 顶部书签折角
  ctx.beginPath();
  ctx.moveTo(53, 14);
  ctx.lineTo(53, 26);
  ctx.lineTo(61, 20);
  ctx.closePath();
  ctx.fill();
}

// ===== 3. DESIGN — 设计/印章图标 =====
function drawDesign(ctx, color) {
  const cx = 40.5, cy = 40.5;

  // 印章外圆
  ctx.beginPath();
  ctx.arc(cx, cy, 26, 0, Math.PI * 2);
  ctx.stroke();

  // 内圆
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.stroke();

  // 印章柄（顶部矩形）
  ctx.beginPath();
  ctx.rect(cx - 8, 8, 16, 8);
  ctx.stroke();

  // 连接柄与印章的竖线
  ctx.beginPath();
  ctx.moveTo(cx, 16);
  ctx.lineTo(cx, cy - 18);
  ctx.stroke();

  // 中心文字装饰（菱形）
  ctx.beginPath();
  ctx.moveTo(cx, cy - 8);
  ctx.lineTo(cx + 8, cy);
  ctx.lineTo(cx, cy + 8);
  ctx.lineTo(cx - 8, cy);
  ctx.closePath();
  ctx.stroke();
}

// ===== 4. BOOKING — 预约/日历图标 =====
function drawBooking(ctx, color) {
  const x = 14, y = 16, w = 53, h = 50;

  // 日历外框
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.stroke();

  // 顶部横线（日历头部）
  ctx.beginPath();
  ctx.moveTo(x, y + 14);
  ctx.lineTo(x + w, y + 14);
  ctx.stroke();

  // 左侧挂环
  ctx.beginPath();
  ctx.moveTo(26, y);
  ctx.lineTo(26, y + 8);
  ctx.stroke();

  // 右侧挂环
  ctx.beginPath();
  ctx.moveTo(55, y);
  ctx.lineTo(55, y + 8);
  ctx.stroke();

  // 日期网格点（2行3列）
  const dotR = 2.5;
  const startX = 26, startY = 32;
  const colGap = 14, rowGap = 12;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      ctx.beginPath();
      ctx.arc(startX + col * colGap, startY + row * rowGap, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ===== 5. PROFILE — 用户头像图标 =====
function drawProfile(ctx, color) {
  const cx = 40.5;

  // 头部圆形
  ctx.beginPath();
  ctx.arc(cx, 28, 13, 0, Math.PI * 2);
  ctx.stroke();

  // 肩膀弧线
  ctx.beginPath();
  ctx.moveTo(14, 68);
  ctx.quadraticCurveTo(14, 48, cx, 46);
  ctx.quadraticCurveTo(67, 48, 67, 68);
  ctx.stroke();

  // 底部横线封口
  ctx.beginPath();
  ctx.moveTo(14, 68);
  ctx.lineTo(67, 68);
  ctx.stroke();
}

// ===== 生成所有图标 =====
const icons = [
  { name: 'home', draw: drawHome },
  { name: 'knowledge', draw: drawKnowledge },
  { name: 'design', draw: drawDesign },
  { name: 'booking', draw: drawBooking },
  { name: 'profile', draw: drawProfile },
];

console.log('开始生成 SealCraft TabBar 图标...');
console.log(`输出目录: ${OUTPUT_DIR}\n`);

for (const icon of icons) {
  // 默认态
  const defaultBuf = createIcon(icon.draw, COLOR_DEFAULT);
  const defaultPath = path.join(OUTPUT_DIR, `${icon.name}.png`);
  fs.writeFileSync(defaultPath, defaultBuf);
  console.log(`✓ ${icon.name}.png (${defaultBuf.length} bytes)`);

  // 选中态
  const activeBuf = createIcon(icon.draw, COLOR_ACTIVE);
  const activePath = path.join(OUTPUT_DIR, `${icon.name}-active.png`);
  fs.writeFileSync(activePath, activeBuf);
  console.log(`✓ ${icon.name}-active.png (${activeBuf.length} bytes)`);
}

console.log('\n全部 10 个图标生成完成！');

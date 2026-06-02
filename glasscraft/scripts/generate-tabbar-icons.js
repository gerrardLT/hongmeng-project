const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 81;
const LINE_WIDTH = 2.5;
const COLOR_DEFAULT = '#BDBDBD';
const COLOR_ACTIVE = '#FF6B6B';
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

// ===== 2. EXPLORE — 指南针图标 =====
function drawExplore(ctx, color) {
  const cx = 40.5, cy = 40.5;
  const r = 28;

  // 外圈
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // 指南针菱形指针
  ctx.beginPath();
  ctx.moveTo(cx, cy - 20);
  ctx.lineTo(cx + 8, cy);
  ctx.lineTo(cx, cy + 20);
  ctx.lineTo(cx - 8, cy);
  ctx.closePath();
  ctx.stroke();

  // 中心点
  ctx.beginPath();
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

// ===== 3. BOOKING — 日历图标 =====
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

// ===== 4. ARTWORK — 画笔图标 =====
function drawArtwork(ctx, color) {
  // 画板（圆角矩形）
  const bx = 16, by = 12, bw = 49, bh = 42, br = 4;
  ctx.beginPath();
  ctx.moveTo(bx + br, by);
  ctx.lineTo(bx + bw - br, by);
  ctx.arcTo(bx + bw, by, bx + bw, by + br, br);
  ctx.lineTo(bx + bw, by + bh - br);
  ctx.arcTo(bx + bw, by + bh, bx + bw - br, by + bh, br);
  ctx.lineTo(bx + br, by + bh);
  ctx.arcTo(bx, by + bh, bx, by + bh - br, br);
  ctx.lineTo(bx, by + br);
  ctx.arcTo(bx, by, bx + br, by, br);
  ctx.closePath();
  ctx.stroke();

  // 画笔杆（从画板右下角延伸）
  ctx.beginPath();
  ctx.moveTo(56, 48);
  ctx.lineTo(68, 68);
  ctx.stroke();

  // 画笔尖
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(65, 63);
  ctx.lineTo(70, 71);
  ctx.stroke();
  ctx.lineWidth = LINE_WIDTH;

  // 画板上的小山装饰
  ctx.beginPath();
  ctx.moveTo(22, 46);
  ctx.lineTo(32, 30);
  ctx.lineTo(40, 40);
  ctx.lineTo(48, 28);
  ctx.lineTo(58, 46);
  ctx.stroke();

  // 小太阳
  ctx.beginPath();
  ctx.arc(50, 22, 4, 0, Math.PI * 2);
  ctx.stroke();
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
  { name: 'explore', draw: drawExplore },
  { name: 'booking', draw: drawBooking },
  { name: 'artwork', draw: drawArtwork },
  { name: 'profile', draw: drawProfile },
];

console.log('开始生成 GlassCraft TabBar 图标...');
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

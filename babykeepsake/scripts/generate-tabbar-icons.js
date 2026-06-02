const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 81;
const LINE_WIDTH = 2.5;
const COLOR_DEFAULT = '#BDBDBD';
const COLOR_ACTIVE = '#FF6B35';
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

// ===== 4. PROGRESS — 进度条/时钟图标 =====
function drawProgress(ctx, color) {
  const cx = 40.5, cy = 40.5;
  const r = 26;

  // 外圈（时钟轮廓）
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // 时针
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy - 16);
  ctx.stroke();

  // 分针
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + 12, cy + 4);
  ctx.stroke();

  ctx.lineWidth = LINE_WIDTH;

  // 中心圆点
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();

  // 底部进度弧线（表示进度）
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 5, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  ctx.lineWidth = LINE_WIDTH;
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
  { name: 'progress', draw: drawProgress },
  { name: 'profile', draw: drawProfile },
];

console.log('开始生成 BabyKeepsake TabBar 图标...');
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

const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 81;
const LINE_WIDTH = 2.5;
const COLOR_DEFAULT = '#BDBDBD';
const COLOR_ACTIVE = '#FF6B35';
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'static', 'images', 'tabbar');

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

// ===== 1. WEATHER — 太阳图标（圆形+光线） =====
function drawWeather(ctx, color) {
  const cx = 40.5, cy = 40.5;
  const r = 14;

  // 太阳圆形
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // 光线（8条）
  const rayLen = 8;
  const gap = 4;
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const x1 = cx + Math.cos(angle) * (r + gap);
    const y1 = cy + Math.sin(angle) * (r + gap);
    const x2 = cx + Math.cos(angle) * (r + gap + rayLen);
    const y2 = cy + Math.sin(angle) * (r + gap + rayLen);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

// ===== 2. TIDES — 波浪图标（双波浪线） =====
function drawTides(ctx, color) {
  ctx.lineWidth = 3;

  // 第一条波浪（上方）
  ctx.beginPath();
  ctx.moveTo(8, 32);
  ctx.quadraticCurveTo(20, 20, 32, 32);
  ctx.quadraticCurveTo(44, 44, 56, 32);
  ctx.quadraticCurveTo(64, 24, 73, 32);
  ctx.stroke();

  // 第二条波浪（下方）
  ctx.beginPath();
  ctx.moveTo(8, 50);
  ctx.quadraticCurveTo(20, 38, 32, 50);
  ctx.quadraticCurveTo(44, 62, 56, 50);
  ctx.quadraticCurveTo(64, 42, 73, 50);
  ctx.stroke();

  ctx.lineWidth = LINE_WIDTH;
}

// ===== 3. SPOTS — 地图标记图标（定位pin） =====
function drawSpots(ctx, color) {
  const cx = 40.5;

  // 外部水滴形状（定位 pin）
  ctx.beginPath();
  ctx.moveTo(cx, 68);
  // 左侧曲线
  ctx.quadraticCurveTo(16, 42, 16, 32);
  // 顶部半圆
  ctx.arc(cx, 32, 24.5, Math.PI, 0, false);
  // 右侧曲线
  ctx.quadraticCurveTo(65, 42, cx, 68);
  ctx.stroke();

  // 内部小圆
  ctx.beginPath();
  ctx.arc(cx, 32, 10, 0, Math.PI * 2);
  ctx.stroke();
}

// ===== 4. CATCHES — 鱼形图标 =====
function drawCatches(ctx, color) {
  const cx = 40.5, cy = 40.5;

  // 鱼身（椭圆形）
  ctx.beginPath();
  ctx.moveTo(14, cy);
  // 上半身
  ctx.quadraticCurveTo(28, 20, 52, 24);
  ctx.quadraticCurveTo(62, 26, 62, cy);
  // 下半身
  ctx.quadraticCurveTo(62, 54, 52, 56);
  ctx.quadraticCurveTo(28, 60, 14, cy);
  ctx.stroke();

  // 鱼尾
  ctx.beginPath();
  ctx.moveTo(14, cy);
  ctx.lineTo(4, 28);
  ctx.quadraticCurveTo(12, cy, 4, 52);
  ctx.lineTo(14, cy);
  ctx.stroke();

  // 鱼眼
  ctx.beginPath();
  ctx.arc(52, 38, 3, 0, Math.PI * 2);
  ctx.fill();

  // 鱼鳍（背鳍）
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(32, 27);
  ctx.quadraticCurveTo(38, 16, 46, 26);
  ctx.stroke();

  // 鱼鳞线条
  ctx.beginPath();
  ctx.moveTo(30, 32);
  ctx.quadraticCurveTo(34, cy, 30, 48);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(40, 30);
  ctx.quadraticCurveTo(44, cy, 40, 50);
  ctx.stroke();

  ctx.lineWidth = LINE_WIDTH;
}

// ===== 5. PROFILE — 人物头像图标 =====
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
  { name: 'weather', draw: drawWeather },
  { name: 'tides', draw: drawTides },
  { name: 'spots', draw: drawSpots },
  { name: 'catches', draw: drawCatches },
  { name: 'profile', draw: drawProfile },
];

console.log('开始生成 AnglerMate TabBar 图标...');
console.log(`输出目录: ${OUTPUT_DIR}\n`);

for (const icon of icons) {
  // 默认态
  const defaultBuf = createIcon(icon.draw, COLOR_DEFAULT);
  const defaultPath = path.join(OUTPUT_DIR, `${icon.name}.png`);
  fs.writeFileSync(defaultPath, defaultBuf);
  console.log(`✓ ${icon.name}.png (${defaultBuf.length} bytes)`);

  // 选中态
  const activeBuf = createIcon(icon.draw, COLOR_ACTIVE);
  const activePath = path.join(OUTPUT_DIR, `${icon.name}_selected.png`);
  fs.writeFileSync(activePath, activeBuf);
  console.log(`✓ ${icon.name}_selected.png (${activeBuf.length} bytes)`);
}

console.log('\n全部 10 个图标生成完成！');

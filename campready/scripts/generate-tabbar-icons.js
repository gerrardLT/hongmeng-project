const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 81;
const LINE_WIDTH = 2.5;
const COLOR_DEFAULT = '#BDBDBD';
const COLOR_ACTIVE = '#2E7D32';
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

// ===== 1. HOME — 房子图标 =====
function drawHome(ctx) {
  const cx = 40.5;
  // 屋顶
  ctx.beginPath();
  ctx.moveTo(cx, 12);
  ctx.lineTo(12, 38);
  ctx.lineTo(69, 38);
  ctx.closePath();
  ctx.stroke();

  // 房身
  ctx.beginPath();
  ctx.moveTo(18, 38);
  ctx.lineTo(18, 68);
  ctx.lineTo(63, 68);
  ctx.lineTo(63, 38);
  ctx.stroke();

  // 门
  ctx.beginPath();
  ctx.moveTo(33, 68);
  ctx.lineTo(33, 50);
  ctx.lineTo(48, 50);
  ctx.lineTo(48, 68);
  ctx.stroke();
}

// ===== 2. CHECKLISTS — 清单勾选图标 =====
function drawChecklists(ctx) {
  // 纸张外框
  ctx.beginPath();
  ctx.moveTo(16, 10);
  ctx.lineTo(65, 10);
  ctx.lineTo(65, 71);
  ctx.lineTo(16, 71);
  ctx.closePath();
  ctx.stroke();

  // 勾选框1 + 勾
  ctx.beginPath();
  ctx.rect(22, 18, 10, 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(24, 23);
  ctx.lineTo(26, 26);
  ctx.lineTo(30, 20);
  ctx.stroke();
  // 文字线1
  ctx.beginPath();
  ctx.moveTo(38, 23);
  ctx.lineTo(58, 23);
  ctx.stroke();

  // 勾选框2 + 勾
  ctx.beginPath();
  ctx.rect(22, 34, 10, 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(24, 39);
  ctx.lineTo(26, 42);
  ctx.lineTo(30, 36);
  ctx.stroke();
  // 文字线2
  ctx.beginPath();
  ctx.moveTo(38, 39);
  ctx.lineTo(58, 39);
  ctx.stroke();

  // 空勾选框3
  ctx.beginPath();
  ctx.rect(22, 50, 10, 10);
  ctx.stroke();
  // 文字线3
  ctx.beginPath();
  ctx.moveTo(38, 55);
  ctx.lineTo(58, 55);
  ctx.stroke();
}

// ===== 3. GEAR — 背包图标 =====
function drawGear(ctx) {
  const cx = 40.5;

  // 背包顶部提手
  ctx.beginPath();
  ctx.moveTo(32, 16);
  ctx.quadraticCurveTo(cx, 8, 49, 16);
  ctx.stroke();

  // 背包主体
  ctx.beginPath();
  ctx.moveTo(18, 16);
  ctx.lineTo(18, 62);
  ctx.quadraticCurveTo(18, 70, 26, 70);
  ctx.lineTo(55, 70);
  ctx.quadraticCurveTo(63, 70, 63, 62);
  ctx.lineTo(63, 16);
  ctx.closePath();
  ctx.stroke();

  // 背包口袋
  ctx.beginPath();
  ctx.moveTo(24, 46);
  ctx.lineTo(24, 62);
  ctx.lineTo(57, 62);
  ctx.lineTo(57, 46);
  ctx.closePath();
  ctx.stroke();

  // 拉链线
  ctx.beginPath();
  ctx.moveTo(18, 34);
  ctx.lineTo(63, 34);
  ctx.stroke();
}

// ===== 4. STATS — 柱状图图标 =====
function drawStats(ctx) {
  // X轴
  ctx.beginPath();
  ctx.moveTo(12, 68);
  ctx.lineTo(69, 68);
  ctx.stroke();

  // Y轴
  ctx.beginPath();
  ctx.moveTo(12, 12);
  ctx.lineTo(12, 68);
  ctx.stroke();

  // 柱子1
  ctx.fillRect(20, 48, 10, 20);
  // 柱子2
  ctx.fillRect(35, 28, 10, 40);
  // 柱子3
  ctx.fillRect(50, 38, 10, 30);
}

// ===== 5. PROFILE — 人物头像图标 =====
function drawProfile(ctx) {
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
  { name: 'checklists', draw: drawChecklists },
  { name: 'gear', draw: drawGear },
  { name: 'stats', draw: drawStats },
  { name: 'profile', draw: drawProfile },
];

console.log('开始生成 CampReady TabBar 图标...');
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

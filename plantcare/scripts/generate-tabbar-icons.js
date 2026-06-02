const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 81;
const LINE_WIDTH = 2.5;
const COLOR_DEFAULT = '#BDBDBD';
const COLOR_ACTIVE = '#4CAF50';
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

// ===== 1. HOME — 花盆/房子图标 =====
function drawHome(ctx, color) {
  const cx = 40.5;

  // 屋顶（三角形，带小叶子装饰）
  ctx.beginPath();
  ctx.moveTo(cx, 10);
  ctx.lineTo(14, 36);
  ctx.lineTo(67, 36);
  ctx.closePath();
  ctx.stroke();

  // 房子主体
  ctx.beginPath();
  ctx.moveTo(20, 36);
  ctx.lineTo(20, 66);
  ctx.lineTo(61, 66);
  ctx.lineTo(61, 36);
  ctx.stroke();

  // 门
  ctx.beginPath();
  ctx.moveTo(34, 66);
  ctx.lineTo(34, 50);
  ctx.lineTo(47, 50);
  ctx.lineTo(47, 66);
  ctx.stroke();

  // 屋顶上的小花/叶子
  ctx.beginPath();
  ctx.moveTo(cx, 10);
  ctx.quadraticCurveTo(cx + 6, 4, cx + 4, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, 10);
  ctx.quadraticCurveTo(cx - 6, 4, cx - 2, 0);
  ctx.stroke();
}

// ===== 2. WIKI — 书本/叶子图标 =====
function drawWiki(ctx, color) {
  // 打开的书本
  const cx = 40.5;

  // 左页
  ctx.beginPath();
  ctx.moveTo(cx, 18);
  ctx.quadraticCurveTo(20, 16, 10, 20);
  ctx.lineTo(10, 62);
  ctx.quadraticCurveTo(20, 58, cx, 60);
  ctx.stroke();

  // 右页
  ctx.beginPath();
  ctx.moveTo(cx, 18);
  ctx.quadraticCurveTo(61, 16, 71, 20);
  ctx.lineTo(71, 62);
  ctx.quadraticCurveTo(61, 58, cx, 60);
  ctx.stroke();

  // 书脊
  ctx.beginPath();
  ctx.moveTo(cx, 18);
  ctx.lineTo(cx, 60);
  ctx.stroke();

  // 左页上的叶子图案
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 36);
  ctx.quadraticCurveTo(28, 28, 36, 34);
  ctx.stroke();

  // 叶脉
  ctx.beginPath();
  ctx.moveTo(24, 34);
  ctx.lineTo(32, 30);
  ctx.stroke();

  // 右页横线（文字代表）
  ctx.beginPath();
  ctx.moveTo(46, 32);
  ctx.lineTo(64, 32);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(46, 40);
  ctx.lineTo(64, 40);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(46, 48);
  ctx.lineTo(60, 48);
  ctx.stroke();

  ctx.lineWidth = LINE_WIDTH;
}

// ===== 3. RECORD — 日记/相机图标 =====
function drawRecord(ctx, color) {
  // 日记本外框
  ctx.beginPath();
  ctx.moveTo(16, 10);
  ctx.lineTo(65, 10);
  ctx.lineTo(65, 70);
  ctx.lineTo(16, 70);
  ctx.closePath();
  ctx.stroke();

  // 日记本书脊装饰线
  ctx.beginPath();
  ctx.moveTo(22, 10);
  ctx.lineTo(22, 70);
  ctx.stroke();

  // 小花图案（代表植物记录）
  const fcx = 44, fcy = 32;
  const petalR = 6;
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const px = fcx + Math.cos(angle) * petalR;
    const py = fcy + Math.sin(angle) * petalR;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  // 花心
  ctx.beginPath();
  ctx.arc(fcx, fcy, 3, 0, Math.PI * 2);
  ctx.fill();

  // 日期横线
  ctx.beginPath();
  ctx.moveTo(30, 52);
  ctx.lineTo(58, 52);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(30, 59);
  ctx.lineTo(52, 59);
  ctx.stroke();
}

// ===== 4. PROFILE — 人物图标 =====
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
  { name: 'wiki', draw: drawWiki },
  { name: 'record', draw: drawRecord },
  { name: 'profile', draw: drawProfile },
];

console.log('开始生成 PlantCare TabBar 图标...');
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

console.log('\n全部 8 个图标生成完成！');

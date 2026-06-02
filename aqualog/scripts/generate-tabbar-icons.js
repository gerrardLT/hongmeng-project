const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 81;
const LINE_WIDTH = 2.5;
const COLOR_DEFAULT = '#BDBDBD';
const COLOR_ACTIVE = '#1E88E5';
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

// ===== 1. HOME — 鱼缸图标 =====
function drawHome(ctx, color) {
  const cx = 40.5;

  // 鱼缸主体（圆角矩形轮廓）
  ctx.beginPath();
  ctx.moveTo(16, 18);
  ctx.lineTo(65, 18);
  ctx.lineTo(65, 62);
  ctx.quadraticCurveTo(65, 68, 59, 68);
  ctx.lineTo(22, 68);
  ctx.quadraticCurveTo(16, 68, 16, 62);
  ctx.closePath();
  ctx.stroke();

  // 鱼缸顶部边沿（加宽的顶边）
  ctx.beginPath();
  ctx.moveTo(12, 14);
  ctx.lineTo(69, 14);
  ctx.lineTo(69, 20);
  ctx.lineTo(12, 20);
  ctx.closePath();
  ctx.stroke();

  // 水面波纹线
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 32);
  ctx.quadraticCurveTo(28, 27, 36, 32);
  ctx.quadraticCurveTo(44, 37, 52, 32);
  ctx.quadraticCurveTo(57, 28, 61, 32);
  ctx.stroke();

  // 小鱼身体（椭圆形）
  ctx.beginPath();
  ctx.ellipse(38, 48, 8, 5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 小鱼尾巴
  ctx.beginPath();
  ctx.moveTo(46, 48);
  ctx.lineTo(52, 43);
  ctx.lineTo(52, 53);
  ctx.closePath();
  ctx.stroke();

  // 鱼眼
  ctx.beginPath();
  ctx.arc(33, 47, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = LINE_WIDTH;
}

// ===== 2. RECORD — 记录/剪贴板图标 =====
function drawRecord(ctx, color) {
  // 剪贴板外框
  ctx.beginPath();
  ctx.moveTo(16, 16);
  ctx.lineTo(65, 16);
  ctx.lineTo(65, 70);
  ctx.lineTo(16, 70);
  ctx.closePath();
  ctx.stroke();

  // 剪贴板夹子
  ctx.beginPath();
  ctx.moveTo(30, 10);
  ctx.lineTo(51, 10);
  ctx.lineTo(51, 22);
  ctx.lineTo(30, 22);
  ctx.closePath();
  ctx.stroke();

  // 记录横线（3条）
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(24, 34);
  ctx.lineTo(57, 34);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(24, 44);
  ctx.lineTo(57, 44);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(24, 54);
  ctx.lineTo(48, 54);
  ctx.stroke();

  // 小铅笔（右下角）
  ctx.lineWidth = LINE_WIDTH;
  ctx.beginPath();
  ctx.moveTo(56, 60);
  ctx.lineTo(62, 54);
  ctx.lineTo(66, 58);
  ctx.lineTo(60, 64);
  ctx.closePath();
  ctx.stroke();

  // 铅笔尖
  ctx.beginPath();
  ctx.moveTo(56, 60);
  ctx.lineTo(54, 66);
  ctx.lineTo(60, 64);
  ctx.stroke();
}

// ===== 3. TRENDS — 趋势折线图图标 =====
function drawTrends(ctx, color) {
  // Y轴
  ctx.beginPath();
  ctx.moveTo(16, 12);
  ctx.lineTo(16, 68);
  ctx.stroke();

  // X轴
  ctx.beginPath();
  ctx.moveTo(16, 68);
  ctx.lineTo(72, 68);
  ctx.stroke();

  // 折线（上升趋势）
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(22, 56);
  ctx.lineTo(32, 48);
  ctx.lineTo(42, 52);
  ctx.lineTo(50, 34);
  ctx.lineTo(58, 28);
  ctx.lineTo(66, 20);
  ctx.stroke();

  // 折线上的数据点
  const points = [
    [22, 56], [32, 48], [42, 52], [50, 34], [58, 28], [66, 20]
  ];
  for (const [px, py] of points) {
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Y轴刻度线
  ctx.lineWidth = 1.5;
  for (let y = 24; y <= 60; y += 12) {
    ctx.beginPath();
    ctx.moveTo(13, y);
    ctx.lineTo(16, y);
    ctx.stroke();
  }

  // X轴刻度线
  for (let x = 28; x <= 64; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x, 68);
    ctx.lineTo(x, 71);
    ctx.stroke();
  }

  ctx.lineWidth = LINE_WIDTH;
}

// ===== 4. KNOWLEDGE — 书本+水滴图标 =====
function drawKnowledge(ctx, color) {
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

  // 左页水滴图案
  ctx.lineWidth = 2;
  // 水滴外形
  ctx.beginPath();
  ctx.moveTo(25, 32);
  ctx.quadraticCurveTo(25, 24, 25, 28);
  ctx.moveTo(25, 28);
  ctx.bezierCurveTo(19, 36, 21, 44, 25, 44);
  ctx.bezierCurveTo(29, 44, 31, 36, 25, 28);
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

// ===== 5. PROFILE — 人物图标 =====
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
  { name: 'record', draw: drawRecord },
  { name: 'trends', draw: drawTrends },
  { name: 'knowledge', draw: drawKnowledge },
  { name: 'profile', draw: drawProfile },
];

console.log('开始生成 AquaLog TabBar 图标...');
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

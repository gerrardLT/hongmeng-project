const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 81;
const LINE_WIDTH = 3;
const COLOR_DEFAULT = '#BDBDBD';
const COLOR_ACTIVE = '#E91E8C';
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

// ===== 1. HOME — 小房子图标 =====
function drawHome(ctx) {
  const cx = 40.5;

  // 屋顶（三角形）
  ctx.beginPath();
  ctx.moveTo(cx, 10);
  ctx.lineTo(12, 38);
  ctx.lineTo(69, 38);
  ctx.closePath();
  ctx.stroke();

  // 房子主体
  ctx.beginPath();
  ctx.moveTo(19, 38);
  ctx.lineTo(19, 68);
  ctx.lineTo(62, 68);
  ctx.lineTo(62, 38);
  ctx.stroke();

  // 门
  ctx.beginPath();
  ctx.moveTo(33, 68);
  ctx.lineTo(33, 52);
  ctx.lineTo(48, 52);
  ctx.lineTo(48, 68);
  ctx.stroke();

  // 门把手
  ctx.beginPath();
  ctx.arc(45, 60, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

// ===== 2. CURVE — 曲线/折线图图标 =====
function drawCurve(ctx) {
  // 坐标轴
  ctx.beginPath();
  ctx.moveTo(14, 14);
  ctx.lineTo(14, 66);
  ctx.lineTo(68, 66);
  ctx.stroke();

  // 上升曲线
  ctx.beginPath();
  ctx.moveTo(14, 58);
  ctx.quadraticCurveTo(22, 56, 28, 50);
  ctx.quadraticCurveTo(34, 44, 38, 42);
  ctx.quadraticCurveTo(44, 38, 48, 36);
  ctx.quadraticCurveTo(54, 30, 58, 22);
  ctx.quadraticCurveTo(62, 16, 66, 14);
  ctx.stroke();

  // 数据点
  const points = [
    [14, 58], [28, 50], [38, 42], [48, 36], [58, 22], [66, 14]
  ];
  for (const [x, y] of points) {
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== 3. RECORD — 相机图标 =====
function drawRecord(ctx) {
  // 相机顶部（取景器凸起）
  ctx.beginPath();
  ctx.moveTo(30, 22);
  ctx.lineTo(35, 14);
  ctx.lineTo(46, 14);
  ctx.lineTo(51, 22);
  ctx.stroke();

  // 相机主体（圆角矩形）
  const rx = 12, ry = 22, rw = 57, rh = 40, r = 6;
  ctx.beginPath();
  ctx.moveTo(rx + r, ry);
  ctx.lineTo(rx + rw - r, ry);
  ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
  ctx.lineTo(rx + rw, ry + rh - r);
  ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
  ctx.lineTo(rx + r, ry + rh);
  ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
  ctx.lineTo(rx, ry + r);
  ctx.quadraticCurveTo(rx, ry, rx + r, ry);
  ctx.closePath();
  ctx.stroke();

  // 镜头（大圆）
  ctx.beginPath();
  ctx.arc(40.5, 44, 13, 0, Math.PI * 2);
  ctx.stroke();

  // 镜头内圈
  ctx.beginPath();
  ctx.arc(40.5, 44, 7, 0, Math.PI * 2);
  ctx.stroke();

  // 闪光灯小圆点
  ctx.beginPath();
  ctx.arc(58, 30, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

// ===== 4. KNOWLEDGE — 书本图标 =====
function drawKnowledge(ctx) {
  const cx = 40.5;

  // 左页
  ctx.beginPath();
  ctx.moveTo(cx, 16);
  ctx.quadraticCurveTo(20, 14, 10, 18);
  ctx.lineTo(10, 62);
  ctx.quadraticCurveTo(22, 58, cx, 60);
  ctx.stroke();

  // 右页
  ctx.beginPath();
  ctx.moveTo(cx, 16);
  ctx.quadraticCurveTo(61, 14, 71, 18);
  ctx.lineTo(71, 62);
  ctx.quadraticCurveTo(59, 58, cx, 60);
  ctx.stroke();

  // 书脊
  ctx.beginPath();
  ctx.moveTo(cx, 16);
  ctx.lineTo(cx, 60);
  ctx.stroke();

  // 左页横线（文字）
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(18, 30);
  ctx.lineTo(34, 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(18, 38);
  ctx.lineTo(32, 38);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(18, 46);
  ctx.lineTo(34, 46);
  ctx.stroke();

  // 右页横线（文字）
  ctx.beginPath();
  ctx.moveTo(47, 30);
  ctx.lineTo(63, 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(47, 38);
  ctx.lineTo(61, 38);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(47, 46);
  ctx.lineTo(63, 46);
  ctx.stroke();

  ctx.lineWidth = LINE_WIDTH;
}

// ===== 5. PROFILE — 人物图标 =====
function drawProfile(ctx) {
  const cx = 40.5;

  // 头部圆形
  ctx.beginPath();
  ctx.arc(cx, 26, 13, 0, Math.PI * 2);
  ctx.stroke();

  // 身体弧线
  ctx.beginPath();
  ctx.moveTo(13, 70);
  ctx.quadraticCurveTo(13, 48, cx, 45);
  ctx.quadraticCurveTo(68, 48, 68, 70);
  ctx.stroke();

  // 底部封口
  ctx.beginPath();
  ctx.moveTo(13, 70);
  ctx.lineTo(68, 70);
  ctx.stroke();
}

// ===== 生成所有图标 =====
const icons = [
  { name: 'home', draw: drawHome },
  { name: 'curve', draw: drawCurve },
  { name: 'record', draw: drawRecord },
  { name: 'knowledge', draw: drawKnowledge },
  { name: 'profile', draw: drawProfile },
];

console.log('开始生成 MamaTrack TabBar 图标...');
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

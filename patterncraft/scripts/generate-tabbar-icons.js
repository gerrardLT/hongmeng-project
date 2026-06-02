const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 81;
const LINE_WIDTH = 2.5;
const COLOR_DEFAULT = '#999999';
const COLOR_ACTIVE = '#C41A16';
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

// ===== 1. HOME — 中式亭子/飞檐屋顶 =====
function drawHome(ctx, color) {
  const cx = 40.5, cy = 40.5;
  ctx.beginPath();
  // 飞檐屋顶 - 优雅的曲线
  // 主屋顶三角
  ctx.moveTo(12, 38);
  ctx.quadraticCurveTo(14, 36, 18, 34);
  ctx.lineTo(40.5, 16);
  ctx.lineTo(63, 34);
  ctx.quadraticCurveTo(67, 36, 69, 38);
  ctx.stroke();

  // 左翘角飞檐
  ctx.beginPath();
  ctx.moveTo(12, 38);
  ctx.quadraticCurveTo(8, 35, 6, 30);
  ctx.stroke();

  // 右翘角飞檐
  ctx.beginPath();
  ctx.moveTo(69, 38);
  ctx.quadraticCurveTo(73, 35, 75, 30);
  ctx.stroke();

  // 屋顶脊上的装饰小尖
  ctx.beginPath();
  ctx.moveTo(40.5, 16);
  ctx.lineTo(40.5, 11);
  ctx.stroke();

  // 屋檐横线
  ctx.beginPath();
  ctx.moveTo(15, 38);
  ctx.lineTo(66, 38);
  ctx.stroke();

  // 下方门框/柱子
  ctx.beginPath();
  ctx.moveTo(22, 38);
  ctx.lineTo(22, 65);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(59, 38);
  ctx.lineTo(59, 65);
  ctx.stroke();

  // 底线
  ctx.beginPath();
  ctx.moveTo(18, 65);
  ctx.lineTo(63, 65);
  ctx.stroke();

  // 中间门洞 - 拱形
  ctx.beginPath();
  ctx.moveTo(33, 65);
  ctx.lineTo(33, 50);
  ctx.quadraticCurveTo(33, 44, 40.5, 44);
  ctx.quadraticCurveTo(48, 44, 48, 50);
  ctx.lineTo(48, 65);
  ctx.stroke();
}

// ===== 2. LIBRARY — 展开的卷轴 =====
function drawLibrary(ctx, color) {
  // 卷轴主体
  const scrollLeft = 14;
  const scrollRight = 67;
  const scrollTop = 18;
  const scrollBottom = 62;

  // 左卷轴卷曲
  ctx.beginPath();
  ctx.arc(scrollLeft + 4, scrollTop + 8, 8, Math.PI * 0.5, Math.PI * 1.5, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(scrollLeft + 4, scrollBottom - 8, 8, Math.PI * 0.5, Math.PI * 1.5, false);
  ctx.stroke();

  // 右卷轴卷曲
  ctx.beginPath();
  ctx.arc(scrollRight - 4, scrollTop + 8, 8, -Math.PI * 0.5, Math.PI * 0.5, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(scrollRight - 4, scrollBottom - 8, 8, -Math.PI * 0.5, Math.PI * 0.5, false);
  ctx.stroke();

  // 卷轴上下边
  ctx.beginPath();
  ctx.moveTo(scrollLeft + 4, scrollTop);
  ctx.lineTo(scrollRight - 4, scrollTop);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(scrollLeft + 4, scrollBottom);
  ctx.lineTo(scrollRight - 4, scrollBottom);
  ctx.stroke();

  // 左右竖边
  ctx.beginPath();
  ctx.moveTo(scrollLeft + 4, scrollTop);
  ctx.lineTo(scrollLeft + 4, scrollBottom);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(scrollRight - 4, scrollTop);
  ctx.lineTo(scrollRight - 4, scrollBottom);
  ctx.stroke();

  // 中间绘制简化回纹
  const mx = 40.5, my = 40;
  ctx.lineWidth = 2;
  ctx.beginPath();
  // 回纹 - 方形螺旋
  ctx.moveTo(mx - 8, my - 8);
  ctx.lineTo(mx + 8, my - 8);
  ctx.lineTo(mx + 8, my + 8);
  ctx.lineTo(mx - 4, my + 8);
  ctx.lineTo(mx - 4, my - 3);
  ctx.lineTo(mx + 3, my - 3);
  ctx.lineTo(mx + 3, my + 3);
  ctx.lineTo(mx - 0, my + 3);
  ctx.stroke();
  ctx.lineWidth = LINE_WIDTH;
}

// ===== 3. WORKS — 毛笔+画框 =====
function drawWorks(ctx, color) {
  // 画框 - 方形带内框
  ctx.beginPath();
  ctx.rect(10, 20, 42, 48);
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(16, 26, 30, 36);
  ctx.stroke();

  // 画框内简化山水纹
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // 小山
  ctx.moveTo(18, 54);
  ctx.lineTo(25, 40);
  ctx.lineTo(32, 48);
  ctx.lineTo(38, 36);
  ctx.lineTo(44, 54);
  ctx.stroke();

  // 小圆（月亮）
  ctx.beginPath();
  ctx.arc(36, 32, 3.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = LINE_WIDTH;

  // 毛笔 - 斜置在右侧
  ctx.save();
  ctx.translate(62, 18);
  ctx.rotate(Math.PI * 0.2);

  // 笔杆
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(-2, 40);
  ctx.lineTo(2, 40);
  ctx.lineTo(2, 0);
  ctx.closePath();
  ctx.stroke();

  // 笔头（毛）
  ctx.beginPath();
  ctx.moveTo(-2, 40);
  ctx.quadraticCurveTo(-3, 46, 0, 52);
  ctx.quadraticCurveTo(3, 46, 2, 40);
  ctx.stroke();

  // 笔杆装饰线
  ctx.beginPath();
  ctx.moveTo(-2, 8);
  ctx.lineTo(2, 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-2, 10);
  ctx.lineTo(2, 10);
  ctx.stroke();

  ctx.restore();
}

// ===== 4. WIKI — 打开的书+放大镜 =====
function drawWiki(ctx, color) {
  // 打开的书
  const cx = 40.5;
  // 书脊
  ctx.beginPath();
  ctx.moveTo(cx, 20);
  ctx.lineTo(cx, 58);
  ctx.stroke();

  // 左页
  ctx.beginPath();
  ctx.moveTo(cx, 20);
  ctx.quadraticCurveTo(cx - 6, 18, 12, 22);
  ctx.lineTo(12, 58);
  ctx.quadraticCurveTo(cx - 6, 56, cx, 58);
  ctx.stroke();

  // 右页
  ctx.beginPath();
  ctx.moveTo(cx, 20);
  ctx.quadraticCurveTo(cx + 6, 18, 69, 22);
  ctx.lineTo(69, 58);
  ctx.quadraticCurveTo(cx + 6, 56, cx, 58);
  ctx.stroke();

  // 左页文字线
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const y = 30 + i * 7;
    ctx.beginPath();
    ctx.moveTo(18, y);
    ctx.lineTo(35, y);
    ctx.stroke();
  }

  // 右页纹样符号 - 简化云纹
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(54, 34, 5, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(54 + 5, 34, 3, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(54 - 5, 34);
  ctx.quadraticCurveTo(54 - 7, 38, 54 - 4, 40);
  ctx.stroke();
  ctx.lineWidth = LINE_WIDTH;

  // 放大镜 - 右上角
  ctx.beginPath();
  ctx.arc(62, 16, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(67, 21);
  ctx.lineTo(73, 27);
  ctx.stroke();
}

// ===== 5. PROFILE — 人物头像 =====
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

  // 衣领 V 形装饰（中式立领感）
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 6, 46);
  ctx.lineTo(cx, 54);
  ctx.lineTo(cx + 6, 46);
  ctx.stroke();

  // 领口小扣子
  ctx.beginPath();
  ctx.arc(cx, 56, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = LINE_WIDTH;
}

// ===== 生成所有图标 =====
const icons = [
  { name: 'home', draw: drawHome },
  { name: 'library', draw: drawLibrary },
  { name: 'works', draw: drawWorks },
  { name: 'wiki', draw: drawWiki },
  { name: 'profile', draw: drawProfile },
];

console.log('开始生成 TabBar 图标...');
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

// 传统纹样绘制函数 p001-p020
'use strict';
const { PI, sin, cos, sqrt } = Math;
const TAU = PI * 2;

// ===== p001 云纹 =====
function drawCloud(ctx, x, y, size, color) {
  const r = size / 4;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, PI, 0, false);
  ctx.arc(x + r, y - r * 0.3, r * 0.7, PI, 0, false);
  ctx.arc(x - r, y - r * 0.3, r * 0.7, PI, 0, false);
  ctx.moveTo(x - r * 1.7, y);
  ctx.quadraticCurveTo(x - r * 2, y + r * 0.8, x - r * 1.3, y + r * 0.5);
  ctx.stroke();
  ctx.restore();
}

// ===== p002 回纹 =====
function drawFret(ctx, x, y, size, color) {
  const s = size / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.rect(x - s, y - s, size, size);
  const inset = s * 0.3;
  ctx.moveTo(x - s + inset, y - s + inset);
  ctx.lineTo(x + s - inset, y - s + inset);
  ctx.lineTo(x + s - inset, y + s - inset);
  ctx.lineTo(x - s + inset * 2, y + s - inset);
  ctx.lineTo(x - s + inset * 2, y - s + inset * 2);
  ctx.lineTo(x + s - inset * 2, y - s + inset * 2);
  ctx.stroke();
  ctx.restore();
}

// ===== p003 如意纹 =====
function drawRuyi(ctx, x, y, size, color) {
  const r = size / 3;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x - r * 0.4, y - r * 0.2, r * 0.5, PI, 0, false);
  ctx.arc(x + r * 0.4, y - r * 0.2, r * 0.5, PI, 0, false);
  ctx.moveTo(x, y + r * 0.3);
  ctx.quadraticCurveTo(x + r * 0.3, y + r, x, y + r * 1.5);
  ctx.quadraticCurveTo(x - r * 0.3, y + r, x, y + r * 0.3);
  ctx.stroke();
  ctx.restore();
}

// ===== p004 缠枝纹 =====
function drawScroll(ctx, x, y, size, color) {
  const r = size / 3;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - r * 1.5, y);
  ctx.quadraticCurveTo(x - r * 0.5, y - r, x, y);
  ctx.quadraticCurveTo(x + r * 0.5, y + r, x + r * 1.5, y);
  ctx.moveTo(x - r * 0.5, y - r * 0.5);
  ctx.arc(x - r * 0.8, y - r * 0.5, r * 0.3, 0, PI * 1.5, true);
  ctx.moveTo(x + r * 0.5, y + r * 0.5);
  ctx.arc(x + r * 0.8, y + r * 0.5, r * 0.3, PI, PI * 0.5, true);
  ctx.stroke();
  ctx.restore();
}

// ===== p005 万字纹 =====
function drawSwastika(ctx, x, y, size, color) {
  const s = size / 3;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
  ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
  ctx.moveTo(x - s, y); ctx.lineTo(x - s, y - s * 0.6);
  ctx.moveTo(x + s, y); ctx.lineTo(x + s, y + s * 0.6);
  ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.6, y - s);
  ctx.moveTo(x, y + s); ctx.lineTo(x - s * 0.6, y + s);
  ctx.stroke();
  ctx.restore();
}

// ===== p006 水波纹 =====
function drawWave(ctx, x, y, size, color) {
  const amplitude = size / 4;
  const wavelength = size;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let row = 0; row < 3; row++) {
    const oy = y + row * amplitude * 1.2;
    ctx.moveTo(x - wavelength / 2, oy);
    for (let i = 0; i <= 20; i++) {
      const px = x - wavelength / 2 + (wavelength / 20) * i;
      const py = oy + sin((i / 20) * TAU) * amplitude * 0.5;
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
  ctx.restore();
}

// ===== p007 龙纹 =====
function drawDragon(ctx, x, y, size, color) {
  const s = size * 0.4;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // S形龙身
  ctx.moveTo(x - s, y - s * 0.5);
  ctx.bezierCurveTo(x - s * 0.3, y - s * 1.2, x + s * 0.3, y - s * 0.3, x + s * 0.1, y);
  ctx.bezierCurveTo(x - s * 0.2, y + s * 0.4, x + s * 0.4, y + s * 1.0, x + s, y + s * 0.5);
  ctx.stroke();
  // 龙头
  ctx.beginPath();
  ctx.arc(x - s * 0.9, y - s * 0.6, s * 0.25, 0, TAU);
  ctx.stroke();
  // 龙角
  ctx.beginPath();
  ctx.moveTo(x - s * 0.8, y - s * 0.85);
  ctx.lineTo(x - s * 0.6, y - s * 1.2);
  ctx.moveTo(x - s * 1.0, y - s * 0.85);
  ctx.lineTo(x - s * 1.15, y - s * 1.15);
  ctx.stroke();
  // 龙须
  ctx.beginPath();
  ctx.moveTo(x - s * 1.15, y - s * 0.55);
  ctx.quadraticCurveTo(x - s * 1.4, y - s * 0.3, x - s * 1.3, y - s * 0.1);
  ctx.moveTo(x - s * 1.15, y - s * 0.65);
  ctx.quadraticCurveTo(x - s * 1.5, y - s * 0.5, x - s * 1.4, y - s * 0.2);
  ctx.stroke();
  // 鳞片纹理
  for (let i = 0; i < 6; i++) {
    const t = i / 6;
    const bx = x - s + t * s * 2;
    const by = y - s * 0.3 + sin(t * PI * 2) * s * 0.4;
    ctx.beginPath();
    ctx.arc(bx, by, s * 0.08, 0, PI, false);
    ctx.stroke();
  }
  ctx.restore();
}

// ===== p008 凤纹 =====
function drawPhoenix(ctx, x, y, size, color) {
  const s = size * 0.35;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  // 凤身
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.2, s * 0.3, s * 0.5, -PI / 8, 0, TAU);
  ctx.stroke();
  // 凤头
  ctx.beginPath();
  ctx.arc(x - s * 0.15, y - s * 0.8, s * 0.2, 0, TAU);
  ctx.stroke();
  // 冠羽
  ctx.beginPath();
  ctx.moveTo(x - s * 0.1, y - s * 1.0);
  ctx.quadraticCurveTo(x + s * 0.2, y - s * 1.4, x + s * 0.4, y - s * 1.2);
  ctx.moveTo(x - s * 0.2, y - s * 1.0);
  ctx.quadraticCurveTo(x, y - s * 1.5, x + s * 0.3, y - s * 1.35);
  ctx.stroke();
  // 展翅
  ctx.beginPath();
  ctx.moveTo(x + s * 0.3, y - s * 0.3);
  ctx.quadraticCurveTo(x + s * 1.2, y - s * 0.8, x + s * 1.0, y + s * 0.1);
  ctx.moveTo(x - s * 0.3, y - s * 0.3);
  ctx.quadraticCurveTo(x - s * 1.2, y - s * 0.8, x - s * 1.0, y + s * 0.1);
  ctx.stroke();
  // 长尾
  ctx.beginPath();
  ctx.moveTo(x + s * 0.1, y + s * 0.3);
  ctx.bezierCurveTo(x + s * 0.8, y + s * 0.6, x + s * 1.2, y + s * 1.0, x + s * 0.5, y + s * 1.4);
  ctx.moveTo(x - s * 0.1, y + s * 0.3);
  ctx.bezierCurveTo(x - s * 0.5, y + s * 0.8, x - s * 0.3, y + s * 1.2, x - s * 0.7, y + s * 1.3);
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x + s * 0.3, y + s * 0.9, x + s * 0.6, y + s * 1.3, x + s * 0.1, y + s * 1.5);
  ctx.stroke();
  ctx.restore();
}

// ===== p009 麒麟纹 =====
function drawQilin(ctx, x, y, size, color) {
  const s = size * 0.35;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  // 鹿身
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.6, s * 0.35, 0, 0, TAU);
  ctx.stroke();
  // 龙首
  ctx.beginPath();
  ctx.ellipse(x - s * 0.7, y - s * 0.5, s * 0.25, s * 0.2, -PI / 4, 0, TAU);
  ctx.stroke();
  // 颈
  ctx.beginPath();
  ctx.moveTo(x - s * 0.55, y - s * 0.35);
  ctx.lineTo(x - s * 0.35, y - s * 0.1);
  ctx.moveTo(x - s * 0.75, y - s * 0.3);
  ctx.lineTo(x - s * 0.55, y - s * 0.05);
  ctx.stroke();
  // 角
  ctx.beginPath();
  ctx.moveTo(x - s * 0.7, y - s * 0.7);
  ctx.lineTo(x - s * 0.6, y - s * 1.1);
  ctx.stroke();
  // 四腿
  const legs = [[-0.3, 0.35, -0.35, 0.9], [0.1, 0.35, 0.05, 0.9], [0.35, 0.35, 0.4, 0.9], [-0.05, 0.35, -0.1, 0.9]];
  ctx.beginPath();
  for (const [lx1, ly1, lx2, ly2] of legs) {
    ctx.moveTo(x + s * lx1, y + s * ly1);
    ctx.lineTo(x + s * lx2, y + s * ly2);
  }
  ctx.stroke();
  // 火焰纹装饰
  ctx.strokeStyle = '#D4A843';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    const fx = x + cos(a) * s * 0.85;
    const fy = y + sin(a) * s * 0.55;
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + cos(a) * s * 0.2, fy + sin(a) * s * 0.2 - s * 0.15);
    ctx.lineTo(fx + cos(a) * s * 0.1, fy + sin(a) * s * 0.1);
  }
  ctx.stroke();
  ctx.restore();
}

// ===== p010 莲花纹 =====
function drawLotus(ctx, x, y, size, color) {
  const r = size * 0.35;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  // 三层花瓣
  const layers = [
    { count: 5, radius: r * 0.4, pw: 0.2, ph: 0.4 },
    { count: 7, radius: r * 0.65, pw: 0.18, ph: 0.35 },
    { count: 9, radius: r * 0.9, pw: 0.15, ph: 0.3 },
  ];
  for (const layer of layers) {
    for (let i = 0; i < layer.count; i++) {
      const a = (i / layer.count) * TAU - PI / 2;
      const px = x + cos(a) * layer.radius * 0.3;
      const py = y + sin(a) * layer.radius * 0.3;
      ctx.beginPath();
      ctx.ellipse(px + cos(a) * layer.radius * 0.4, py + sin(a) * layer.radius * 0.4,
        r * layer.pw, r * layer.ph, a + PI / 2, 0, TAU);
      ctx.stroke();
    }
  }
  // 花蕊
  ctx.beginPath();
  ctx.arc(x, y, r * 0.12, 0, TAU);
  ctx.fillStyle = '#D4A843';
  ctx.fill();
  ctx.restore();
}

// ===== p011 牡丹纹 =====
function drawPeony(ctx, x, y, size, color) {
  const r = size * 0.35;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  // 多层花瓣
  for (let layer = 0; layer < 3; layer++) {
    const count = 6 + layer * 2;
    const lr = r * (0.25 + layer * 0.25);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + layer * 0.3;
      const px = x + cos(a) * lr * 0.5;
      const py = y + sin(a) * lr * 0.5;
      ctx.beginPath();
      ctx.ellipse(px, py, lr * 0.3, lr * 0.5, a, 0, TAU);
      ctx.stroke();
    }
  }
  // 中心
  ctx.beginPath();
  ctx.arc(x, y, r * 0.15, 0, TAU);
  ctx.fillStyle = '#D4A843';
  ctx.fill();
  ctx.restore();
}

// ===== p012 蝙蝠纹 =====
function drawBat(ctx, x, y, size, color) {
  const s = size * 0.4;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  // 身体
  ctx.ellipse(x, y, s * 0.15, s * 0.3, 0, 0, TAU);
  ctx.fill();
  // 左翅
  ctx.beginPath();
  ctx.moveTo(x - s * 0.1, y - s * 0.1);
  ctx.quadraticCurveTo(x - s * 0.5, y - s * 0.7, x - s * 0.9, y - s * 0.3);
  ctx.quadraticCurveTo(x - s * 0.7, y - s * 0.1, x - s * 0.95, y + s * 0.15);
  ctx.quadraticCurveTo(x - s * 0.6, y + s * 0.05, x - s * 0.7, y + s * 0.35);
  ctx.quadraticCurveTo(x - s * 0.3, y + s * 0.15, x - s * 0.1, y + s * 0.2);
  ctx.stroke();
  // 右翅（对称）
  ctx.beginPath();
  ctx.moveTo(x + s * 0.1, y - s * 0.1);
  ctx.quadraticCurveTo(x + s * 0.5, y - s * 0.7, x + s * 0.9, y - s * 0.3);
  ctx.quadraticCurveTo(x + s * 0.7, y - s * 0.1, x + s * 0.95, y + s * 0.15);
  ctx.quadraticCurveTo(x + s * 0.6, y + s * 0.05, x + s * 0.7, y + s * 0.35);
  ctx.quadraticCurveTo(x + s * 0.3, y + s * 0.15, x + s * 0.1, y + s * 0.2);
  ctx.stroke();
  // 耳朵
  ctx.beginPath();
  ctx.moveTo(x - s * 0.08, y - s * 0.28);
  ctx.lineTo(x - s * 0.15, y - s * 0.48);
  ctx.lineTo(x, y - s * 0.3);
  ctx.lineTo(x + s * 0.15, y - s * 0.48);
  ctx.lineTo(x + s * 0.08, y - s * 0.28);
  ctx.stroke();
  ctx.restore();
}

// ===== p013 鹿纹 =====
function drawDeer(ctx, x, y, size, color) {
  const s = size * 0.35;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  // 身体
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.55, s * 0.3, 0, 0, TAU);
  ctx.stroke();
  // 头
  ctx.beginPath();
  ctx.ellipse(x - s * 0.65, y - s * 0.45, s * 0.15, s * 0.12, -PI / 6, 0, TAU);
  ctx.stroke();
  // 颈
  ctx.beginPath();
  ctx.moveTo(x - s * 0.55, y - s * 0.35);
  ctx.lineTo(x - s * 0.35, y - s * 0.1);
  ctx.moveTo(x - s * 0.7, y - s * 0.35);
  ctx.lineTo(x - s * 0.5, y - s * 0.05);
  ctx.stroke();
  // 鹿角
  ctx.beginPath();
  ctx.moveTo(x - s * 0.6, y - s * 0.55);
  ctx.lineTo(x - s * 0.5, y - s * 0.95);
  ctx.lineTo(x - s * 0.35, y - s * 0.8);
  ctx.moveTo(x - s * 0.5, y - s * 0.75);
  ctx.lineTo(x - s * 0.6, y - s * 0.85);
  ctx.moveTo(x - s * 0.7, y - s * 0.55);
  ctx.lineTo(x - s * 0.8, y - s * 0.9);
  ctx.lineTo(x - s * 0.9, y - s * 0.75);
  ctx.moveTo(x - s * 0.8, y - s * 0.72);
  ctx.lineTo(x - s * 0.7, y - s * 0.82);
  ctx.stroke();
  // 四腿
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y + s * 0.3); ctx.lineTo(x - s * 0.35, y + s * 0.85);
  ctx.moveTo(x - s * 0.1, y + s * 0.3); ctx.lineTo(x - s * 0.05, y + s * 0.85);
  ctx.moveTo(x + s * 0.2, y + s * 0.3); ctx.lineTo(x + s * 0.15, y + s * 0.85);
  ctx.moveTo(x + s * 0.4, y + s * 0.3); ctx.lineTo(x + s * 0.45, y + s * 0.85);
  ctx.stroke();
  // 梅花斑点
  ctx.fillStyle = color;
  const spots = [[0, -0.05], [0.15, 0.05], [-0.15, 0.1], [0.25, -0.1], [-0.05, 0.15]];
  for (const [sx, sy] of spots) {
    ctx.beginPath();
    ctx.arc(x + s * sx, y + s * sy, s * 0.04, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// ===== p014 仙鹤纹 =====
function drawCrane(ctx, x, y, size, color) {
  const s = size * 0.38;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  // 身体
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.1, s * 0.4, s * 0.25, PI / 12, 0, TAU);
  ctx.stroke();
  // 长颈
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y - s * 0.25);
  ctx.bezierCurveTo(x - s * 0.5, y - s * 0.6, x - s * 0.3, y - s * 0.9, x - s * 0.15, y - s * 1.0);
  ctx.stroke();
  // 头
  ctx.beginPath();
  ctx.arc(x - s * 0.15, y - s * 1.05, s * 0.08, 0, TAU);
  ctx.stroke();
  // 丹顶
  ctx.fillStyle = '#C41A16';
  ctx.beginPath();
  ctx.arc(x - s * 0.15, y - s * 1.1, s * 0.04, 0, TAU);
  ctx.fill();
  // 喙
  ctx.beginPath();
  ctx.moveTo(x - s * 0.08, y - s * 1.07);
  ctx.lineTo(x + s * 0.08, y - s * 1.12);
  ctx.stroke();
  // 展翅
  ctx.beginPath();
  ctx.moveTo(x + s * 0.1, y - s * 0.2);
  ctx.quadraticCurveTo(x + s * 0.8, y - s * 0.7, x + s * 1.0, y - s * 0.2);
  ctx.moveTo(x - s * 0.1, y - s * 0.15);
  ctx.quadraticCurveTo(x - s * 0.7, y - s * 0.6, x - s * 0.9, y - s * 0.1);
  ctx.stroke();
  // 翅尖羽毛
  ctx.strokeStyle = '#2C2C2C';
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.moveTo(x + s * (0.7 + i * 0.08), y - s * (0.35 - i * 0.04));
    ctx.lineTo(x + s * (0.75 + i * 0.08), y - s * (0.15 - i * 0.04));
  }
  ctx.stroke();
  // 长腿
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.05, y + s * 0.15);
  ctx.lineTo(x - s * 0.1, y + s * 0.85);
  ctx.moveTo(x + s * 0.15, y + s * 0.15);
  ctx.lineTo(x + s * 0.1, y + s * 0.85);
  ctx.stroke();
  ctx.restore();
}

// ===== p015 鱼纹 =====
function drawFish(ctx, x, y, size, color) {
  const s = size * 0.3;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  // 上鱼
  drawSingleFish(ctx, x, y - s * 0.3, s, color, 0);
  // 下鱼（旋转180度）
  drawSingleFish(ctx, x, y + s * 0.3, s, color, PI);
  ctx.restore();
}
function drawSingleFish(ctx, x, y, s, color, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  // 鱼身
  ctx.beginPath();
  ctx.moveTo(s * 0.6, 0);
  ctx.quadraticCurveTo(s * 0.3, -s * 0.35, -s * 0.2, -s * 0.25);
  ctx.quadraticCurveTo(-s * 0.5, -s * 0.15, -s * 0.6, 0);
  ctx.quadraticCurveTo(-s * 0.5, s * 0.15, -s * 0.2, s * 0.25);
  ctx.quadraticCurveTo(s * 0.3, s * 0.35, s * 0.6, 0);
  ctx.stroke();
  // 尾巴
  ctx.beginPath();
  ctx.moveTo(-s * 0.55, -s * 0.1);
  ctx.lineTo(-s * 0.85, -s * 0.25);
  ctx.lineTo(-s * 0.6, 0);
  ctx.lineTo(-s * 0.85, s * 0.25);
  ctx.lineTo(-s * 0.55, s * 0.1);
  ctx.stroke();
  // 眼睛
  ctx.beginPath();
  ctx.arc(s * 0.25, -s * 0.05, s * 0.04, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
  // 鳞片
  for (let i = 0; i < 3; i++) {
    for (let j = -1; j <= 1; j++) {
      ctx.beginPath();
      ctx.arc(-s * 0.05 + i * s * 0.15, j * s * 0.1, s * 0.06, PI * 0.8, PI * 0.2, true);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ===== p016 蝴蝶纹 =====
function drawButterfly(ctx, x, y, size, color) {
  const s = size * 0.4;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  // 身体
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.06, s * 0.35, 0, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
  // 上翅
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.15);
  ctx.bezierCurveTo(x - s * 0.5, y - s * 0.7, x - s * 0.9, y - s * 0.4, x - s * 0.5, y + s * 0.05);
  ctx.quadraticCurveTo(x - s * 0.2, y - s * 0.05, x, y - s * 0.05);
  ctx.stroke();
  // 右上翅
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.15);
  ctx.bezierCurveTo(x + s * 0.5, y - s * 0.7, x + s * 0.9, y - s * 0.4, x + s * 0.5, y + s * 0.05);
  ctx.quadraticCurveTo(x + s * 0.2, y - s * 0.05, x, y - s * 0.05);
  ctx.stroke();
  // 下翅
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.05);
  ctx.bezierCurveTo(x - s * 0.4, y + s * 0.1, x - s * 0.6, y + s * 0.5, x - s * 0.2, y + s * 0.45);
  ctx.quadraticCurveTo(x - s * 0.1, y + s * 0.3, x, y + s * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.05);
  ctx.bezierCurveTo(x + s * 0.4, y + s * 0.1, x + s * 0.6, y + s * 0.5, x + s * 0.2, y + s * 0.45);
  ctx.quadraticCurveTo(x + s * 0.1, y + s * 0.3, x, y + s * 0.2);
  ctx.stroke();
  // 翅膀纹理
  ctx.beginPath();
  ctx.arc(x - s * 0.4, y - s * 0.25, s * 0.12, 0, TAU);
  ctx.arc(x + s * 0.4, y - s * 0.25, s * 0.12, 0, TAU);
  ctx.stroke();
  // 触角
  ctx.beginPath();
  ctx.moveTo(x - s * 0.03, y - s * 0.33);
  ctx.quadraticCurveTo(x - s * 0.2, y - s * 0.6, x - s * 0.3, y - s * 0.55);
  ctx.moveTo(x + s * 0.03, y - s * 0.33);
  ctx.quadraticCurveTo(x + s * 0.2, y - s * 0.6, x + s * 0.3, y - s * 0.55);
  ctx.stroke();
  ctx.restore();
}

// ===== p017 石榴纹 =====
function drawPomegranate(ctx, x, y, size, color) {
  const s = size * 0.35;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  // 果实轮廓
  ctx.beginPath();
  ctx.arc(x, y + s * 0.1, s * 0.5, PI * 0.15, PI * 0.85, true);
  ctx.quadraticCurveTo(x - s * 0.55, y + s * 0.5, x - s * 0.3, y + s * 0.7);
  ctx.quadraticCurveTo(x, y + s * 0.85, x + s * 0.3, y + s * 0.7);
  ctx.quadraticCurveTo(x + s * 0.55, y + s * 0.5, x + s * 0.48, y + s * 0.1);
  ctx.stroke();
  // 裂口花萼
  ctx.beginPath();
  ctx.moveTo(x - s * 0.2, y - s * 0.3);
  ctx.quadraticCurveTo(x - s * 0.1, y - s * 0.1, x, y - s * 0.15);
  ctx.quadraticCurveTo(x + s * 0.1, y - s * 0.1, x + s * 0.2, y - s * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.15, y - s * 0.25);
  ctx.lineTo(x - s * 0.25, y - s * 0.5);
  ctx.moveTo(x, y - s * 0.15);
  ctx.lineTo(x, y - s * 0.45);
  ctx.moveTo(x + s * 0.15, y - s * 0.25);
  ctx.lineTo(x + s * 0.25, y - s * 0.5);
  ctx.stroke();
  // 石榴籽
  ctx.fillStyle = '#C41A16';
  const seeds = [
    [0, 0.15], [-0.15, 0.25], [0.15, 0.25], [0, 0.35], [-0.1, 0.05], [0.1, 0.05],
    [-0.2, 0.4], [0.2, 0.4], [0, 0.5], [-0.1, 0.45], [0.1, 0.45]
  ];
  for (const [sx, sy] of seeds) {
    ctx.beginPath();
    ctx.arc(x + s * sx, y + s * sy, s * 0.055, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// ===== p018 竹纹 =====
function drawBamboo(ctx, x, y, size, color) {
  const s = size * 0.4;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  // 竹竿
  ctx.beginPath();
  ctx.moveTo(x, y + s); ctx.lineTo(x, y - s);
  ctx.stroke();
  // 竹节
  ctx.lineWidth = 3;
  for (let i = -2; i <= 2; i++) {
    const ny = y + i * s * 0.4;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.08, ny);
    ctx.lineTo(x + s * 0.08, ny);
    ctx.stroke();
  }
  // 竹叶
  ctx.lineWidth = 1.5;
  ctx.fillStyle = color;
  const leaves = [
    { bx: 0, by: -0.6, angle: -PI / 4, len: 0.5 },
    { bx: 0, by: -0.6, angle: -PI / 3, len: 0.4 },
    { bx: 0, by: -0.2, angle: PI / 4 + PI, len: 0.45 },
    { bx: 0, by: 0.2, angle: -PI / 5, len: 0.4 },
    { bx: 0, by: 0.2, angle: PI / 5 + PI, len: 0.35 },
  ];
  for (const lf of leaves) {
    const lx = x + s * lf.bx;
    const ly = y + s * lf.by;
    const ex = lx + cos(lf.angle) * s * lf.len;
    const ey = ly + sin(lf.angle) * s * lf.len;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.quadraticCurveTo(lx + cos(lf.angle + 0.3) * s * lf.len * 0.6,
      ly + sin(lf.angle + 0.3) * s * lf.len * 0.6, ex, ey);
    ctx.quadraticCurveTo(lx + cos(lf.angle - 0.3) * s * lf.len * 0.6,
      ly + sin(lf.angle - 0.3) * s * lf.len * 0.6, lx, ly);
    ctx.fill();
  }
  ctx.restore();
}

// ===== p019 梅花纹 =====
function drawPlumBlossom(ctx, x, y, size, color) {
  const r = size * 0.12;
  ctx.save();
  // 散点分布多朵梅花
  const positions = [
    [0, 0], [-0.3, -0.25], [0.3, -0.2], [-0.2, 0.3], [0.25, 0.28], [0, -0.4], [0.15, 0.05]
  ];
  for (const [px, py] of positions) {
    const cx = x + size * px * 0.35;
    const cy = y + size * py * 0.35;
    drawSinglePlum(ctx, cx, cy, r * (0.8 + Math.random() * 0.4), color);
  }
  // 枝干
  ctx.strokeStyle = '#5C3A21';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.2);
  ctx.quadraticCurveTo(x - size * 0.1, y, x + size * 0.15, y - size * 0.25);
  ctx.moveTo(x - size * 0.05, y + size * 0.05);
  ctx.quadraticCurveTo(x + size * 0.1, y + size * 0.1, x + size * 0.2, y + size * 0.25);
  ctx.stroke();
  ctx.restore();
}
function drawSinglePlum(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU - PI / 2;
    ctx.beginPath();
    ctx.ellipse(x + cos(a) * r * 0.45, y + sin(a) * r * 0.45, r * 0.35, r * 0.5, a, 0, TAU);
    ctx.stroke();
  }
  // 花蕊
  ctx.beginPath();
  ctx.arc(x, y, r * 0.12, 0, TAU);
  ctx.fillStyle = '#D4A843';
  ctx.fill();
}

// ===== p020 铜钱纹 =====
function drawCoin(ctx, x, y, size, color) {
  const r = size * 0.35;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  // 外圆
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  // 内方孔
  const sq = r * 0.3;
  ctx.beginPath();
  ctx.rect(x - sq, y - sq, sq * 2, sq * 2);
  ctx.stroke();
  // 装饰纹
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.75, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

module.exports = {
  drawCloud, drawFret, drawRuyi, drawScroll, drawSwastika, drawWave,
  drawDragon, drawPhoenix, drawQilin, drawLotus, drawPeony, drawBat,
  drawDeer, drawCrane, drawFish, drawButterfly, drawPomegranate,
  drawBamboo, drawPlumBlossom, drawCoin
};

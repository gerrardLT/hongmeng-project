// 少数民族纹样绘制函数 p021-p035
'use strict';
const { PI, sin, cos, sqrt } = Math;
const TAU = PI * 2;

// ===== p021 苗族蜡染纹 =====
function drawMiaoBatik(ctx, x, y, size, color) {
  const s = size * 0.4;
  ctx.save();
  // 靛蓝底
  ctx.fillStyle = '#1B3A5C';
  ctx.fillRect(x - s, y - s, s * 2, s * 2);
  // 白色几何花卉
  ctx.strokeStyle = '#FFFFFF';
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  // 中心花
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    ctx.beginPath();
    ctx.ellipse(x + cos(a) * s * 0.3, y + sin(a) * s * 0.3,
      s * 0.08, s * 0.2, a, 0, TAU);
    ctx.stroke();
  }
  // 中心圆
  ctx.beginPath();
  ctx.arc(x, y, s * 0.12, 0, TAU);
  ctx.fill();
  // 角落装饰 - 小菱形
  const corners = [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]];
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x + s * cx, y + s * cy - s * 0.12);
    ctx.lineTo(x + s * cx + s * 0.08, y + s * cy);
    ctx.lineTo(x + s * cx, y + s * cy + s * 0.12);
    ctx.lineTo(x + s * cx - s * 0.08, y + s * cy);
    ctx.closePath();
    ctx.fill();
  }
  // 边缘波浪线
  ctx.beginPath();
  for (let i = 0; i <= 16; i++) {
    const px = x - s + (s * 2 / 16) * i;
    const py = y - s + sin(i * PI / 4) * s * 0.06;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

// ===== p022 苗族刺绣纹 =====
function drawMiaoEmbroidery(ctx, x, y, size, color) {
  const s = size * 0.38;
  const colors = ['#E63946', '#F4A261', '#2A9D8F', '#264653', '#E9C46A'];
  ctx.save();
  ctx.lineWidth = 2;
  // 十字绣风格网格
  const gridSize = s * 0.18;
  const half = gridSize / 2;
  // 创建十字绣图案 - 菱形
  for (let row = -4; row <= 4; row++) {
    for (let col = -4; col <= 4; col++) {
      const dist = Math.abs(row) + Math.abs(col);
      if (dist > 4) continue;
      const px = x + col * gridSize;
      const py = y + row * gridSize;
      const ci = dist % colors.length;
      ctx.fillStyle = colors[ci];
      // 十字
      ctx.fillRect(px - half, py - half * 0.3, gridSize, half * 0.6);
      ctx.fillRect(px - half * 0.3, py - half, half * 0.6, gridSize);
    }
  }
  ctx.restore();
}

// ===== p023 苗族银饰纹 =====
function drawMiaoSilver(ctx, x, y, size, color) {
  const s = size * 0.38;
  ctx.save();
  ctx.strokeStyle = '#C0C0C0';
  ctx.lineWidth = 2;
  // 大圆环
  ctx.beginPath();
  ctx.arc(x, y, s * 0.7, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, s * 0.6, 0, TAU);
  ctx.stroke();
  // 内部螺旋
  ctx.beginPath();
  for (let a = 0; a < TAU * 3; a += 0.1) {
    const r = s * 0.05 + a * s * 0.05;
    if (r > s * 0.45) break;
    const px = x + cos(a) * r;
    const py = y + sin(a) * r;
    a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.stroke();
  // 坠饰
  for (let i = 0; i < 5; i++) {
    const a = PI * 0.3 + (i / 4) * PI * 0.4;
    const bx = x + cos(a) * s * 0.7;
    const by = y + sin(a) * s * 0.7;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by + s * 0.25);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bx, by + s * 0.28, s * 0.04, 0, TAU);
    ctx.fillStyle = '#C0C0C0';
    ctx.fill();
  }
  // 小装饰圈
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    ctx.beginPath();
    ctx.arc(x + cos(a) * s * 0.35, y + sin(a) * s * 0.35, s * 0.06, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

// ===== p024 藏族唐卡纹 =====
function drawTibetanThangka(ctx, x, y, size, color) {
  const s = size * 0.4;
  ctx.save();
  // 莲花宝座
  ctx.strokeStyle = '#D4A843';
  ctx.lineWidth = 2;
  // 莲瓣基座
  for (let i = 0; i < 7; i++) {
    const a = PI + (i / 6) * PI;
    ctx.beginPath();
    ctx.ellipse(x + cos(a) * s * 0.4, y + s * 0.45 + sin(a) * s * 0.1,
      s * 0.12, s * 0.08, a - PI / 2, 0, TAU);
    ctx.stroke();
  }
  // 火焰背光环
  ctx.strokeStyle = '#C41A16';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    const r1 = s * 0.55;
    const r2 = s * 0.75;
    ctx.beginPath();
    ctx.moveTo(x + cos(a) * r1, y - s * 0.1 + sin(a) * r1);
    ctx.quadraticCurveTo(
      x + cos(a + 0.15) * r2, y - s * 0.1 + sin(a + 0.15) * r2,
      x + cos(a + PI / 12) * r1, y - s * 0.1 + sin(a + PI / 12) * r1
    );
    ctx.stroke();
  }
  // 中心光环
  ctx.strokeStyle = '#D4A843';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.1, s * 0.35, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - s * 0.1, s * 0.25, 0, TAU);
  ctx.stroke();
  // 莲花
  ctx.fillStyle = '#E8A0BF';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU - PI / 2;
    ctx.beginPath();
    ctx.ellipse(x + cos(a) * s * 0.12, y - s * 0.1 + sin(a) * s * 0.12,
      s * 0.05, s * 0.12, a, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// ===== p025 藏族吉祥八宝纹 =====
function drawTibetanEightTreasures(ctx, x, y, size, color) {
  const s = size * 0.35;
  ctx.save();
  ctx.strokeStyle = '#D4A843';
  ctx.lineWidth = 2;
  // 法轮（中心）
  ctx.beginPath();
  ctx.arc(x, y, s * 0.25, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, s * 0.08, 0, TAU);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    ctx.beginPath();
    ctx.moveTo(x + cos(a) * s * 0.08, y + sin(a) * s * 0.08);
    ctx.lineTo(x + cos(a) * s * 0.25, y + sin(a) * s * 0.25);
    ctx.stroke();
  }
  // 周围8个符号位置
  const symbols = [
    [0, -0.75], [0.53, -0.53], [0.75, 0], [0.53, 0.53],
    [0, 0.75], [-0.53, 0.53], [-0.75, 0], [-0.53, -0.53]
  ];
  const drawFns = [drawWheel, drawFish8, drawVase, drawLotus8, drawConch, drawKnot, drawBanner, drawUmbrella];
  for (let i = 0; i < 8; i++) {
    const [sx, sy] = symbols[i];
    drawFns[i](ctx, x + s * sx, y + s * sy, s * 0.18);
  }
  ctx.restore();
}
function drawWheel(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); }
function drawFish8(ctx, x, y, r) {
  ctx.beginPath(); ctx.ellipse(x - r * 0.2, y, r * 0.15, r * 0.4, 0, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x + r * 0.2, y, r * 0.15, r * 0.4, 0, 0, TAU); ctx.stroke();
}
function drawVase(ctx, x, y, r) {
  ctx.beginPath(); ctx.moveTo(x - r * 0.3, y + r); ctx.lineTo(x - r * 0.5, y); ctx.quadraticCurveTo(x, y - r, x + r * 0.5, y); ctx.lineTo(x + r * 0.3, y + r); ctx.stroke();
}
function drawLotus8(ctx, x, y, r) {
  for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; ctx.beginPath(); ctx.ellipse(x + cos(a) * r * 0.3, y + sin(a) * r * 0.3, r * 0.1, r * 0.25, a, 0, TAU); ctx.stroke(); }
}
function drawConch(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + r * 0.5, y); ctx.quadraticCurveTo(x + r, y + r * 0.5, x + r * 0.3, y + r); ctx.stroke(); }
function drawKnot(ctx, x, y, r) { ctx.beginPath(); ctx.rect(x - r * 0.4, y - r * 0.4, r * 0.8, r * 0.8); ctx.moveTo(x - r * 0.4, y); ctx.lineTo(x + r * 0.4, y); ctx.moveTo(x, y - r * 0.4); ctx.lineTo(x, y + r * 0.4); ctx.stroke(); }
function drawBanner(ctx, x, y, r) { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x - r * 0.3, y + r); ctx.lineTo(x + r * 0.3, y + r); ctx.closePath(); ctx.stroke(); }
function drawUmbrella(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r * 0.5, PI, 0); ctx.moveTo(x, y); ctx.lineTo(x, y + r * 0.7); ctx.stroke(); }

// ===== p026 藏族格桑花纹 =====
function drawTibetanGesang(ctx, x, y, size, color) {
  const s = size * 0.13;
  const colors = ['#E63946', '#F4A261', '#E9C46A', '#2A9D8F', '#D946EF'];
  ctx.save();
  // 多朵散布
  const positions = [[0, 0], [-2.2, -1.8], [2.0, -1.5], [-1.5, 1.8], [1.8, 2.0], [0.5, -2.5], [-2.5, 0.5]];
  for (let p = 0; p < positions.length; p++) {
    const [px, py] = positions[p];
    const cx = x + s * px;
    const cy = y + s * py;
    const c = colors[p % colors.length];
    ctx.fillStyle = c;
    ctx.strokeStyle = c;
    ctx.lineWidth = 1.5;
    // 八瓣花
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      ctx.beginPath();
      ctx.ellipse(cx + cos(a) * s * 0.4, cy + sin(a) * s * 0.4,
        s * 0.15, s * 0.35, a, 0, TAU);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.15, 0, TAU);
    ctx.fillStyle = '#D4A843';
    ctx.fill();
  }
  ctx.restore();
}

// ===== p027 彝族刺绣几何纹 =====
function drawYiGeometric(ctx, x, y, size, color) {
  const s = size * 0.4;
  const colors = { black: '#2C2C2C', red: '#C41A16', yellow: '#D4A843' };
  ctx.save();
  ctx.lineWidth = 2;
  // 菱形拼接行
  for (let row = -2; row <= 2; row++) {
    for (let col = -2; col <= 2; col++) {
      const cx = x + col * s * 0.45;
      const cy = y + row * s * 0.45;
      const ci = (Math.abs(row) + Math.abs(col)) % 3;
      const c = ci === 0 ? colors.red : ci === 1 ? colors.yellow : colors.black;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.2);
      ctx.lineTo(cx + s * 0.2, cy);
      ctx.lineTo(cx, cy + s * 0.2);
      ctx.lineTo(cx - s * 0.2, cy);
      ctx.closePath();
      ctx.fill();
      // 内部三角纹
      ctx.strokeStyle = ci === 0 ? colors.yellow : colors.red;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.08, cy + s * 0.05);
      ctx.lineTo(cx + s * 0.08, cy + s * 0.05);
      ctx.lineTo(cx, cy - s * 0.08);
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ===== p028 彝族火纹 =====
function drawYiFire(ctx, x, y, size, color) {
  const s = size * 0.35;
  const colors = ['#C41A16', '#D4A843', '#FF6B35'];
  ctx.save();
  ctx.lineWidth = 2;
  // 排列火焰
  for (let col = -2; col <= 2; col++) {
    const bx = x + col * s * 0.5;
    const by = y + s * 0.3;
    const ci = (col + 3) % 3;
    ctx.fillStyle = colors[ci];
    ctx.strokeStyle = colors[ci];
    // 火焰主体
    ctx.beginPath();
    ctx.moveTo(bx - s * 0.15, by);
    ctx.quadraticCurveTo(bx - s * 0.2, by - s * 0.5, bx, by - s * 0.8 - Math.abs(col) * s * 0.1);
    ctx.quadraticCurveTo(bx + s * 0.2, by - s * 0.5, bx + s * 0.15, by);
    ctx.closePath();
    ctx.fill();
    // 内焰
    ctx.fillStyle = '#D4A843';
    ctx.beginPath();
    ctx.moveTo(bx - s * 0.07, by - s * 0.05);
    ctx.quadraticCurveTo(bx - s * 0.1, by - s * 0.35, bx, by - s * 0.5);
    ctx.quadraticCurveTo(bx + s * 0.1, by - s * 0.35, bx + s * 0.07, by - s * 0.05);
    ctx.closePath();
    ctx.fill();
  }
  // 底部横线
  ctx.strokeStyle = '#2C2C2C';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - s, y + s * 0.35);
  ctx.lineTo(x + s, y + s * 0.35);
  ctx.stroke();
  ctx.restore();
}

// ===== p029 彝族虎纹 =====
function drawYiTiger(ctx, x, y, size, color) {
  const s = size * 0.38;
  ctx.save();
  // 虎头轮廓
  ctx.strokeStyle = '#D4A843';
  ctx.fillStyle = '#D4A843';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, s * 0.55, 0, TAU);
  ctx.stroke();
  // 耳朵
  ctx.beginPath();
  ctx.moveTo(x - s * 0.4, y - s * 0.4);
  ctx.lineTo(x - s * 0.55, y - s * 0.7);
  ctx.lineTo(x - s * 0.2, y - s * 0.5);
  ctx.moveTo(x + s * 0.4, y - s * 0.4);
  ctx.lineTo(x + s * 0.55, y - s * 0.7);
  ctx.lineTo(x + s * 0.2, y - s * 0.5);
  ctx.stroke();
  // 眼睛
  ctx.fillStyle = '#2C2C2C';
  ctx.beginPath();
  ctx.ellipse(x - s * 0.2, y - s * 0.1, s * 0.1, s * 0.07, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + s * 0.2, y - s * 0.1, s * 0.1, s * 0.07, 0, 0, TAU);
  ctx.fill();
  // 鼻子
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.05);
  ctx.lineTo(x - s * 0.06, y + s * 0.12);
  ctx.lineTo(x + s * 0.06, y + s * 0.12);
  ctx.closePath();
  ctx.fill();
  // 嘴
  ctx.strokeStyle = '#2C2C2C';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.12);
  ctx.lineTo(x, y + s * 0.22);
  ctx.moveTo(x - s * 0.12, y + s * 0.22);
  ctx.quadraticCurveTo(x, y + s * 0.3, x + s * 0.12, y + s * 0.22);
  ctx.stroke();
  // 王字
  ctx.strokeStyle = '#C41A16';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.15, y - s * 0.35);
  ctx.lineTo(x + s * 0.15, y - s * 0.35);
  ctx.moveTo(x - s * 0.12, y - s * 0.25);
  ctx.lineTo(x + s * 0.12, y - s * 0.25);
  ctx.moveTo(x - s * 0.1, y - s * 0.15);
  ctx.lineTo(x + s * 0.1, y - s * 0.15);
  ctx.moveTo(x, y - s * 0.35);
  ctx.lineTo(x, y - s * 0.15);
  ctx.stroke();
  // 条纹
  ctx.strokeStyle = '#2C2C2C';
  ctx.lineWidth = 2;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const a = PI / 2 + side * (PI / 6 + i * PI / 10);
      ctx.beginPath();
      ctx.moveTo(x + cos(a) * s * 0.35, y + sin(a) * s * 0.1);
      ctx.lineTo(x + cos(a) * s * 0.55, y + sin(a) * s * 0.15);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ===== p030 壮族织锦纹 =====
function drawZhuangBrocade(ctx, x, y, size, color) {
  const s = size * 0.4;
  const colors = ['#C41A16', '#D4A843', '#2A9D8F', '#E63946'];
  ctx.save();
  ctx.lineWidth = 1.5;
  // 菱形骨架 + 内部花卉
  for (let row = -2; row <= 2; row++) {
    for (let col = -2; col <= 2; col++) {
      const cx = x + col * s * 0.5 + (row % 2) * s * 0.25;
      const cy = y + row * s * 0.5;
      const ci = (Math.abs(row) + Math.abs(col)) % colors.length;
      // 菱形
      ctx.strokeStyle = colors[ci];
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.22);
      ctx.lineTo(cx + s * 0.22, cy);
      ctx.lineTo(cx, cy + s * 0.22);
      ctx.lineTo(cx - s * 0.22, cy);
      ctx.closePath();
      ctx.stroke();
      // 内部小花
      ctx.fillStyle = colors[(ci + 1) % colors.length];
      for (let p = 0; p < 4; p++) {
        const a = (p / 4) * TAU + PI / 4;
        ctx.beginPath();
        ctx.arc(cx + cos(a) * s * 0.08, cy + sin(a) * s * 0.08, s * 0.03, 0, TAU);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

// ===== p031 壮族铜鼓纹 =====
function drawZhuangBronzeDrum(ctx, x, y, size, color) {
  const s = size * 0.4;
  ctx.save();
  ctx.strokeStyle = '#D4A843';
  ctx.lineWidth = 2;
  // 同心圆
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(x, y, s * i * 0.18, 0, TAU);
    ctx.stroke();
  }
  // 中心太阳
  ctx.fillStyle = '#D4A843';
  ctx.beginPath();
  ctx.arc(x, y, s * 0.12, 0, TAU);
  ctx.fill();
  // 放射线（太阳芒）
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    ctx.beginPath();
    ctx.moveTo(x + cos(a) * s * 0.12, y + sin(a) * s * 0.12);
    ctx.lineTo(x + cos(a) * s * 0.35, y + sin(a) * s * 0.35);
    ctx.stroke();
  }
  // 外圈装饰锯齿
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU;
    const na = ((i + 0.5) / 24) * TAU;
    ctx.beginPath();
    ctx.moveTo(x + cos(a) * s * 0.75, y + sin(a) * s * 0.75);
    ctx.lineTo(x + cos(na) * s * 0.9, y + sin(na) * s * 0.9);
    ctx.lineTo(x + cos((i + 1) / 24 * TAU) * s * 0.75, y + sin((i + 1) / 24 * TAU) * s * 0.75);
    ctx.stroke();
  }
  ctx.restore();
}

// ===== p032 壮族花山壁画纹 =====
function drawZhuangHuashan(ctx, x, y, size, color) {
  const s = size * 0.35;
  ctx.save();
  ctx.fillStyle = '#8B4513';
  // 背景岩石色
  // 蛙形人物跳舞剪影
  const figures = [[-0.6, 0], [0, 0], [0.6, 0]];
  for (const [fx, fy] of figures) {
    const px = x + s * fx;
    const py = y + s * fy;
    ctx.fillStyle = '#8B2500';
    // 头
    ctx.beginPath();
    ctx.arc(px, py - s * 0.4, s * 0.1, 0, TAU);
    ctx.fill();
    // 身体
    ctx.fillRect(px - s * 0.04, py - s * 0.3, s * 0.08, s * 0.35);
    // 双臂上举
    ctx.lineWidth = s * 0.06;
    ctx.strokeStyle = '#8B2500';
    ctx.beginPath();
    ctx.moveTo(px - s * 0.04, py - s * 0.2);
    ctx.lineTo(px - s * 0.3, py - s * 0.45);
    ctx.moveTo(px + s * 0.04, py - s * 0.2);
    ctx.lineTo(px + s * 0.3, py - s * 0.45);
    ctx.stroke();
    // 双腿叉开
    ctx.beginPath();
    ctx.moveTo(px, py + s * 0.05);
    ctx.lineTo(px - s * 0.2, py + s * 0.4);
    ctx.moveTo(px, py + s * 0.05);
    ctx.lineTo(px + s * 0.2, py + s * 0.4);
    ctx.stroke();
  }
  // 顶部太阳
  ctx.fillStyle = '#8B2500';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.8, s * 0.08, 0, TAU);
  ctx.fill();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + cos(a) * s * 0.1, y - s * 0.8 + sin(a) * s * 0.1);
    ctx.lineTo(x + cos(a) * s * 0.18, y - s * 0.8 + sin(a) * s * 0.18);
    ctx.stroke();
  }
  ctx.restore();
}

// ===== p033 维吾尔族艾德莱斯绸纹 =====
function drawUyghurAtlas(ctx, x, y, size, color) {
  const s = size * 0.4;
  const stripeColors = ['#E63946', '#F4A261', '#2A9D8F', '#7209B7', '#3A86FF', '#E9C46A', '#06D6A0', '#EF476F'];
  ctx.save();
  // 竖条状渐变彩色条纹
  const stripeW = s * 2 / stripeColors.length;
  for (let i = 0; i < stripeColors.length; i++) {
    const sx = x - s + i * stripeW;
    // 渐变效果
    const grad = ctx.createLinearGradient(sx, y - s, sx, y + s);
    grad.addColorStop(0, stripeColors[i]);
    grad.addColorStop(0.5, stripeColors[(i + 1) % stripeColors.length]);
    grad.addColorStop(1, stripeColors[i]);
    ctx.fillStyle = grad;
    ctx.fillRect(sx, y - s, stripeW, s * 2);
    // 梳子形纹理
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    for (let j = 0; j < 6; j++) {
      const ty = y - s + j * s * 2 / 6;
      ctx.beginPath();
      ctx.moveTo(sx, ty);
      ctx.lineTo(sx + stripeW, ty + stripeW * 0.5);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ===== p034 维吾尔族巴旦木纹 =====
function drawUyghurAlmond(ctx, x, y, size, color) {
  const s = size * 0.28;
  const colors = ['#1B7A4A', '#2A9D8F', '#D4A843'];
  ctx.save();
  // 排列杏仁形
  const positions = [[0, 0], [-1.5, -1.3], [1.5, -1.3], [-1.5, 1.3], [1.5, 1.3], [0, -2.2], [0, 2.2]];
  for (let p = 0; p < positions.length; p++) {
    const [px, py] = positions[p];
    const cx = x + s * px * 0.5;
    const cy = y + s * py * 0.5;
    const ci = p % colors.length;
    // 外层杏仁形
    ctx.strokeStyle = colors[ci];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.5);
    ctx.bezierCurveTo(cx + s * 0.35, cy - s * 0.25, cx + s * 0.35, cy + s * 0.25, cx, cy + s * 0.5);
    ctx.bezierCurveTo(cx - s * 0.35, cy + s * 0.25, cx - s * 0.35, cy - s * 0.25, cx, cy - s * 0.5);
    ctx.stroke();
    // 内层
    ctx.strokeStyle = colors[(ci + 1) % colors.length];
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.3);
    ctx.bezierCurveTo(cx + s * 0.2, cy - s * 0.15, cx + s * 0.2, cy + s * 0.15, cx, cy + s * 0.3);
    ctx.bezierCurveTo(cx - s * 0.2, cy + s * 0.15, cx - s * 0.2, cy - s * 0.15, cx, cy - s * 0.3);
    ctx.stroke();
    // 内部小卷纹
    ctx.strokeStyle = colors[(ci + 2) % colors.length];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.08, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

// ===== p035 维吾尔族穹顶纹 =====
function drawUyghurDome(ctx, x, y, size, color) {
  const s = size * 0.42;
  const colors = ['#2A9D8F', '#1B7A4A', '#D4A843', '#3A86FF'];
  ctx.save();
  // 放射状几何图案
  const segments = 8;
  // 外圈
  ctx.strokeStyle = colors[0];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, s * 0.9, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, s * 0.7, 0, TAU);
  ctx.stroke();
  // 放射线
  for (let i = 0; i < segments * 2; i++) {
    const a = (i / (segments * 2)) * TAU;
    ctx.strokeStyle = colors[i % colors.length];
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + cos(a) * s * 0.15, y + sin(a) * s * 0.15);
    ctx.lineTo(x + cos(a) * s * 0.9, y + sin(a) * s * 0.9);
    ctx.stroke();
  }
  // 中间装饰环
  ctx.strokeStyle = colors[2];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, s * 0.45, 0, TAU);
  ctx.stroke();
  // 花瓣装饰
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * TAU;
    const mid = (i + 0.5) / segments * TAU;
    // 扇区内花瓣
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(x + cos(a) * s * 0.45, y + sin(a) * s * 0.45);
    ctx.quadraticCurveTo(x + cos(mid) * s * 0.65, y + sin(mid) * s * 0.65,
      x + cos((i + 1) / segments * TAU) * s * 0.45, y + sin((i + 1) / segments * TAU) * s * 0.45);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // 中心星形
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * TAU - PI / 2;
    const a2 = ((i + 0.5) / segments) * TAU - PI / 2;
    const method = i === 0 ? 'moveTo' : 'lineTo';
    ctx[method](x + cos(a1) * s * 0.15, y + sin(a1) * s * 0.15);
    ctx.lineTo(x + cos(a2) * s * 0.08, y + sin(a2) * s * 0.08);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

module.exports = {
  drawMiaoBatik, drawMiaoEmbroidery, drawMiaoSilver,
  drawTibetanThangka, drawTibetanEightTreasures, drawTibetanGesang,
  drawYiGeometric, drawYiFire, drawYiTiger,
  drawZhuangBrocade, drawZhuangBronzeDrum, drawZhuangHuashan,
  drawUyghurAtlas, drawUyghurAlmond, drawUyghurDome
};

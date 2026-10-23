// Animated 3D twenty-sided die rendered on a full-window canvas.
(function () {
  const PHI = (1 + Math.sqrt(5)) / 2;

  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const matMul = (A, B) => A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
  const apply = (M, v) => [dot(M[0], v), dot(M[1], v), dot(M[2], v)];

  function axisAngle(axis, angle) {
    const [x, y, z] = norm(axis);
    const c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
    return [
      [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
      [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
      [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
    ];
  }

  // Build icosahedron geometry.
  const verts = [];
  for (const a of [-1, 1]) for (const b of [-PHI, PHI]) {
    verts.push([0, a, b], [a, b, 0], [b, 0, a]);
  }
  const faces = [];
  const near = (p, q) => Math.abs(Math.hypot(...sub(p, q)) - 2) < 1e-6;
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) for (let k = j + 1; k < 12; k++) {
    if (near(verts[i], verts[j]) && near(verts[j], verts[k]) && near(verts[i], verts[k])) {
      let f = [i, j, k];
      const n = cross(sub(verts[j], verts[i]), sub(verts[k], verts[i]));
      const c = [0, 1, 2].map((d) => (verts[i][d] + verts[j][d] + verts[k][d]) / 3);
      if (dot(n, c) < 0) f = [i, k, j];
      faces.push({ idx: f, center: c, normal: norm(c), number: 0 });
    }
  }
  // Number faces so opposite faces sum to 21, like a real d20.
  let next = 1;
  for (const f of faces) {
    if (f.number) continue;
    const opp = faces.find((g) => !g.number && g !== f && dot(g.normal, f.normal) < -0.999);
    f.number = next;
    opp.number = 21 - next;
    next++;
  }

  // Rotation that turns the given face toward the viewer (+z).
  function faceToViewer(face) {
    const n = face.normal;
    const target = [0, 0, 1];
    const axis = cross(n, target);
    const angle = Math.acos(Math.max(-1, Math.min(1, dot(n, target))));
    let R = Math.hypot(...axis) < 1e-9 ? [[1, 0, 0], [0, 1, 0], [0, 0, 1]] : axisAngle(axis, angle);
    // Spin around the view axis so the top vertex of the face points up (keeps the number upright).
    const pts = face.idx.map((i) => apply(R, verts[i]));
    const centroid = apply(R, face.center);
    let best = pts[0];
    for (const p of pts) if (p[1] > best[1]) best = p;
    const up = [best[0] - centroid[0], best[1] - centroid[1]];
    const spin = Math.PI / 2 - Math.atan2(up[1], up[0]);
    return matMul(axisAngle([0, 0, 1], spin), R);
  }

  const canvas = document.getElementById('dice-canvas');
  const overlay = document.getElementById('dice-overlay');
  const resultEl = document.getElementById('dice-result');
  const ctx = canvas.getContext('2d');
  const LIGHT = norm([-0.45, 0.6, 0.85]);
  const APPEARANCE_KEY = 'cya-rpg-dice-appearance-v1';
  const colors = {
    ruby: [150, 28, 32],
    sapphire: [30, 80, 175],
    emerald: [25, 125, 65],
    amethyst: [110, 45, 160],
    amber: [180, 110, 20],
    obsidian: [35, 38, 48],
  };
  const colorPicker = document.getElementById('dice-color');
  const finishPicker = document.getElementById('dice-finish');
  const preview = document.getElementById('dice-preview');
  let appearance = { color: 'ruby', finish: 'solid' };
  try {
    const saved = JSON.parse(localStorage.getItem(APPEARANCE_KEY));
    if (saved && Object.hasOwn(colors, saved.color)) appearance.color = saved.color;
    if (saved && ['solid', 'translucent'].includes(saved.finish)) appearance.finish = saved.finish;
  } catch (error) {
    console.warn('Could not load dice appearance preferences.', error);
  }
  colorPicker.value = appearance.color;
  finishPicker.value = appearance.finish;

  function updatePreview() {
    preview.style.setProperty('--dice-rgb', colors[appearance.color].map((channel, i) => channel + [20, 8, 10][i]).join(','));
    preview.style.setProperty('--dice-alpha', appearance.finish === 'translucent' ? '0.62' : '1');
  }
  function changeAppearance() {
    appearance = { color: colorPicker.value, finish: finishPicker.value };
    updatePreview();
    try {
      localStorage.setItem(APPEARANCE_KEY, JSON.stringify(appearance));
    } catch (error) {
      console.warn('Could not save dice appearance preferences.', error);
    }
  }
  colorPicker.addEventListener('change', changeAppearance);
  finishPicker.addEventListener('change', changeAppearance);
  updatePreview();

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);

  function draw(R, cx, cy, size) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    // Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx + size * 0.15, cy + size * 1.15, size * 0.95, size * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const cam = 8;
    const proj = (v) => {
      const p = [v[0] * size, v[1] * size, v[2] * size];
      const f = (cam * size) / (cam * size - p[2]);
      return [cx + p[0] * f, cy - p[1] * f];
    };
    const rotated = verts.map((v) => apply(R, v));
    const visible = faces
      .map((f) => ({ f, n: apply(R, f.normal), c: apply(R, f.center) }))
      .filter((o) => o.n[2] > 0.01)
      .sort((a, b) => a.c[2] - b.c[2]);

    for (const { f, n, c } of visible) {
      const pts = f.idx.map((i) => proj(rotated[i]));
      const light = 0.35 + 0.65 * Math.max(0, dot(n, LIGHT));
      const [r, g, b] = colors[appearance.color].map((channel, i) => Math.round(channel * light + [20, 8, 10][i]));
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      ctx.lineTo(pts[1][0], pts[1][1]);
      ctx.lineTo(pts[2][0], pts[2][1]);
      ctx.closePath();
      ctx.fillStyle = `rgba(${r},${g},${b},${appearance.finish === 'translucent' ? 0.62 : 1})`;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#d9a441';
      ctx.stroke();

      if (n[2] > 0.25) {
        const [tx, ty] = proj(c);
        // Orient number using the face's "up" vertex direction in screen space.
        let topIdx = 0;
        for (let k = 1; k < 3; k++) if (rotated[f.idx[k]][1] > rotated[f.idx[topIdx]][1]) topIdx = k;
        const ang = Math.atan2(pts[topIdx][1] - ty, pts[topIdx][0] - tx) + Math.PI / 2;
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(ang);
        ctx.scale(1, Math.max(0.3, n[2]));
        ctx.font = `700 ${Math.round(size * 0.42)}px Cinzel, Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255, 236, 190, ${Math.min(1, n[2] * 1.4)})`;
        ctx.fillText(String(f.number), 0, size * 0.03);
        if (f.number === 6 || f.number === 9) {
          ctx.fillRect(-size * 0.1, size * 0.2, size * 0.2, size * 0.035);
        }
        ctx.restore();
      }
    }
  }

  let busy = false;

  /**
   * Roll an animated d20. Resolves with the rolled value once the die lands
   * and the player dismisses the overlay.
   * @param {string} [label] text shown under the die (may include {roll}).
   */
  function rollD20(describe) {
    if (busy) return Promise.resolve(null);
    busy = true;
    const buf = new Uint32Array(1);
    (window.crypto || window.msCrypto).getRandomValues(buf);
    const value = (buf[0] % 20) + 1;
    const face = faces.find((f) => f.number === value);
    const finalR = faceToViewer(face);
    const axis = norm([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]);
    const turns = (4 + Math.random() * 3) * Math.PI * 2;

    resize();
    overlay.classList.remove('hidden');
    resultEl.classList.add('hidden');

    const W = window.innerWidth, H = window.innerHeight;
    const size = Math.max(45, Math.min(70, Math.min(W, H) * 0.09));
    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? -size * 2 : W + size * 2;
    const startY = H * (0.2 + Math.random() * 0.25);
    const endX = W / 2, endY = H / 2 - 20;
    const duration = 1900;
    const t0 = performance.now();

    return new Promise((resolve) => {
      function frame(now) {
        const t = Math.min(1, (now - t0) / duration);
        const ease = 1 - Math.pow(1 - t, 3);
        const R = matMul(axisAngle(axis, turns * (1 - ease)), finalR);
        const x = startX + (endX - startX) * ease;
        // Decaying bounces as the die tumbles to the center.
        const bounce = Math.abs(Math.cos(t * Math.PI * 3.5)) * (1 - t) * (1 - t) * H * 0.22;
        const y = startY + (endY - startY) * Math.min(1, t * 1.6) - bounce;
        draw(R, x, y, size);
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          const text = typeof describe === 'function' ? describe(value) : `You rolled ${value}`;
          resultEl.innerHTML = `${text}<span class="hint">${I18n.t('Click anywhere to continue')}</span>`;
          resultEl.classList.remove('hidden');
          const done = () => {
            overlay.removeEventListener('click', done);
            document.removeEventListener('keydown', onKey);
            overlay.classList.add('hidden');
            busy = false;
            resolve(value);
          };
          const onKey = (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); done(); } };
          setTimeout(() => {
            overlay.addEventListener('click', done);
            document.addEventListener('keydown', onKey);
          }, 250);
        }
      }
      requestAnimationFrame(frame);
    });
  }

  window.Dice = { rollD20, _faces: faces };
})();

/* Fondo: lluvia de código.
   - Acelera con la velocidad del scroll
   - Las columnas cercanas al cursor se encienden
   - El color se mezcla suavemente hacia el acento de la sección activa */
(() => {
  const cv = document.getElementById("rain");
  const ctx = cv.getContext("2d");
  const GLYPHS = "01{}[]<>/\\;:=+-*&|!?#$%_()アイウエオカキクケコ$sudo chmod 777 nmap ssh".replace(/\s/g, "");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SIZE = 16, TRAIL = 16;

  let W = 0, H = 0, dpr = 1, cols = [];
  let mouse = { x: -999, y: -999 };
  let scrollV = 0, lastY = scrollY, target = [255, 46, 77], color = [255, 46, 77];

  const rnd = (n) => (Math.random() * n) | 0;
  const g = () => GLYPHS[rnd(GLYPHS.length)];

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.ceil(W / (SIZE * 1.15));
    cols = Array.from({ length: n }, (_, i) => ({
      x: i * SIZE * 1.15 + 4,
      y: -rnd(H),
      v: 0.5 + Math.random() * 1.1,
      s: Array.from({ length: TRAIL }, g),
    }));
    ctx.font = `${SIZE - 3}px "JetBrains Mono", Consolas, monospace`;
  }

  function hexToRgb(h) {
    const n = parseInt(h.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function frame() {
    scrollV += ((scrollY - lastY) - scrollV) * 0.15;
    lastY = scrollY;
    for (let i = 0; i < 3; i++) color[i] += (target[i] - color[i]) * 0.04;
    const [r, gg, b] = color.map(Math.round);
    ctx.clearRect(0, 0, W, H);
    ctx.font = `${SIZE - 3}px "JetBrains Mono", Consolas, monospace`;

    const boost = 1 + Math.min(Math.abs(scrollV) * 0.35, 6);
    for (const c of cols) {
      const near = Math.max(0, 1 - Math.hypot(c.x - mouse.x, 0) / 160);
      c.y += c.v * (1.6 + near * 3) * boost * (scrollV < 0 ? -1 : 1);
      if (c.y - TRAIL * SIZE > H) { c.y = -rnd(300); c.v = 0.5 + Math.random() * 1.1; }
      if (c.y < -TRAIL * SIZE * 2) c.y = H + rnd(200);
      if (Math.random() < 0.05) c.s[rnd(TRAIL)] = g();

      for (let k = 0; k < TRAIL; k++) {
        const y = c.y - k * SIZE;
        if (y < -SIZE || y > H + SIZE) continue;
        const dm = Math.max(0, 1 - Math.hypot(c.x - mouse.x, y - mouse.y) / 170);
        const a = (1 - k / TRAIL) * (0.16 + near * 0.35) + dm * 0.55;
        ctx.fillStyle = k === 0
          ? `rgba(255,255,255,${Math.min(0.55, a + 0.2)})`
          : `rgba(${r},${gg},${b},${Math.min(0.9, a)})`;
        ctx.fillText(c.s[k], c.x, y);
      }
    }
    requestAnimationFrame(frame);
  }

  addEventListener("resize", resize);
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  resize();
  if (!reduce) frame();

  window.BG = { setAccent: (hex) => { target = hexToRgb(hex); } };
})();

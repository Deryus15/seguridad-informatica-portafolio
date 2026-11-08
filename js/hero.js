/* ============================================================
   HERO — Retrato dibujado con caracteres de código
   · Intro: el rostro se "escribe" de arriba hacia abajo
   · Mouse: los caracteres se repelen + se re-codifican; una lente revela la foto real
   · Inclinación 3D del retrato según el cursor
   · Clic: onda expansiva
   · Scroll: el retrato se desintegra hacia el fondo de código
   ============================================================ */
(() => {
  const wrap = document.getElementById("faceWrap");
  const cv = document.getElementById("face");
  const hero = document.getElementById("portada");
  const FD = window.FACE_DATA;
  if (!cv || !FD) return;
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- decodificar mapa (luminancia + máscara) ---- */
  const raw = Uint8Array.from(atob(FD.data), (c) => c.charCodeAt(0));
  const LUM = (x, y) => raw[(y * FD.w + x) * 2];
  const MSK = (x, y) => raw[(y * FD.w + x) * 2 + 1];

  /* ---- rampa de glifos: de oscuro a claro, mezclando símbolos de código ---- */
  const RAMP = [
    [".", "·"], [":", ";"], ["i", "/", "\\"], ["{", "}", "<", ">"],
    ["=", "+", "1", "0"], ["#", "$", "&", "?"], ["%", "@", "W", "M"],
  ];
  const BIN = ["0", "1"];
  const pick = (a) => a[(Math.random() * a.length) | 0];

  const photo = new Image();
  photo.src = "assets/img/foto.jpg";

  let W = 0, H = 0, dpr = 1;
  let cells = [], buckets = [], rect = { x: 0, y: 0, w: 0, h: 0 };
  let fontPx = 10, accent = [255, 46, 77];
  let mouse = { x: 0, y: 0, in: false, r: 0 };
  let tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  let waves = [];
  let t0 = performance.now(), running = true;
  const lens = document.createElement("canvas");
  const lctx = lens.getContext("2d");

  /* ---- construir celdas ---- */
  function layout() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = wrap.clientWidth; H = wrap.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const ar = FD.w / FD.h;
    let rw = H * ar, rh = H;
    if (rw > W) { rw = W; rh = W / ar; }
    rect = { x: (W - rw) / 2, y: H - rh, w: rw, h: rh };

    const gc = Math.max(70, Math.min(128, Math.round(rw / 5.6)));
    const cw = rw / gc, chh = cw * 1.75;
    const gr = Math.floor(rh / chh);
    fontPx = Math.max(7, chh * 0.92);

    cells = [];
    for (let j = 0; j < gr; j++) {
      for (let i = 0; i < gc; i++) {
        const u = Math.min(FD.w - 1, Math.floor(((i + 0.5) / gc) * FD.w));
        const v = Math.min(FD.h - 1, Math.floor(((j + 0.5) / gr) * FD.h));
        // promedio 2x2 para suavizar
        const u2 = Math.min(FD.w - 1, u + 1), v2 = Math.min(FD.h - 1, v + 1);
        const lum = (LUM(u, v) + LUM(u2, v) + LUM(u, v2) + LUM(u2, v2)) / 4 / 255;
        const m = (MSK(u, v) + MSK(u2, v) + MSK(u, v2) + MSK(u2, v2)) / 4 / 255;
        const subject = m > 0.5;
        if (subject && lum < 0.07) continue;
        if (!subject && Math.random() > 0.2) continue;

        const lvl = subject ? Math.min(RAMP.length - 1, Math.floor(lum * RAMP.length)) : -1;
        const ang = Math.random() * Math.PI * 2;
        cells.push({
          x: rect.x + (i + 0.5) * cw, y: rect.y + (j + 0.5) * chh,
          lum, subject, lvl,
          ch: subject ? pick(RAMP[lvl]) : pick(BIN),
          ox: 0, oy: 0, vx: 0, vy: 0,
          rev: 0.25 + (j / gr) * 1.7 + Math.random() * 0.5,
          dx: Math.cos(ang), dy: Math.sin(ang), dd: 0.4 + Math.random() * 1.2,
          b: 0,
        });
      }
    }
    // cubetas por color para minimizar cambios de fillStyle
    buckets = Array.from({ length: 16 }, () => []);
    for (const c of cells) {
      c.b = c.subject ? Math.min(11, Math.floor(c.lum * 12)) : 12 + ((Math.random() * 2) | 0);
      buckets[c.b].push(c);
    }
    t0 = performance.now();
  }

  const styleFor = (b) => {
    const [r, g, bl] = accent;
    if (b >= 12) return `rgba(${r},${g},${bl},${b === 12 ? 0.16 : 0.26})`;
    const k = (b + 1) / 12;               // 0..1
    const w = Math.pow(k, 1.6);           // mezcla hacia blanco cálido
    const R = r + (255 - r) * w, G = g + (236 - g) * w, B = bl + (226 - bl) * w;
    return `rgba(${R | 0},${G | 0},${B | 0},${0.35 + k * 0.65})`;
  };

  /* ---- bucle ---- */
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const t = (now - t0) / 1000;
    const sp = Math.min(1, Math.max(0, scrollY / (hero.offsetHeight * 0.85)));
    const sp2 = sp * sp;

    // inclinación 3D suave
    tilt.x += (tilt.tx - tilt.x) * 0.08;
    tilt.y += (tilt.ty - tilt.y) * 0.08;
    cv.style.transform = `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) translateY(${sp * -40}px)`;

    mouse.r += ((mouse.in ? 1 : 0) - mouse.r) * 0.12;
    ctx.clearRect(0, 0, W, H);
    ctx.font = `${fontPx}px "JetBrains Mono", Consolas, monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";

    const R = 120, R2 = R * R;
    const scanY = rect.y + (((t * 0.28) % 1.5) - 0.1) * rect.h;
    const hl = [];
    waves = waves.filter((w) => t - w.t < 1.8);

    for (const c of cells) {
      const age = t - c.rev;
      if (age < 0) continue;

      // --- física: repulsión del cursor + resortes ---
      if (mouse.in) {
        const dx = c.x + c.ox - mouse.x, dy = c.y + c.oy - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) || 1, f = (1 - d / R);
          c.vx += (dx / d) * f * f * 3.2; c.vy += (dy / d) * f * f * 3.2;
          if (Math.random() < 0.18) c.ch = c.subject ? pick(RAMP[Math.min(RAMP.length - 1, c.lvl + ((Math.random() * 3) | 0))]) : pick(BIN);
          c.hot = 1;
        }
      }
      for (const w of waves) {
        const d = Math.hypot(c.x - w.x, c.y - w.y), rr = (t - w.t) * 560;
        if (Math.abs(d - rr) < 26) {
          const k = (1 - (t - w.t) / 1.8) * 3.4, n = d || 1;
          c.vx += ((c.x - w.x) / n) * k; c.vy += ((c.y - w.y) / n) * k; c.hot = 1;
        }
      }
      c.vx += -c.ox * 0.07; c.vy += -c.oy * 0.07;
      c.vx *= 0.84; c.vy *= 0.84;
      c.ox += c.vx; c.oy += c.vy;

      // respiración sutil
      const br = reduce ? 0 : Math.sin(t * 1.3 + c.x * 0.02 + c.y * 0.014) * 0.7;

      // desintegración por scroll
      const px = c.x + c.ox + c.dx * c.dd * sp2 * 260 + br * 0.4;
      const py = c.y + c.oy + c.dy * c.dd * sp2 * 260 + br + sp2 * 140 * c.dd;

      const flash = age < 0.45;
      const onScan = Math.abs(c.y - scanY) < 9;
      if (flash || onScan || c.hot > 0.05) {
        hl.push(c, px, py, flash ? 1 - age / 0.45 : onScan ? 0.9 : c.hot);
        if (c.hot) c.hot *= 0.9;
        if (flash && Math.random() < 0.5) c.ch = c.subject ? pick(RAMP[c.lvl]) : pick(BIN);
        continue;
      }
      c._px = px; c._py = py;
    }

    // pase 1: cubetas
    ctx.globalAlpha = 1 - sp2 * 0.9;
    for (let b = 0; b < buckets.length; b++) {
      const arr = buckets[b];
      if (!arr.length) continue;
      ctx.fillStyle = styleFor(b);
      for (const c of arr) {
        if (t - c.rev < 0.45 || c._px === undefined) continue;
        if (Math.abs(c.y - scanY) < 9 || c.hot > 0.05) continue;
        ctx.fillText(c.ch, c._px, c._py);
      }
    }
    // pase 2: resaltados (flash de escritura, línea de escaneo, zona del cursor)
    for (let k = 0; k < hl.length; k += 4) {
      const c = hl[k], a = hl[k + 3];
      ctx.fillStyle = `rgba(255,${230 - a * 60 | 0},${225 - a * 90 | 0},${0.55 + a * 0.45})`;
      ctx.fillText(c.ch, hl[k + 1], hl[k + 2]);
    }
    ctx.globalAlpha = 1;

    // lente: revela la foto real bajo el cursor
    if (mouse.r > 0.02 && photo.complete && photo.naturalWidth) {
      const r = 88 * mouse.r, s = Math.ceil(r * 2 * dpr);
      if (lens.width !== s) { lens.width = s; lens.height = s; }
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.clearRect(0, 0, s, s);
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.globalCompositeOperation = "source-over";
      lctx.drawImage(photo, rect.x - (mouse.x - r), rect.y - (mouse.y - r), rect.w, rect.h);
      lctx.globalCompositeOperation = "destination-in";
      const gr = lctx.createRadialGradient(r, r, r * 0.35, r, r, r);
      gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      lctx.fillStyle = gr; lctx.fillRect(0, 0, r * 2, r * 2);
      ctx.globalAlpha = 0.95 * (1 - sp);
      ctx.drawImage(lens, mouse.x - r, mouse.y - r, r * 2, r * 2);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${0.55 * mouse.r})`;
      ctx.setLineDash([4, 7]); ctx.lineDashOffset = -t * 18;
      ctx.beginPath(); ctx.arc(mouse.x, mouse.y, r * 1.02, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  /* ---- interacción ---- */
  function toLocal(e) {
    const b = wrap.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top, w: b.width, h: b.height };
  }
  addEventListener("pointermove", (e) => {
    const p = toLocal(e);
    const inside = p.x > -40 && p.x < p.w + 40 && p.y > -40 && p.y < p.h + 40;
    mouse.in = inside; mouse.x = p.x; mouse.y = p.y;
    if (inside) { tilt.tx = (p.x / p.w - 0.5) * 16; tilt.ty = -(p.y / p.h - 0.5) * 11; }
    else { tilt.tx = 0; tilt.ty = 0; }
  }, { passive: true });
  wrap.addEventListener("pointerleave", () => { mouse.in = false; tilt.tx = tilt.ty = 0; });
  wrap.addEventListener("pointerdown", (e) => { const p = toLocal(e); waves.push({ x: p.x, y: p.y, t: (performance.now() - t0) / 1000 }); });

  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(layout, 160); });
  new IntersectionObserver(([en]) => {
    const was = running; running = en.isIntersecting;
    if (running && !was) requestAnimationFrame(frame);
  }, { threshold: 0 }).observe(hero);

  window.HERO = { setAccent: (rgb) => { accent = rgb; } };

  /* ---- terminal tipeado ---- */
  const term = document.getElementById("term");
  const A = window.PORTAFOLIO.autor;
  const total = window.PORTAFOLIO.secciones.reduce((n, s) => n + (s.grupos || []).reduce((m, g) => m + g.archivos.filter((a) => a.archivo).length, 0), 0);
  const lines = [
    ["$ ", "whoami"],
    ["› ", `${A.nombre.toLowerCase().replace(" ", ".").normalize("NFD").replace(/[̀-ͯ]/g, "")}`],
    ["$ ", `./portafolio --materia "${A.asignatura}"`],
    ["[ok] ", `cargando archivos · ${A.siglas} · ${A.periodo}`],
  ];
  function type() {
    if (reduce) { term.innerHTML = lines.map(([p, x]) => `<b>${p}</b>${x}`).join("\n"); return; }
    let li = 0, ci = 0, html = "";
    const tick = () => {
      if (li >= lines.length) return;
      const [p, x] = lines[li];
      const done = x.slice(0, ci);
      const cls = p.startsWith("[ok]") ? ' class="ok"' : "";
      term.innerHTML = html + `<b${cls}>${p}</b>${done}`;
      if (ci++ >= x.length) { html += `<b${cls}>${p}</b>${x}\n`; li++; ci = 0; setTimeout(tick, 260); }
      else setTimeout(tick, 22 + Math.random() * 30);
    };
    setTimeout(tick, 500);
  }

  layout();
  requestAnimationFrame(frame);
  type();
})();

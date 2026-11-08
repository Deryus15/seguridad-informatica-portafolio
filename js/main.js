/* ============================================================
   Lógica principal: render desde data.js, navegación, scroll,
   visor de documentos, efectos de texto y tarjetas.
   ============================================================ */
(() => {
  const P = window.PORTAFOLIO;
  const PAGES = window.PAGES || {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const slug = (p) => (p || "").split("/").pop().replace(/\.[^.]+$/, "");
  const hexRgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

  /* ---------- lista plana de documentos visibles (para el visor) ---------- */
  const DOCS = [];
  P.secciones.forEach((s) => (s.grupos || []).forEach((g) => g.archivos.forEach((a) => {
    if (a.archivo) { a._i = DOCS.length; a._sec = s; DOCS.push(a); }
  })));
  const uniqueFiles = new Set(DOCS.map((d) => d.archivo));

  /* ---------- pestañas ---------- */
  const tabs = $("#tabs");
  P.secciones.forEach((s) => {
    const a = document.createElement("a");
    a.className = "tab"; a.href = `#${s.id}`; a.textContent = s.nombre; a.style.setProperty("--c", s.color); a.dataset.id = s.id;
    tabs.appendChild(a);
  });

  /* ---------- chips y portada ---------- */
  const A = P.autor;
  $("#chips").innerHTML = [
    ["Universidad", `${A.universidad} (${A.siglas})`],
    ["Carrera", A.carrera],
    ["Profesor", A.profesor],
    ["Periodo", A.periodo],
    ["Sustentación", A.sustentacion],
  ].map(([k, v]) => `<li>${k} · <b>${esc(v)}</b></li>`).join("");
  $("#statDocs").dataset.to = uniqueFiles.size;
  $("#statSecs").dataset.to = P.secciones.length;
  $("#lema").textContent = A.lema;
  $("#footerMeta").innerHTML = `${esc(A.nombre)} · ${esc(A.carrera)}<br>${esc(A.universidad)} · ${esc(A.facultad)}<br>${esc(A.asignatura)} · Prof. ${esc(A.profesor)} · ${esc(A.periodo)}`;

  /* ---------- render de secciones ---------- */
  const main = $("#main");

  function cardHTML(a, s, delay) {
    const rolTxt = a.etiqueta || "Documento";
    const pages = PAGES[slug(a.archivo)];
    let thumb;
    if (a.tipo === "self") thumb = `<div class="card__file"><big>&lt;/&gt;</big><span>este sitio web</span></div>`;
    else if (a.tipo === "pptx") thumb = `<div class="card__file"><big>PPTX</big><span>presentación de PowerPoint</span></div>`;
    else thumb = `<img src="${esc(a.thumb)}" alt="Vista previa de ${esc(a.titulo)}" loading="lazy">` + (pages ? `<span class="card__pages">${pages} pág.</span>` : "") + `<div class="card__scan"></div>`;

    let actions;
    if (a.tipo === "self") actions = `<a class="btn primary" href="#portada">Volver a la portada</a>`;
    else if (a.tipo === "pptx") actions = `<a class="btn primary" href="${esc(a.archivo)}" download="${esc(a.original)}">Descargar .pptx</a>`;
    else actions = `<button class="btn primary" data-open="${a._i}">Ver documento</button><a class="btn" href="${esc(a.archivo)}" download="${esc(a.original || "")}">Descargar</a>`;

    return `<article class="card ${a.tipo === "self" ? "card--self" : ""}" style="--d:${delay}s">
      <div class="card__thumb">${thumb}</div>
      <div class="card__body">
        <span class="tag ${a.rol || ""}">${esc(rolTxt)}</span>
        <h4 class="card__title">${esc(a.titulo)}</h4>
        ${a.nota ? `<p class="card__note">${esc(a.nota)}</p>` : ""}
        <div class="card__actions">${actions}</div>
      </div>
    </article>`;
  }

  const pendingHTML = (txt) => `<div class="pending"><div class="pending__ic">⌛</div><div><b>Próximamente</b><span>${esc(txt)}</span><br><code>// se agrega editando js/data.js</code></div></div>`;

  function rubricHTML() {
    const rows = P.rubrica.map((r, i) => {
      const sec = P.secciones.find((s) => s.id === r.sec);
      return `<a class="rrow" href="#${r.sec}" style="--rc:${sec.color};--w:${(r.p / 15) * 100}%;--d:${0.08 * i}s">
        <span class="rrow__lbl">${esc(r.n)}</span><span class="rrow__bar"><i></i></span><b>${r.p}</b></a>`;
    }).join("");
    const total = P.rubrica.reduce((n, r) => n + r.p, 0);
    return `<div class="rubric rv"><h3>Cómo se evalúa este portafolio</h3><p>Rúbrica del Proyecto No. 3 · toca una fila para saltar a esa sección.</p><div class="rubric__rows">${rows}</div><div class="rubric__total"><span>Total final</span><span>${total} pts</span></div></div>`;
  }

  P.secciones.slice(1).forEach((s, i) => {
    const sec = document.createElement("section");
    sec.className = "sec"; sec.id = s.id; sec.dataset.color = s.color; sec.style.setProperty("--c", s.color);
    const num = String(i + 1).padStart(2, "0");

    let body = "";
    (s.grupos || []).forEach((g, gi) => {
      const cards = g.archivos.map((a, k) => cardHTML(a, s, k * 0.09)).join("");
      body += `<div class="group">
        <div class="group__head rv"><span class="group__n">${num}.${gi + 1}</span><h3 class="group__title">${esc(g.titulo)}</h3><span class="group__line"></span></div>
        <div class="group__cards">${cards}${g.pendiente ? pendingHTML(g.pendiente) : ""}</div>
      </div>`;
    });
    if (s.rubrica) body += rubricHTML();
    if (s.aportes && window.APORTES) {
      body += window.APORTES.map((a) => `<article class="apt rv" id="apt-${a.id}"><header class="apt__head">
          <span class="apt__n">${a.n}</span><span class="tag apt__tag">${esc(a.tag)}</span>
          <h3 class="apt__title">${esc(a.titulo)}</h3><p class="apt__desc">${esc(a.desc)}</p>
          <p class="apt__src">Basado en: ${esc(a.src)}</p></header><div class="apt__body" data-mount="${a.id}"></div></article>`).join("");
    }
    if (s.id === "conclusiones") {
      body += (s.conclusiones || []).length
        ? s.conclusiones.map((q) => `<blockquote class="quote rv">${esc(q.texto)}${q.autor ? `<small>— ${esc(q.autor)}</small>` : ""}</blockquote>`).join("")
        : `<div class="group in"><div class="group__cards">${pendingHTML(s.pendiente)}</div></div>`;
    }

    sec.innerHTML = `<div class="sec__ghost" aria-hidden="true">${esc(s.nombre)}</div>
      <header class="sec__head">
        <p class="sec__idx rv">SECCIÓN ${num}</p>
        <h2 class="sec__title"><span class="scramble" data-text="${esc(s.titulo)}">${esc(s.titulo)}</span></h2>
        <p class="sec__sub rv">${esc(s.sub || "")}</p>
      </header>
      <div class="sec__body">${body}</div>`;
    main.appendChild(sec);
    if (s.aportes && window.APORTES) window.APORTES.forEach((a) => a.mount($(`[data-mount="${a.id}"]`, sec)));
  });

  /* ---------- scramble de texto (efecto "descifrando") ---------- */
  const CH = "!<>-_\\/[]{}—=+*^?#01";
  function scramble(el) {
    if (el._done) return; el._done = true;
    const txt = el.dataset.text; if (reduce) return;
    let f = 0; const total = 24;
    const id = setInterval(() => {
      f++;
      el.textContent = [...txt].map((c, i) => c === " " ? " " : (i < (f / total) * txt.length * 1.15 ? c : CH[(Math.random() * CH.length) | 0])).join("");
      if (f >= total + 6) { el.textContent = txt; clearInterval(id); }
    }, 38);
  }
  const heroScr = $$(".hero .scramble");
  heroScr.forEach((el, i) => { el._done = false; setTimeout(() => scramble(el), 150 + i * 280); });

  /* ---------- reveal con IntersectionObserver ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    $$(".scramble", e.target).forEach(scramble);
    io.unobserve(e.target);
  }), { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
  $$(".sec, .group, .rv, .rubric").forEach((n) => io.observe(n));

  /* ---------- contadores ---------- */
  $$("[data-to], [data-count]").forEach((el) => {
    const to = +el.dataset.to || 0; if (!to) return;
    const t0 = performance.now() + 700;
    const step = (now) => {
      const k = Math.min(1, Math.max(0, (now - t0) / 1400));
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  /* ---------- scroll: progreso, sección activa, acento, parallax fantasma ---------- */
  const progress = $("#progress");
  const secs = [$("#portada"), ...$$(".sec")];
  const tabEls = $$(".tab");
  const root = document.documentElement;
  let activeId = null, ticking = false;

  function setActive(id, color) {
    if (id === activeId) return; activeId = id;
    tabEls.forEach((t) => t.classList.toggle("is-active", t.dataset.id === id));
    const act = tabEls.find((t) => t.dataset.id === id);
    if (act && tabs.scrollWidth > tabs.clientWidth) tabs.scrollTo({ left: act.offsetLeft - tabs.clientWidth / 2 + act.clientWidth / 2, behavior: "smooth" });
    const [r, g, b] = hexRgb(color);
    root.style.setProperty("--accent", color);
    root.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);
    window.BG && BG.setAccent(color);
    document.querySelector('meta[name="theme-color"]').content = "#07070b";
  }

  function onScroll() {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    const mid = innerHeight * 0.45;
    let cur = secs[0];
    for (const s of secs) {
      const r = s.getBoundingClientRect();
      if (r.top <= mid) cur = s;
      if (s.classList.contains("sec")) {
        const p = (innerHeight - r.top) / (r.height + innerHeight);
        s.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(3));
      }
    }
    setActive(cur.id, cur.dataset.color || "#ff2e4d");
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- tarjetas: inclinación 3D + brillo ---------- */
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest && e.target.closest(".card");
    if (!card) return;
    const b = card.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
    card.style.setProperty("--ry", ((x - 0.5) * 9).toFixed(2) + "deg");
    card.style.setProperty("--rx", (-(y - 0.5) * 9).toFixed(2) + "deg");
    card.style.setProperty("--mx", (x * 100) + "%");
    card.style.setProperty("--my", (y * 100) + "%");
  }, { passive: true });
  document.addEventListener("pointerout", (e) => {
    const card = e.target.closest && e.target.closest(".card");
    if (card && !card.contains(e.relatedTarget)) { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); }
  });

  /* ---------- cursor personalizado ---------- */
  const cur = $("#cursor");
  let cx = 0, cy = 0, tx = 0, ty = 0;
  addEventListener("pointermove", (e) => {
    tx = e.clientX; ty = e.clientY; cur.classList.add("on");
    cur.classList.toggle("big", !!(e.target.closest && e.target.closest("a, button, .card, .rrow, #face")));
  }, { passive: true });
  document.addEventListener("pointerleave", () => cur.classList.remove("on"));
  (function loop() { cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; cur.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); })();

  /* ---------- visor de documentos ---------- */
  const viewer = $("#viewer"), vBody = $("#vBody"), vTitle = $("#vTitle"), vTag = $("#vTag");
  const vOpen = $("#vOpen"), vDown = $("#vDown");
  let cur_i = -1, lastFocus = null;

  function openViewer(i) {
    const d = DOCS[i]; if (!d) return;
    cur_i = i;
    if (viewer.hidden) lastFocus = document.activeElement;
    viewer.hidden = false; document.body.classList.add("noscroll");
    vTitle.textContent = d.titulo;
    vTag.textContent = d.etiqueta || "Documento"; vTag.className = "tag " + (d.rol || "");
    const url = encodeURI(d.archivo);
    vOpen.href = url; vDown.href = url; vDown.setAttribute("download", d.original || "");
    // Visor propio: páginas como imágenes (un <iframe> con PDF falla al abrir con doble clic / file://)
    const n = PAGES[slug(d.archivo)] || 0, id = slug(d.archivo);
    let html = "";
    for (let p = 1; p <= n; p++) {
      const src = `assets/pages/${id}/${String(p).padStart(3, "0")}.webp`;
      html += `<div class="vpage" data-p="${p}"><img src="${src}" alt="${esc(d.titulo)} — página ${p}" ${p > 2 ? 'loading="lazy"' : ""}><span class="vpage__n">${p} / ${n}</span></div>`;
    }
    vBody.innerHTML = `<div class="viewer__pages" id="vPages">${html}</div>`;
    vBody.scrollTop = 0; setZoom(zoom);
    $("#vCount").textContent = n ? `pág. 1 / ${n}` : "";
    if (vObs) vObs.disconnect();
    vObs = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) $("#vCount").textContent = `pág. ${e.target.dataset.p} / ${n}`;
    }), { root: vBody, threshold: 0.5 });
    $$(".vpage", vBody).forEach((el) => vObs.observe(el));
    $("#vPrev").disabled = i <= 0; $("#vNext").disabled = i >= DOCS.length - 1;
    $("#vClose").focus();
  }
  let zoom = 900, vObs = null;
  function setZoom(w) {
    zoom = Math.max(420, Math.min(1500, w));
    const el = $("#vPages"); if (el) el.style.setProperty("--vw", zoom + "px");
  }
  $("#vZoomIn").addEventListener("click", () => setZoom(zoom + 150));
  $("#vZoomOut").addEventListener("click", () => setZoom(zoom - 150));
  function closeViewer() {
    viewer.hidden = true; vBody.innerHTML = ""; document.body.classList.remove("noscroll");
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (b) openViewer(+b.dataset.open);
  });
  $("#vClose").addEventListener("click", closeViewer);
  $("#vPrev").addEventListener("click", () => openViewer(cur_i - 1));
  $("#vNext").addEventListener("click", () => openViewer(cur_i + 1));
  addEventListener("keydown", (e) => {
    if (viewer.hidden) return;
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowLeft" && cur_i > 0) openViewer(cur_i - 1);
    if (e.key === "ArrowRight" && cur_i < DOCS.length - 1) openViewer(cur_i + 1);
  });
})();

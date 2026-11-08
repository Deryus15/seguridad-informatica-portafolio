/* ============================================================
   APORTES DEL AUTOR — experiencias interactivas
   Cada aporte convierte un tema de mis trabajos en algo que se puede
   probar, en vez de solo leer. Los datos salen de mis propios documentos
   (Investigación 1 y 2, Proyecto 1 y 2).
   Para agregar otro: añade un objeto a window.APORTES con mount(el).
   ============================================================ */
(() => {
  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => [...r.querySelectorAll(s)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const usd = (n) => "US$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* =====================================================================
     1) CONSTRUCTOR DE REGLAS — "si pasa esto, haz aquello"  (Teramind 4.2–4.3)
     ===================================================================== */
  function reglas(el) {
    const ACTS = {
      subir:  { txt: "sube un archivo a una nube personal", file: "Clientes_2026.xlsx", dest: "→ Google Drive (personal)", has: ["confidencial", "cedula"] },
      usb:    { txt: "copia un archivo a una USB", file: "Clientes_2026.xlsx", dest: "→ USB (E:)", has: ["confidencial"] },
      imprimir: { txt: "imprime un documento", file: "Nomina_Octubre.pdf", dest: "→ Impresora de planta baja", has: ["cedula"] },
      empleo: { txt: "abre un sitio de empleo", file: "bolsa-de-empleo.com", dest: "→ Navegador", has: [] },
      tarjeta: { txt: "pega un número de tarjeta en un chat", file: "4111 1111 1111 1111", dest: "→ Chat externo", has: ["tarjeta"] },
    };
    const CON = { cualquiera: "cualquier contenido", confidencial: 'la palabra "confidencial"', tarjeta: "un patrón de tarjeta (4 grupos de 4 números)", cedula: "un número de cédula" };
    const BTN = [
      ["avisar", "Avisar", "Mensaje en pantalla recordando la política"],
      ["notificar", "Notificar", "Alerta al supervisor o equipo de seguridad"],
      ["bloquear", "Bloquear la acción", "La acción no ocurre"],
      ["usuario", "Bloquear al usuario", "Cierra sesión / bloquea el equipo"],
      ["grabar", "Grabar", "Empieza a grabar la pantalla como evidencia"],
      ["justificar", "Pedir justificación", "Exige explicar antes de continuar"],
    ];
    el.innerHTML = `
      <div class="rb">
        <div class="rb__col">
          <h5>SI…</h5>
          <label>Quién<select data-k="who"><option value="Ventas">una persona de Ventas</option><option value="Finanzas">una persona de Finanzas</option><option value="Todos">cualquier empleado</option></select></label>
          <label>Hace esto<select data-k="act">${Object.entries(ACTS).map(([k, v]) => `<option value="${k}">${v.txt}</option>`).join("")}</select></label>
          <label>Y el contenido tiene<select data-k="con">${Object.entries(CON).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
          <h5 style="margin-top:18px">ENTONCES…</h5>
          <div class="pills" id="pills">${BTN.map(([k, t, d]) => `<button type="button" class="pill" data-a="${k}" title="${d}">${t}</button>`).join("")}</div>
        </div>
        <div class="rb__col">
          <div class="rb__rule" id="rule"></div>
          <button class="btn primary" id="run" style="margin-top:14px">▶ Probar la regla con Carlos (Ventas)</button>
          <p class="hint" id="hint"></p>
          <div class="console" id="con"></div>
        </div>
        <div class="rb__col">
          <div class="screen" id="scr">
            <div class="screen__bar"><i></i><i></i><i></i><span>PC-VENTAS-07 · Carlos</span><b class="rec" id="rec">● REC</b></div>
            <div class="screen__body">
              <div class="screen__file" id="sfile">Clientes_2026.xlsx</div>
              <div class="screen__dest" id="sdest">→ Google Drive (personal)</div>
              <div class="prog"><i id="sprog"></i></div>
              <div class="screen__state" id="sstate">Listo</div>
            </div>
            <div class="toast" id="toast">⚠ Política de seguridad: este envío no está permitido.</div>
            <div class="modal" id="smodal"><b>Justifica esta acción</b><div class="fakeinput">Escribiendo motivo…</div></div>
            <div class="lock" id="lock">🔒 Equipo bloqueado por seguridad</div>
          </div>
        </div>
      </div>`;
    const st = { who: "Ventas", act: "subir", con: "confidencial", acts: new Set(["avisar", "notificar", "bloquear"]) };
    const rule = $("#rule", el), hint = $("#hint", el), con = $("#con", el);
    const log = (t, c = "") => { con.insertAdjacentHTML("beforeend", `<div class="${c}">${t}</div>`); con.scrollTop = con.scrollHeight; };
    const whoTxt = { Ventas: "una persona de Ventas", Finanzas: "una persona de Finanzas", Todos: "cualquier empleado" };

    function draw() {
      const a = ACTS[st.act];
      $$("select", el).forEach((s) => { s.value = st[s.dataset.k]; });
      $$(".pill", el).forEach((p) => p.classList.toggle("on", st.acts.has(p.dataset.a)));
      const names = BTN.filter(([k]) => st.acts.has(k)).map(([, t]) => `<mark>${t}</mark>`).join(" + ") || "<mark>nada (solo registrar)</mark>";
      rule.innerHTML = `<span>SI</span> <mark>${whoTxt[st.who]}</mark> ${a.txt}${st.con !== "cualquiera" ? ` <span>Y</span> contiene <mark>${CON[st.con]}</mark>` : ""}<br><span>ENTONCES</span> ${names}`;
      $("#sfile", el).textContent = a.file; $("#sdest", el).textContent = a.dest;
      let h = "";
      if (st.acts.has("usuario") && !st.acts.has("avisar") && !st.acts.has("notificar")) h = "💡 Bloquear al usuario sin avisar antes es muy drástico: las reglas se diseñan por niveles (avisar → notificar → bloquear solo lo crítico).";
      else if (!st.acts.size) h = "💡 Una regla sin acción solo deja registro: el archivo saldría igual.";
      else if (st.acts.has("bloquear") && st.acts.has("grabar")) h = "✅ Buena combinación: detiene la fuga y deja evidencia forense.";
      hint.textContent = h;
    }
    el.addEventListener("change", (e) => { if (e.target.dataset.k) { st[e.target.dataset.k] = e.target.value; draw(); } });
    el.addEventListener("click", (e) => {
      const p = e.target.closest(".pill"); if (p) { const k = p.dataset.a; st.acts.has(k) ? st.acts.delete(k) : st.acts.add(k); draw(); }
    });

    let busy = false;
    $("#run", el).addEventListener("click", async () => {
      if (busy) return; busy = true;
      const a = ACTS[st.act], prog = $("#sprog", el), state = $("#sstate", el);
      con.innerHTML = ""; prog.style.transition = "none"; prog.style.width = "0";
      ["toast", "smodal", "lock", "rec"].forEach((id) => $("#" + id, el).classList.remove("on"));
      state.textContent = "Iniciando…"; state.className = "screen__state";
      log(`[evento] Carlos (Ventas) ${a.txt}: <b>${esc(a.file)}</b>`);
      await sleep(500);
      // ¿la regla coincide?
      if (st.who !== "Todos" && st.who !== "Ventas") {
        log(`[regla] No aplica: está escrita para ${whoTxt[st.who]} y Carlos es de Ventas.`, "warn");
        state.textContent = "Enviado sin control"; prog.style.transition = "width 1.6s linear"; prog.style.width = "100%"; await sleep(1700);
        log("✗ La información salió. Ajusta a quién va dirigida la regla.", "bad"); busy = false; return;
      }
      if (st.con !== "cualquiera" && !a.has.includes(st.con)) {
        log(`[regla] No coincide: el contenido NO tiene ${CON[st.con]}.`, "warn");
        state.textContent = "Enviado sin control"; prog.style.transition = "width 1.6s linear"; prog.style.width = "100%"; await sleep(1700);
        log("✗ Una regla por contenido solo se activa si el contenido coincide (plan DLP).", "bad"); busy = false; return;
      }
      log("[regla] ✓ Coincide. Ejecutando acciones…", "ok");
      if (st.acts.has("grabar")) { $("#rec", el).classList.add("on"); log("● Grabando pantalla como evidencia", "ok"); }
      if (st.acts.has("avisar")) { $("#toast", el).classList.add("on"); log("⚠ Aviso mostrado al trabajador", "ok"); }
      if (st.acts.has("justificar")) { $("#smodal", el).classList.add("on"); log("… Esperando justificación del trabajador", "ok"); await sleep(1100); }
      const blocked = st.acts.has("bloquear") || st.acts.has("usuario");
      state.textContent = "Enviando…";
      prog.style.transition = `width ${blocked ? 1.1 : 1.8}s linear`; prog.style.width = blocked ? "58%" : "100%";
      await sleep(blocked ? 1200 : 1900);
      if (blocked) { state.textContent = "⛔ BLOQUEADO"; state.className = "screen__state bad"; log("⛔ Acción bloqueada: el archivo NO salió", "ok"); }
      else { state.textContent = "Enviado"; state.className = "screen__state warn"; log(st.acts.size ? "↗ El archivo salió, pero quedó registro y alerta" : "↗ El archivo salió (sin acciones configuradas)", "warn"); }
      if (st.acts.has("notificar")) { await sleep(300); log("✉ Alerta enviada al jefe de seguridad", "ok"); }
      if (st.acts.has("usuario")) { await sleep(500); $("#lock", el).classList.add("on"); log("🔒 Sesión cerrada y equipo bloqueado", "ok"); }
      busy = false;
    });
    draw();
  }

  /* =====================================================================
     2) EL CASO DE CARLOS — línea de tiempo con medidor de riesgo (Teramind 4.9)
     ===================================================================== */
  function carlos(el) {
    const S = [
      { t: "Día −14", ic: "💼", r: 10, h: "Carlos consigue trabajo en la competencia", d: "Todavía no hace nada sospechoso. Su nivel de riesgo es bajo.", f: "Línea base de comportamiento" },
      { t: "Día −12", ic: "🔎", r: 38, h: "Empieza a visitar sitios de empleo", d: "Teramind ya aprendió cómo trabaja Carlos normalmente. Este cambio de rutina sube su puntaje.", f: "Análisis de comportamiento (UEBA)" },
      { t: "Día −7", ic: "📥", r: 64, h: "Descarga más reportes de lo normal", d: "El nivel de riesgo es dinámico: sube o baja según el comportamiento. El equipo de seguridad ve a Carlos entre los primeros a revisar.", f: "Nivel de riesgo dinámico" },
      { t: "Viernes 10 p. m.", ic: "☁️", r: 88, h: 'Intenta subir "Clientes_2026.xlsx" a su Google Drive personal', d: "El archivo tiene la huella digital de la base de clientes. Teramind lo reconoce aunque le cambien el nombre.", f: "Huella digital de documentos (DLP)" },
      { t: "En ese instante", ic: "🛡️", r: 100, h: "La regla se activa", d: "Bloquea la subida, muestra un aviso a Carlos, graba la pantalla y notifica al jefe de seguridad. Una cámara solo graba; Teramind además cierra la puerta.", f: "Reglas + bloqueo + grabación + alerta" },
      { t: "Lunes", ic: "🤝", r: 72, h: "Conversación con evidencia clara", d: "Hay grabación y registro con fecha y hora. La información nunca salió de la empresa.", f: "Evidencia e investigación" },
    ];
    el.innerHTML = `
      <div class="cz">
        <div class="cz__gauge">
          <svg viewBox="0 0 180 110"><path d="M10 95 A80 80 0 0 1 170 95" class="g-bg"/><path d="M10 95 A80 80 0 0 1 170 95" class="g-fg" id="gfg"/></svg>
          <div class="cz__score"><b id="sc">10</b><span>nivel de riesgo<br><small>(puntaje ilustrativo)</small></span></div>
        </div>
        <div class="cz__card" id="card"></div>
      </div>
      <div class="cz__track" id="track">${S.map((s, i) => `<button class="cz__node" data-i="${i}"><i>${s.ic}</i><span>${s.t}</span></button>`).join("")}</div>
      <div class="cz__ctrl"><button class="btn" id="cprev">← Anterior</button><button class="btn primary" id="cplay">▶ Reproducir historia</button><button class="btn" id="cnext">Siguiente →</button></div>`;
    let i = 0, timer = null;
    const len = Math.PI * 80;
    const show = (n) => {
      i = Math.max(0, Math.min(S.length - 1, n)); const s = S[i];
      $("#gfg", el).style.strokeDasharray = `${(len * s.r) / 100} ${len}`;
      $("#gfg", el).style.stroke = s.r >= 85 ? "#ff2e4d" : s.r >= 55 ? "#ff9a5c" : "#3ddc97";
      const sc = $("#sc", el), from = +sc.textContent, to = s.r, t0 = performance.now();
      (function a(now) { const k = Math.min(1, (now - t0) / 600); sc.textContent = Math.round(from + (to - from) * k); if (k < 1) requestAnimationFrame(a); })(t0);
      $("#card", el).innerHTML = `<span class="tag">${s.t}</span><h4>${s.ic} ${esc(s.h)}</h4><p>${esc(s.d)}</p><div class="cz__fn">Función de Teramind: <b>${esc(s.f)}</b></div>`;
      $$(".cz__node", el).forEach((n, k) => { n.classList.toggle("on", k === i); n.classList.toggle("done", k < i); });
    };
    el.addEventListener("click", (e) => {
      const n = e.target.closest(".cz__node"); if (n) { stop(); show(+n.dataset.i); }
    });
    const stop = () => { clearInterval(timer); timer = null; $("#cplay", el).textContent = "▶ Reproducir historia"; };
    $("#cprev", el).onclick = () => { stop(); show(i - 1); };
    $("#cnext", el).onclick = () => { stop(); show(i + 1); };
    $("#cplay", el).onclick = () => {
      if (timer) return stop();
      if (i >= S.length - 1) show(0);
      $("#cplay", el).textContent = "⏸ Pausar";
      timer = setInterval(() => { if (i >= S.length - 1) return stop(); show(i + 1); }, 2600);
    };
    show(0);
  }

  /* =====================================================================
     3) JUEGO: ¿malicioso, descuidado o comprometido?  (Teramind 4.1, Tabla 9)
     ===================================================================== */
  function juego(el) {
    const T = { m: ["Malicioso", "Quiere hacer daño o beneficiarse."], d: ["Descuidado", "No tiene mala intención, se equivoca."], c: ["Comprometido", "Su cuenta fue robada por un atacante externo."] };
    const Q = [
      { q: "Un vendedor renuncia y se lleva la lista de clientes a la competencia.", a: "m", e: "Hay intención de beneficiarse. Es el ejemplo clásico de amenaza interna maliciosa." },
      { q: "Una asistente envía la planilla de salarios al correo equivocado.", a: "d", e: "Error humano sin mala intención. Una regla DLP puede frenar el envío antes de que salga." },
      { q: "Alguien entra con la contraseña de un empleado y actúa como si fuera él.", a: "c", e: "La persona real no es quien actúa: es una cuenta comprometida por un atacante." },
      { q: "Un contador se reenvía un reporte confidencial a su correo personal «para terminarlo en casa».", a: "d", e: "No quiere dañar a nadie, pero viola la política. Un aviso a tiempo suele bastar." },
      { q: "A las 3 a. m. de un domingo, desde un equipo que nunca usa, una cuenta descarga 2,000 archivos (normalmente baja unos 10).", a: "c", e: "Rompe por completo el patrón normal del usuario: señal típica de cuenta robada. El análisis de comportamiento lo marca." },
      { q: "Un empleado inconforme conecta una USB y copia la base de datos de clientes antes de irse.", a: "m", e: "Acción deliberada para llevarse información. Regla de USB + grabación = evidencia." },
      { q: "Un practicante pega datos de pacientes en un chatbot de IA público para «resumirlos».", a: "d", e: "Es la «IA en la sombra»: buena intención, pero la información sensible sale de la organización." },
      { q: "Un atacante externo usa credenciales robadas para hacer transacciones fuera de lo normal en el sistema financiero.", a: "c", e: "El usuario legítimo no hizo nada: la cuenta fue tomada. Se detecta por comportamiento anómalo." },
    ];
    let idx = 0, score = 0, locked = false;
    const render = () => {
      if (idx >= Q.length) {
        const rank = score >= 7 ? ["🕵️ Analista SOC", "Detectas los tres tipos con mucha precisión."] : score >= 4 ? ["🛡️ Defensor en formación", "Buen ojo; repasa las diferencias."] : ["🌱 Novato curioso", "Los tipos se confunden fácil: ¡vuelve a intentarlo!"];
        el.innerHTML = `<div class="qz__end"><div class="qz__big">${score}<small>/${Q.length}</small></div><h4>${rank[0]}</h4><p>${rank[1]}</p><button class="btn primary" id="qre">Jugar de nuevo</button></div>`;
        $("#qre", el).onclick = () => { idx = 0; score = 0; render(); }; return;
      }
      const q = Q[idx];
      el.innerHTML = `<div class="qz"><div class="qz__top"><span>Caso ${idx + 1} / ${Q.length}</span><span>Puntos: <b>${score}</b></span></div>
        <div class="qz__bar"><i style="width:${(idx / Q.length) * 100}%"></i></div>
        <p class="qz__q">${esc(q.q)}</p>
        <div class="qz__opts">${Object.entries(T).map(([k, [n, d]]) => `<button class="qz__opt" data-k="${k}"><b>${n}</b><span>${d}</span></button>`).join("")}</div>
        <div class="qz__fb" id="fb"></div></div>`;
      locked = false;
      $$(".qz__opt", el).forEach((b) => b.onclick = () => {
        if (locked) return; locked = true;
        const ok = b.dataset.k === q.a; if (ok) score++;
        $$(".qz__opt", el).forEach((o) => o.classList.add(o.dataset.k === q.a ? "right" : o === b ? "wrong" : "dim"));
        $("#fb", el).innerHTML = `<p><b>${ok ? "✓ Correcto." : "✗ No exactamente."}</b> ${esc(q.e)}</p><button class="btn primary" id="qn">${idx === Q.length - 1 ? "Ver resultado" : "Siguiente caso →"}</button>`;
        $("#qn", el).onclick = () => { idx++; render(); };
      });
    };
    render();
  }

  /* =====================================================================
     4) CALCULADORA DE COSTOS DE TERAMIND  (Investigación 2, sección 4)
     ===================================================================== */
  function costos(el) {
    const PL = {
      starter: { n: "Starter", p: 14, f: ["Monitoreo en tiempo real", "Captura de video", "Reportes de productividad"] },
      uam: { n: "UAM", p: 28, f: ["Todo Starter", "Correo, teclado, archivos e impresión", "OCR y reglas ilimitadas", "Integración SIEM"] },
      dlp: { n: "DLP", p: 32, f: ["Todo UAM", "Reglas basadas en contenido", "Bloqueo de fuga de datos"] },
    };
    el.innerHTML = `<div class="cc">
      <div class="cc__in">
        <label>Plan</label>
        <div class="pills" id="cplan">${Object.entries(PL).map(([k, v]) => `<button class="pill" data-p="${k}">${v.n}<small>${usd(v.p).replace(".00", "")}/usuario/mes</small></button>`).join("")}<button class="pill" data-p="ent">Enterprise<small>a cotizar</small></button></div>
        <label>Usuarios a monitorear: <b id="un">25</b></label>
        <input type="range" id="us" min="1" max="500" value="25">
        <label>Instalación</label>
        <div class="pills" id="cdep"><button class="pill on" data-d="nube">Nube</button><button class="pill" data-d="local">Local (on-premise)</button></div>
        <label>Tamaño de la organización</label>
        <div class="pills" id="csz"><button class="pill on" data-s="peq">Pequeña</button><button class="pill" data-s="gra">Grande</button></div>
      </div>
      <div class="cc__out" id="cout"></div></div>
      <p class="hint">Precios publicados para facturación anual (2026) según mi Investigación No. 2; confirmar con Teramind antes de contratar. Implementación estimada: pequeñas US$500–2,000; grandes US$2,000–10,000 o más.</p>`;
    const s = { p: "uam", d: "nube", s: "peq", u: 25 };
    const draw = () => {
      $$("#cplan .pill", el).forEach((b) => b.classList.toggle("on", b.dataset.p === s.p));
      $$("#cdep .pill", el).forEach((b) => b.classList.toggle("on", b.dataset.d === s.d));
      $$("#csz .pill", el).forEach((b) => b.classList.toggle("on", b.dataset.s === s.s));
      $("#un", el).textContent = s.u;
      const out = $("#cout", el);
      const impl = s.s === "peq" ? [500, 2000] : [2000, 10000];
      if (s.p === "ent" || s.d === "local") {
        out.innerHTML = `<div class="cc__big">A cotizar</div><p>${s.d === "local" ? "La instalación local (mínimo 10 equipos) se maneja con plan Enterprise a la medida." : "Enterprise es personalizado, con descuentos desde 250+ licencias."}</p>
          <ul class="cc__list"><li>Requiere servidor, base de datos y almacenamiento para los videos grabados</li><li>Implementación estimada: ${usd(impl[0])} – ${usd(impl[1])}+</li><li>Hay prueba gratuita y demostración en vivo</li></ul>`;
        return;
      }
      const pl = PL[s.p], billed = Math.max(5, s.u), mo = billed * pl.p, yr = mo * 12;
      const bars = Object.entries(PL).map(([k, v]) => { const m = billed * v.p; return `<div class="cc__bar ${k === s.p ? "on" : ""}"><span>${v.n}</span><i style="width:${(m / (billed * 32)) * 100}%"></i><b>${usd(m)}</b></div>`; }).join("");
      out.innerHTML = `<div class="cc__big">${usd(mo)}<small>/mes</small></div>
        ${s.u < 5 ? `<p class="warn">Mínimo 5 licencias en la nube: se facturan 5.</p>` : ""}
        <div class="cc__row"><span>Licencias (${pl.n}) al año</span><b>${usd(yr)}</b></div>
        <div class="cc__row"><span>Implementación / asesoría</span><b>${usd(impl[0])} – ${usd(impl[1])}</b></div>
        <div class="cc__row tot"><span>Primer año estimado</span><b>${usd(yr + impl[0])} – ${usd(yr + impl[1])}</b></div>
        <div class="cc__bars">${bars}</div>
        <ul class="cc__list">${pl.f.map((f) => `<li>${f}</li>`).join("")}</ul>`;
    };
    $("#us", el).oninput = (e) => { s.u = +e.target.value; draw(); };
    el.addEventListener("click", (e) => {
      const b = e.target.closest(".pill"); if (!b) return;
      if (b.dataset.p) s.p = b.dataset.p; if (b.dataset.d) s.d = b.dataset.d; if (b.dataset.s) s.s = b.dataset.s; draw();
    });
    draw();
  }

  /* =====================================================================
     5) EL VIAJE DE UN PAQUETE — Palo Alto Networks (Proyecto 1, secciones 3.1, 5.1, 5.2)
     ===================================================================== */
  function paquete(el) {
    const L = [
      ["Superficie de ataque", "Cortex Xpanse"], ["Perímetro y red", "NGFW · Threat Prevention · WildFire"], ["Acceso remoto", "Prisma Access · Prisma Browser"],
      ["Endpoint", "Cortex XDR"], ["Nube", "Cortex Cloud · Prisma AIRS"], ["Identidad", "Idira / CyberArk · User-ID"], ["Respuesta", "XSIAM · XSOAR"],
    ];
    const T = [
      { n: "Malware y ransomware", via: "Archivos adjuntos, descargas, USB", l: 1, by: "WildFire, Threat Prevention" },
      { n: "Explotación de vulnerabilidades", via: "Servicios expuestos sin parche", l: 1, by: "Threat Prevention (IPS)" },
      { n: "Phishing", via: "Correos y sitios falsos", l: 1, by: "Advanced URL Filtering" },
      { n: "Comando y control (C2) por DNS", via: "Malware que llama a su servidor", l: 1, by: "DNS Security" },
      { n: "Fuga de datos", via: "Empleados o malware extraen información", l: 1, by: "DLP, Content-ID" },
      { n: "Dispositivos IoT vulnerables", via: "Cámaras, impresoras, sensores sin parche", l: 1, by: "IoT Security" },
      { n: "Activos olvidados expuestos", via: "Servidores que la empresa no sabe que tiene", l: 0, by: "Cortex Xpanse" },
      { n: "Robo de credenciales", via: "Contraseñas filtradas o reutilizadas", l: 5, by: "Idira/CyberArk, User-ID" },
      { n: "Configuración insegura en la nube", via: "Buckets públicos, permisos excesivos", l: 4, by: "Cortex Cloud (CSPM, CIEM)" },
      { n: "Ataque a modelos de IA", via: "Inyección de instrucciones, fuga del modelo", l: 4, by: "Prisma AIRS" },
    ];
    el.innerHTML = `<div class="pk">
      <div class="pk__side"><label>Elige una amenaza</label><div class="pk__threats" id="th">${T.map((t, i) => `<button class="pill" data-i="${i}">${t.n}</button>`).join("")}</div>
        <label style="margin-top:14px">Modelo de inspección en el perímetro</label>
        <div class="pills" id="mode"><button class="pill on" data-m="sp3">SP3 · una sola pasada</button><button class="pill" data-m="utm">UTM tradicional · multi-pass</button></div>
        <div class="pk__info" id="info"><p>Lanza una amenaza y observa qué capa de la plataforma la detiene.</p></div></div>
      <div class="pk__stack" id="stack">${L.map(([n, p], i) => `<div class="pk__layer" data-l="${i}"><span class="pk__n">${i + 1}</span><div><b>${n}</b><small>${p}</small></div><em></em></div>`).join("")}<div class="pk__pkt" id="pkt"></div></div></div>`;
    let mode = "sp3", run = 0;
    const layers = $$(".pk__layer", el), pkt = $("#pkt", el), info = $("#info", el);
    const reset = () => { layers.forEach((l) => { l.className = "pk__layer"; $("em", l).textContent = ""; }); pkt.style.opacity = 0; };
    async function go(i) {
      const my = ++run, t = T[i]; reset();
      $$("#th .pill", el).forEach((b, k) => b.classList.toggle("on", k === i));
      info.innerHTML = `<h5>${t.n}</h5><p><b>Cómo entra:</b> ${t.via}</p><p class="pk__wait">Analizando…</p>`;
      pkt.style.opacity = 1;
      const pos = (k) => layers[k].offsetTop + layers[k].offsetHeight / 2 - 9;
      pkt.style.transition = "none"; pkt.style.transform = `translateY(${pos(0) - 40}px)`; await sleep(60);
      for (let k = 0; k <= t.l; k++) {
        if (my !== run) return;
        pkt.style.transition = "transform .55s cubic-bezier(.6,0,.3,1)"; pkt.style.transform = `translateY(${pos(k)}px)`; await sleep(600);
        if (k < t.l) { layers[k].classList.add("pass"); $("em", layers[k]).textContent = "pasa"; }
        else {
          layers[k].classList.add("stop");
          if (k === 1) {
            $("em", layers[k]).textContent = mode === "sp3" ? "1 análisis" : "3 análisis";
            layers[k].classList.add(mode);
          } else $("em", layers[k]).textContent = "bloqueada";
        }
      }
      pkt.classList.add("boom"); setTimeout(() => pkt.classList.remove("boom"), 500);
      layers.slice(t.l + 1).forEach((l) => l.classList.add("dim"));
      layers[6].classList.remove("dim"); layers[6].classList.add("echo"); $("em", layers[6]).textContent = "registra y automatiza";
      info.innerHTML = `<h5>${t.n}</h5><p><b>Cómo entra:</b> ${t.via}</p><p class="pk__ok">🛡️ La detiene: <b>${t.by}</b></p>` +
        (t.l === 1 ? `<p class="pk__mode">${mode === "sp3" ? "En SP3 el paquete se inspecciona <b>una sola vez</b>: App-ID, User-ID y Content-ID trabajan en el mismo recorrido, por eso activar funciones no frena la red." : "En un UTM tradicional cada motor (antivirus, IPS, filtro de URL) <b>vuelve a analizar</b> el tráfico: más latencia y menos rendimiento al activar funciones."}</p>` : `<p class="pk__mode">Ubicación en la capa: ilustrativa; el producto que la detiene sale de mi Proyecto 1.</p>`);
    }
    el.addEventListener("click", (e) => {
      const b = e.target.closest("#th .pill"); if (b) go(+b.dataset.i);
      const m = e.target.closest("#mode .pill"); if (m) { mode = m.dataset.m; $$("#mode .pill", el).forEach((x) => x.classList.toggle("on", x === m)); const on = $$("#th .pill.on", el)[0]; if (on) go(+on.dataset.i); }
    });
  }

  /* =====================================================================
     6) LABORATORIO DE CIFRADO — criptografía vs criptoanálisis (Investigación 1, Criptociencia)
     ===================================================================== */
  function cripto(el) {
    el.innerHTML = `<div class="cr">
      <div class="cr__col"><label>Texto plano</label><input id="pt" value="SEGURIDAD INFORMATICA" maxlength="60" spellcheck="false">
        <label>Llave (desplazamiento): <b id="kv">7</b></label><input type="range" id="k" min="1" max="25" value="7">
        <label>Texto cifrado (criptografía)</label><div class="cr__out" id="ct"></div>
        <p class="hint">Cifrado César: cada letra se desplaza «llave» posiciones. Sin la llave, el texto es incomprensible; con ella, se descifra.</p></div>
      <div class="cr__col"><label>Criptoanálisis: romper el cifrado sin la llave</label>
        <button class="btn primary" id="bf">⚡ Probar las 25 llaves (fuerza bruta)</button>
        <div class="cr__list" id="bl"></div></div></div>`;
    const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
    const shift = (s, k) => [...s].map((c) => { const i = A.indexOf(c); return i < 0 ? c : A[(i + k + 26) % 26]; }).join("");
    const FREQ = { E: 12.5, A: 12, O: 8.7, S: 8, R: 7, N: 6.8, I: 6.2, D: 5.9, L: 5, C: 4.7, T: 4.6, U: 3.9 };
    const score = (s) => [...s].reduce((n, c) => n + (FREQ[c] || 0), 0);
    const pt = $("#pt", el), kk = $("#k", el), ct = $("#ct", el);
    let busy = false;
    const upd = () => { $("#kv", el).textContent = kk.value; ct.textContent = shift(norm(pt.value), +kk.value) || "…"; $("#bl", el).innerHTML = ""; };
    pt.oninput = upd; kk.oninput = upd;
    $("#bf", el).onclick = async () => {
      if (busy) return; busy = true;
      const c = ct.textContent, list = $("#bl", el); list.innerHTML = "";
      const rows = [];
      for (let k = 1; k <= 25; k++) {
        const t = shift(c, -k); const row = document.createElement("div");
        row.className = "cr__row"; row.innerHTML = `<span>llave ${String(k).padStart(2, "0")}</span><code>${esc(t)}</code>`;
        list.appendChild(row); rows.push([score(t), row, k]); list.scrollTop = list.scrollHeight; await sleep(70);
      }
      const best = rows.reduce((a, b) => (b[0] > a[0] ? b : a));
      best[1].classList.add("win"); best[1].insertAdjacentHTML("beforeend", "<b>← más parece español</b>"); best[1].scrollIntoView({ block: "nearest" });
      busy = false;
    };
    upd();
  }

  /* ---------- registro ---------- */
  window.APORTES = [
    { id: "reglas", n: "01", tag: "Teramind", titulo: "Constructor de reglas: «si pasa esto, haz aquello»", desc: "Arma una regla como en Teramind y pruébala contra un empleado simulado. Descubre cuándo bloquea, cuándo solo avisa y cuándo no se activa.", src: "Investigación 2 y Proyecto 2 · Teramind (secciones 4.2 y 4.3)", mount: reglas },
    { id: "carlos", n: "02", tag: "Teramind", titulo: "El caso de Carlos: la historia de un insider", desc: "Recorre las semanas previas a una fuga de datos y mira cómo sube el nivel de riesgo hasta que la regla actúa.", src: "Proyecto 2 · Teramind (sección 4.9)", mount: carlos },
    { id: "juego", n: "03", tag: "Teramind", titulo: "¿Malicioso, descuidado o comprometido?", desc: "Clasifica 8 casos según los tres tipos de riesgo interno. ¿Llegas a Analista SOC?", src: "Proyecto 2 · Teramind (sección 4.1, tipos de riesgo interno)", mount: juego },
    { id: "costos", n: "04", tag: "Teramind", titulo: "Calculadora de costos de Teramind", desc: "Mueve usuarios, plan e instalación y estima la inversión del primer año con los precios de mi investigación.", src: "Investigación 2 · Teramind (sección 4, costos de implementación)", mount: costos },
    { id: "paquete", n: "05", tag: "Palo Alto Networks", titulo: "El viaje de un paquete por las 7 capas de defensa", desc: "Lanza una amenaza y observa qué capa y qué producto de Palo Alto la detienen. Compara SP3 contra un UTM tradicional.", src: "Proyecto 1 · Palo Alto Networks (secciones 3.1, 5.1 y 5.2)", mount: paquete },
    { id: "cripto", n: "06", tag: "Criptociencia", titulo: "Laboratorio de cifrado: cifra y rompe", desc: "Cifra un mensaje con una llave y después rómpelo por fuerza bruta: criptografía y criptoanálisis en un solo lugar.", src: "Investigación 1 · Seguridad Informática (Criptociencia)", mount: cripto },
  ];
})();

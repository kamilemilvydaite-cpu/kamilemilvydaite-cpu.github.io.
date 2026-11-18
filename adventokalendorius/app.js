(() => {
  "use strict";
  const CFG = window.KALENDORIUS;
  const W = 1920, H = 1080;
  const C = { x: 960, y: 610 };                       // aikštės centras
  const CORNERS = [[170, 250], [1750, 250], [170, 930], [1750, 930]];
  const FRONT = { x: 978, y: 700 };                   // vieta priešais eglutę
  const ORBIT = { x: 978, y: 612, rx: 215, ry: 72 };   // centras ties eglutės apačia: priekinė rato pusė prieš eglutę, galinė už jos  // katino ratas aplink eglutę
  const $ = (id) => document.getElementById(id);
  const stage = $("stage"), world = $("world"), bubble = $("bubble");
  const pad = (n) => String(n).padStart(2, "0");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Mastelis ---------- */
  function fit() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  }
  addEventListener("resize", fit); fit();
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  /* ---------- Laikini piešiniai (kol nėra tikrų paveikslėlių) ---------- */
  const svg = (w, h, body) =>
    "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`);
  const HOUSE_ACCENT = ["#c0392b", "#2f6fa8", "#b8562a", "#2e7d4f"];
  const phHouse = (v) => svg(200, 200, `
    <rect x="30" y="85" width="140" height="100" fill="#8a5a33" stroke="#4a2c14" stroke-width="3"/>
    ${[100, 115, 130, 145, 160, 175].map((y) => `<line x1="30" x2="170" y1="${y}" y2="${y}" stroke="#4a2c14" stroke-width="2"/>`).join("")}
    <rect x="130" y="30" width="18" height="34" fill="#9b4a35" stroke="#4a2c14" stroke-width="3"/>
    <path d="M12 92 L100 22 L188 92 Z" fill="#fff" stroke="#9fb4cf" stroke-width="3" stroke-linejoin="round"/>
    <rect x="42" y="118" width="24" height="24" fill="#ffd66b" stroke="${HOUSE_ACCENT[v - 1]}" stroke-width="4"/>
    <rect x="134" y="118" width="24" height="24" fill="#ffd66b" stroke="${HOUSE_ACCENT[v - 1]}" stroke-width="4"/>
    <rect x="75" y="110" width="50" height="75" fill="#5d3a1c" stroke="${HOUSE_ACCENT[v - 1]}" stroke-width="4"/>
    <circle cx="117" cy="150" r="3" fill="#f2c94c"/>`);
  const phLantern = (gold) => svg(40, 110, `
    <rect x="17" y="30" width="6" height="78" fill="${gold ? "#c9972b" : "#2b2b2b"}"/>
    <rect x="10" y="102" width="20" height="8" fill="${gold ? "#c9972b" : "#2b2b2b"}"/>
    <path d="M8 8 H32 L28 32 H12 Z" fill="#ffb347" stroke="${gold ? "#c9972b" : "#2b2b2b"}" stroke-width="3"/>
    <path d="M5 8 L20 0 L35 8 Z" fill="#fff"/>`);
  const phTree = () => svg(250, 340, `
    <rect x="112" y="290" width="26" height="40" fill="#6b4a2b"/>
    <path d="M125 20 L45 130 H85 L25 220 H75 L10 305 H240 L175 220 H225 L165 130 H205 Z" fill="#2e7d4f" stroke="#1d5234" stroke-width="4" stroke-linejoin="round"/>
    <path d="M125 20 L95 62 Q125 50 155 62 Z M85 130 Q125 112 165 130 L150 110 H100 Z M75 220 Q125 200 175 220 L160 198 H90 Z" fill="#fff"/>
    <path d="M125 0 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2z" fill="#ffd24a"/>`);
  const phElf = (girl, frame) => svg(120, 180, `
    <rect x="42" y="150" width="14" height="24" fill="${girl ? "#e9e9e9" : "#2e7d4f"}"/><rect x="64" y="150" width="14" height="24" fill="${girl ? "#e9e9e9" : "#2e7d4f"}"/>
    <ellipse cx="48" cy="176" rx="12" ry="5" fill="#5d3a1c"/><ellipse cx="72" cy="176" rx="12" ry="5" fill="#5d3a1c"/>
    <path d="${girl ? "M35 95 H85 L98 156 H22 Z" : "M38 95 H82 V152 H38 Z"}" fill="#2e7d4f" stroke="#1d5234" stroke-width="3"/>
    ${frame === 3 ? `<path d="M82 105 L108 70" stroke="#2e7d4f" stroke-width="12" stroke-linecap="round"/><circle cx="110" cy="66" r="8" fill="#f6d2b4"/>` : `<path d="M82 105 L94 135" stroke="#2e7d4f" stroke-width="12" stroke-linecap="round"/>`}
    <path d="M38 105 L26 135" stroke="#2e7d4f" stroke-width="12" stroke-linecap="round"/>
    <path d="M30 62 L12 52 L30 74 Z M90 62 L108 52 L90 74 Z" fill="#f6d2b4"/>
    ${girl ? `<path d="M28 55 Q20 95 34 100 L40 60 Z M92 55 Q100 95 86 100 L80 60 Z" fill="#8a5a33"/>` : ""}
    <circle cx="60" cy="68" r="31" fill="#f6d2b4"/>
    <circle cx="49" cy="66" r="4" fill="#3b2a18"/><circle cx="71" cy="66" r="4" fill="#3b2a18"/>
    <circle cx="40" cy="78" r="6" fill="#f4a7a0" opacity=".7"/><circle cx="80" cy="78" r="6" fill="#f4a7a0" opacity=".7"/>
    ${frame === 1 ? `<path d="M50 82 Q60 90 70 82" fill="none" stroke="#3b2a18" stroke-width="3" stroke-linecap="round"/>` : `<ellipse cx="60" cy="85" rx="8" ry="7" fill="#7a2a2a"/>`}
    <path d="M28 50 Q60 -20 100 22 L92 50 Z" fill="#d63a2f"/><circle cx="102" cy="22" r="9" fill="#fff"/>
    <rect x="24" y="42" width="72" height="14" rx="7" fill="#fff"/>`);

  function phBackground() {
    const roads = CORNERS.map(([x, y]) => {
      const ex = C.x + (x - C.x) * 1.4, ey = C.y + (y - C.y) * 1.4;
      return `<line x1="${C.x}" y1="${C.y}" x2="${ex}" y2="${ey}" stroke="#d9c7a3" stroke-width="78" stroke-linecap="round"/>
              <line x1="${C.x}" y1="${C.y}" x2="${ex}" y2="${ey}" stroke="#c4b08a" stroke-width="70" stroke-dasharray="26 8" opacity=".5"/>`;
    }).join("");
    let trees = "";
    const tree = (x, y, s) => `<path d="M${x} ${y - 90 * s} l${34 * s} ${90 * s} h${-68 * s}z" fill="#2f5d48"/><path d="M${x} ${y - 90 * s} l${14 * s} ${36 * s} q${-14 * s} ${-10 * s} ${-28 * s} 0z" fill="#fff"/>`;
    for (let x = 20; x < W; x += 55) { trees += tree(x, 95 + (x * 7 % 30), 1); }
    for (let y = 150; y < H; y += 70) { trees += tree(30 + (y % 25), y, 1.1) + tree(W - 30 - (y % 25), y, 1.1); }
    for (let x = 0; x < W; x += 75) { trees += tree(x + 20, H + 30, 1.5); }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdbfe0"/><stop offset=".12" stop-color="#e9eef8"/><stop offset="1" stop-color="#f7fbff"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#sky)"/>${roads}
      <ellipse cx="${C.x}" cy="${C.y + 40}" rx="300" ry="150" fill="#d9c7a3"/>
      <ellipse cx="${C.x}" cy="${C.y + 40}" rx="288" ry="140" fill="none" stroke="#c4b08a" stroke-width="10" stroke-dasharray="30 10" opacity=".6"/>
      ${trees}</svg>`;
  }

  /* ---------- Paveikslėlių įkėlimas: tikras failas arba laikinas piešinys ---------- */
  const IMG = {}, IMGSIZE = {};
  function load(name, fallback) {
    return new Promise((res) => {
      // Ieško aplanke assets/img, o jei nėra, šalia index.html (kai failai įkelti be aplankų)
      const urls = [`assets/img/${name}.webp`, `${name.split("/").pop()}.webp`];
      (function next(i) {
        if (i >= urls.length) { IMG[name] = fallback; return res(); }
        const im = new Image();
        im.onload = () => { IMG[name] = urls[i]; IMGSIZE[name] = [im.naturalWidth, im.naturalHeight]; res(); };
        im.onerror = () => next(i + 1);
        im.src = urls[i];
      })(0);
    });
  }
  // Katino dalys eisenai: [failas, kairė, viršus, plotis (1100x935 drobėje), sukimosi taškas x%, y%, klasė]
  const RIG_PARTS = [
    ["uodega", 306, 170, 259, 39, 91.5, "tail"],
    ["koja-g2", 452, 550, 184, 50, 12, "leg far B"],
    ["koja-p2", 790, 592, 170, 50, 10, "leg far A"],
    ["kunas", 300, 285, 612, 50, 60, "body"],
    ["koja-g2", 325, 562, 184, 50, 12, "leg near A"],
    ["koja-p1", 625, 606, 182, 50, 10, "leg near B"],
    ["galva", 560, 215, 449, 45, 75, "head"]
  ];
  const assetJobs = [
    load("fonas", null), load("eglute", phTree()), load("zibintas", phLantern(false)), load("zibintas-pasaka", phLantern(true)),
    ...[1, 2, 3, 4].map((v) => load(`namelis-${v}`, phHouse(v))),
    ...[1, 2, 3, 4].map((v) => load(`namelis-${v}-atviras`, null)),
    ...[1, 2, 3, 4].map((v) => load(`namelis-${v}-v`, null)),
    ...[1, 2, 3].map((f) => load(`elfas-berniukas-${f}`, phElf(false, f))),
    ...[1, 2, 3].map((f) => load(`elfas-mergaite-${f}`, phElf(true, f))),
    ...["elfas-berniukas", "elfas-mergaite"].flatMap((b) => [load(b + "-eina", null), load(b + "-kalba", null)]),
    load("katinas-eina", null), load("katinas-eisena", null), load("katinas-kalba", null), load("katinas-moja", null),
    load("katinas-sedi-1", null), load("katinas-sedi-2", null),
    ...RIG_PARTS.map((p) => load("katinas/" + p[0], null))
  ];

  /* ---------- Garsas ---------- */
  let actx = null;
  function unlock() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (actx && actx.state === "suspended") actx.resume(); }
  addEventListener("pointerdown", unlock, true);
  function tone(type, f0, f1, dur, vol) {
    if (!actx) return;
    const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  const SFX_FALLBACK = {
    miau: () => { tone("sawtooth", 520, 900, 0.25, 0.12); setTimeout(() => tone("sawtooth", 900, 420, 0.45, 0.12), 230); },
    durys: () => tone("sawtooth", 90, 190, 0.8, 0.08),
    varpelis: () => { tone("sine", 1320, 1320, 0.7, 0.15); setTimeout(() => tone("sine", 1760, 1760, 0.9, 0.12), 160); },
    uzrakinta: () => tone("square", 200, 130, 0.25, 0.08)
  };
  function playFile(name) {       // groja assets/audio/NAME.mp3 arba NAME.mp3 šalia index.html; pažadas baigiasi nuskambėjus
    const urls = [`assets/audio/${name}.mp3`, `${name}.mp3`];
    return new Promise((res, rej) => {
      (function next(i) {
        if (i >= urls.length) return rej();
        const a = new Audio(urls[i]);
        a.onended = res; a.onerror = () => next(i + 1);
        a.play().catch(() => next(i + 1));
      })(0);
    });
  }
  function sfx(name) {            // bando assets/audio/NAME.mp3, kitaip sintetinis garsas
    playFile(name).catch(() => SFX_FALLBACK[name] && SFX_FALLBACK[name]());
  }
  function voice(name, minMs) {   // grąžina pažadą, kuris baigiasi, kai įrašas nuskamba
    return playFile(name).catch(() => sleep(minMs));
  }

  /* ---------- Scenos objektai ---------- */
  function obj(cls, x, y, src) {
    const el = document.createElement("div");
    el.className = "obj " + cls;
    el.innerHTML = `<div class="flip"><div class="inner">${src ? `<img src="${src}" alt="">` : ""}</div></div>`;
    if (/house|lantern|tree/.test(cls)) el.insertAdjacentHTML("afterbegin", `<div class="gshadow"></div><div class="pool"></div>`);
    world.appendChild(el); place(el, x, y);
    return el;
  }
  const depth = (y) => 0.8 + 0.26 * Math.max(0, Math.min(1, y / H));   // toliau esantys objektai mažesni
  function place(el, x, y) {
    el.style.left = x + "px"; el.style.top = y + "px"; el.style.zIndex = Math.round(y); el._x = x; el._y = y;
    el._s = depth(y); el.style.setProperty("--s", el._s);
  }

  const houses = {}, lanterns = {};
  // Kelių vidurio linijos pagal foną (nuo aikštės į išorę). Keičiant foną, pataisyti šiuos taškus.
  const ROADS = [
    [[760, 470], [700, 455], [620, 430], [540, 395], [490, 355], [460, 300], [438, 250], [395, 200], [350, 172]],
    [[1200, 470], [1280, 450], [1360, 425], [1420, 390], [1455, 340], [1480, 290], [1510, 245], [1560, 215], [1620, 205]],
    [[740, 650], [660, 672], [580, 700], [500, 732], [400, 772], [300, 820], [240, 848]],
    [[1230, 645], [1300, 668], [1400, 708], [1500, 760], [1600, 825], [1700, 895], [1760, 920]]
  ].map((pts) => {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, cum, len: cum[cum.length - 1] };
  });
  function roadAt(r, s) {                         // taškas ir kryptis kelyje r, atstumu s nuo aikštės
    const { pts, cum, len } = ROADS[r]; s = Math.max(0, Math.min(len, s));
    let i = 1; while (i < pts.length - 1 && cum[i] < s) i++;
    const k = (s - cum[i - 1]) / (cum[i] - cum[i - 1]), dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1], l = Math.hypot(dx, dy);
    return { x: pts[i - 1][0] + dx * k, y: pts[i - 1][1] + dy * k, tx: dx / l, ty: dy / l };
  }
  function roadPath(r, s0, s1) {                  // kelio taškai nuo s0 iki s1 (bet kuria kryptimi)
    const { pts, cum } = ROADS[r], out = [];
    const mid = pts.map((p, i) => ({ x: p[0], y: p[1], s: cum[i] })).filter((p) => p.s > Math.min(s0, s1) + 1 && p.s < Math.max(s0, s1) - 1);
    if (s1 < s0) mid.reverse();
    mid.forEach((p) => out.push({ x: p.x, y: p.y }));
    const e = roadAt(r, s1); out.push({ x: e.x, y: e.y });
    return out;
  }
  function nearest(r, p) {                        // artimiausias kelio r taškas prie p; grąžina ir atstumą nuo aikštės
    const { pts, cum } = ROADS[r]; let best = null;
    for (let i = 1; i < pts.length; i++) {
      const ax = pts[i - 1][0], ay = pts[i - 1][1], bx = pts[i][0] - ax, by = pts[i][1] - ay;
      const k = Math.max(0, Math.min(1, ((p.x - ax) * bx + (p.y - ay) * by) / (bx * bx + by * by)));
      const x = ax + bx * k, y = ay + by * k, d = Math.hypot(p.x - x, p.y - y);
      if (!best || d < best.d) best = { x, y, d, s: cum[i - 1] + (cum[i] - cum[i - 1]) * k };
    }
    return best;
  }
  // Viskas parinkta ranka pagal foną (keičiant foną, pataisyti):
  // [namelio x, y (apačia), kelias arba "L", katino x, y, žibinto x, y, (elfo x, y - nebūtina)].
  // Kelias: 0 kairė viršus, 1 dešinė viršus, 2 kairė apačia, 3 dešinė apačia - juo katinas ateina ir sustoja.
  // "L" = apatinė eilė: katinas ateina sniegu priešais namelius.
  // Dienos iš eilės: 1-6 kairė viršus, 7-12 dešinė viršus, 13-18 kairė apačia, 19-24 dešinė apačia.
  const HOUSE_W = 150, CX = 978;
  const HOUSES = [
    [690, 404, 0, 575, 412, 770, 440], [630, 618, 2, 755, 652, 730, 622], [580, 305, 0, 462, 312, 664, 308],
    [400, 500, 0, 590, 422, 490, 402, 500, 472], [520, 205, 0, 405, 222, 427, 186], [335, 335, 0, 478, 350, 421, 300],
    [1270, 404, 1, 1385, 414, 1190, 440], [1325, 618, 3, 1210, 650, 1242, 622], [1354, 305, 1, 1472, 312, 1440, 302],
    [1540, 500, 1, 1360, 426, 1452, 404, 1452, 478], [1470, 200, 1, 1592, 212, 1548, 190], [1590, 385, 1, 1440, 372, 1502, 335],
    [840, 850, "L", 945, 886, 770, 868], [680, 842, "L", 785, 878, 715, 704], [480, 690, 2, 612, 692, 405, 738],
    [520, 900, "L", 625, 936, 558, 752], [330, 758, 2, 460, 750, 262, 804], [360, 966, "L", 465, 1002, 398, 816],
    [1120, 850, "L", 1015, 886, 1188, 868], [1280, 840, "L", 1175, 876, 1245, 696], [1480, 697, 3, 1348, 688, 1556, 760],
    [1440, 902, "L", 1335, 938, 1400, 752], [1640, 798, 3, 1508, 768, 1705, 860], [1600, 1002, "L", 1495, 1038, 1562, 850]
  ];
  function layout() {
    const out = [], lanes = { 2: [], 3: [] };
    HOUSES.forEach(([hx, hy, via, cx, cy, lx, ly, ex, ey], i) => {
      const mirror = hx > CX, w = HOUSE_W * depth(hy), tc = hx < CX ? 1 : -1;   // tc: kryptis centro link
      const dx = hx + (mirror ? -1 : 1) * 0.07 * w;                              // durų vidurys
      const cat = { x: cx, y: cy };
      let elf, path;
      if (via === "L") {                          // katinas ateina sniegu priešais namelių eilę
        const r = hx < CX ? 2 : 3;
        elf = { x: dx + tc * 18, y: hy + 26 };
        lanes[r].push(cat);
        path = [{ x: CX, y: 705 }, { x: CX, y: 800 }, ...lanes[r]];
      } else {                                    // katinas sustoja kelyje, elfas išeina prie jo
        elf = { x: dx + Math.max(-20, Math.min(20, (cx - dx) * 0.15)), y: hy + 28 };
        path = [{ x: ROADS[via].pts[0][0], y: ROADS[via].pts[0][1] }, ...roadPath(via, 0, nearest(via, cat).s)];
        path[path.length - 1] = cat;
      }
      if (ex) elf = { x: ex, y: ey };
      // žibintas niekada nestovi ant grindinio: nustumiamas nuo kelio vidurio ir už aikštės krašto
      const lan = { x: lx, y: ly };
      for (let k = 0; k < 3; k++) {
        for (let r = 0; r < 4; r++) {
          const n = nearest(r, lan);
          if (n.d < 64) {
            let ux = lan.x - n.x, uy = lan.y - n.y, l = Math.hypot(ux, uy);
            if (l < 1) { ux = hx - n.x; uy = hy - 60 - n.y; l = Math.hypot(ux, uy); }
            lan.x = n.x + ux / l * 64; lan.y = n.y + uy / l * 64;
          }
        }
        const qx = (lan.x - 978) / 285, qy = (lan.y - 563) / 162, q = Math.hypot(qx, qy);
        if (q < 1) { lan.x = 978 + qx / q * 285; lan.y = 563 + qy / q * 162; }
      }
      out.push({ day: i + 1, mirror, house: { x: hx, y: hy }, lantern: lan, cat, elf, path });
    });
    return out;
  }
  const SPOTS = layout(); window.__SPOTS = SPOTS;

  function buildWorld() {
    if (IMG.fonas) $("bg").style.backgroundImage = `url("${IMG.fonas}")`; else $("bg").innerHTML = phBackground();

    const tree = obj("tree", 978, 606, IMG.eglute);
    [[50, 30], [35, 48], [64, 52], [28, 68], [50, 72], [72, 70], [20, 86], [42, 88], [62, 86], [80, 88]].forEach(([l, t], i) => {
      const b = document.createElement("i");
      b.style.cssText = `left:${l}%;top:${t}%;color:${["#ffd24a", "#ff6b5e", "#7fd4ff", "#fff"][i % 4]};animation-delay:${(i * 0.37) % 1.4}s`;
      tree.querySelector(".inner").appendChild(b);
    });

    SPOTS.forEach((s) => {
      const v = (s.day - 1) % 4 + 1, d0 = CFG.durys[v], mir = s.mirror && IMG[`namelis-${v}-v`];
      const src = mir || IMG[`namelis-${v}`], d = mir ? { ...d0, x: 1 - d0.x - d0.w } : d0;
      s.door = d;
      const h = obj("house", s.house.x, s.house.y, src), openSrc = IMG[`namelis-${v}-atviras`];
      if (openSrc) { h.classList.add("two"); h.querySelector(".inner").insertAdjacentHTML("beforeend", `<img class="openimg" src="${openSrc}" alt="">`); }
      const box = `left:${d.x * 100}%;top:${d.y * 100}%;width:${d.w * 100}%;height:${d.h * 100}%;`;
      h.insertAdjacentHTML("beforeend",
        `<div class="interior" style="${box}"></div>
         <div class="door" style="${box}background-image:url('${src}');background-size:${100 / d.w}% ${100 / d.h}%;background-position:${d.x / (1 - d.w) * 100}% ${d.y / (1 - d.h) * 100}%"><span>${s.day}</span></div>
         <div class="star">⭐</div>`);
      h.addEventListener("pointerdown", (e) => { e.stopPropagation(); openDoor(s.day); });
      houses[s.day] = h;
      const l = obj("lantern", s.lantern.x, s.lantern.y, IMG.zibintas);
      l.insertAdjacentHTML("afterbegin", `<div class="glow"></div>`);
      lanterns[s.day] = l;
    });

    filmLantern = obj("filmlantern", 1100, 290, IMG["zibintas-pasaka"]);
    filmLantern.insertAdjacentHTML("afterbegin", `<div class="glow"></div>`);
    filmLantern.addEventListener("pointerdown", openFilm);

    cat = obj("cat", ORBIT.x + ORBIT.rx, ORBIT.y, CAT.walk);
    cat.querySelector(".inner").insertAdjacentHTML("afterbegin", `<div class="shadow"></div>`);
    if (IMG["katinas-eisena"]) {                  // eisena iš vaizdo įrašo kadrų (18 kadrų juosta)
      cat.querySelector(".inner").insertAdjacentHTML("beforeend", `<div class="rig sprite" style="background-image:url('${IMG["katinas-eisena"]}')"></div>`);
      CAT.rig = true;
    } else if (RIG_PARTS.every((p) => IMG["katinas/" + p[0]])) {
      const parts = RIG_PARTS.map(([f, l, t, w, ox, oy, cls]) =>
        `<div class="part ${cls}" style="left:${l / 11}%;top:${t / 9.35}%;width:${w / 11}%;transform-origin:${ox}% ${oy}%">
           <img src="${IMG["katinas/" + f]}" alt="">${cls === "head" ? `<svg class="lids" viewBox="0 0 374 333"><g fill="#f5f2eb"><ellipse cx="189" cy="166" rx="40" ry="42"/><ellipse cx="292" cy="148" rx="31" ry="38"/></g><g fill="none" stroke="#5a4636" stroke-width="5" stroke-linecap="round"><path d="M158 172 q31 20 62 0"/><path d="M268 154 q24 18 48 0"/></g></svg>` : ""}
         </div>`).join("");
      cat.querySelector(".inner").insertAdjacentHTML("beforeend", `<div class="rig">${parts}</div>`);
      CAT.rig = true;
    }
    cat.addEventListener("pointerdown", (e) => { e.stopPropagation(); catAnnounce(); });

    elf = obj("elf", 0, 0, "");
    elf.querySelector(".inner").innerHTML = `<img alt=""><div class="esprite"></div>`;
    elf.querySelector(".flip").style.transformOrigin = "50% 100%";
  }
  let cat, elf, filmLantern;
  const CAT = {};

  /* ---------- Katino judėjimas ---------- */
  let orbiting = false, angle = 0, lastT = 0;
  function setCat(src) { const im = cat.querySelector(".inner > img"); if (im.getAttribute("src") !== src) im.src = src; cat.classList.remove("rig-on"); }
  function catWalkLook() { if (CAT.rig) cat.classList.add("rig-on"); else setCat(CAT.walk); }
  function face(dx) { cat.classList.toggle("left", dx < 0); }
  function orbitTick(t) {
    if (!orbiting) return;
    const dt = Math.min(50, t - lastT); lastT = t;
    angle += dt * 0.00045;
    const x = ORBIT.x + Math.cos(angle) * ORBIT.rx, y = ORBIT.y + Math.sin(angle) * ORBIT.ry;
    face(-Math.sin(angle)); place(cat, x, y);
    requestAnimationFrame(orbitTick);
  }
  function startOrbit() { orbiting = true; catWalkLook(); cat.classList.add("walking"); lastT = performance.now(); requestAnimationFrame(orbitTick); }
  function stopOrbit() { orbiting = false; }
  function move(x, y, speed = 300) {           // vienas tiesus atkarpos žingsnis
    return new Promise((res) => {
      const x0 = cat._x, y0 = cat._y, dist = Math.hypot(x - x0, y - y0), dur = Math.max(1, dist / speed * 1000), t0 = performance.now();
      if (Math.abs(x - x0) > 6) face(x - x0);
      (function step(t) {
        const k = Math.min(1, (t - t0) / dur);
        place(cat, x0 + (x - x0) * k, y0 + (y - y0) * k);
        if (k < 1) requestAnimationFrame(step); else res();
      })(t0);
    });
  }
  async function walkPath(pts) {
    catWalkLook(); cat.classList.add("walking");
    for (const p of pts) await move(p.x, p.y);
    cat.classList.remove("walking");
  }
  // Maršrutai: katinas eina tik ratu aplink eglutę ir kelių viduriu, ne kiaurai per objektus.
  let where = { type: "orbit" };
  const ell = (a) => ({ x: ORBIT.x + Math.cos(a) * ORBIT.rx, y: ORBIT.y + Math.sin(a) * ORBIT.ry });
  const ang = (p) => Math.atan2((p.y - ORBIT.y) / ORBIT.ry, (p.x - ORBIT.x) / ORBIT.rx);
  const entry = (r) => ({ x: ROADS[r].pts[0][0], y: ROADS[r].pts[0][1] });
  function arc(a0, a1) {                          // taškai elipse trumpiausia kryptimi
    const d = ((a1 - a0 + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    const n = Math.max(1, Math.ceil(Math.abs(d) / 0.2)), out = [];
    for (let i = 1; i <= n; i++) out.push(ell(a0 + d * i / n));
    return out;
  }
  function toEllipse() {                          // kelias nuo dabartinės vietos iki rato aplink eglutę
    if (where.type === "orbit") return { pts: [], a: angle };
    if (where.type === "front") return { pts: [ell(Math.PI / 2)], a: Math.PI / 2 };
    const p = where.s.path, a = ang(p[0]);       // tuo pačiu keliu atgal
    return { pts: [...p.slice(0, -1).reverse(), ell(a)], a };
  }
  async function goFront() {
    stopOrbit(); const { pts, a } = toEllipse();
    await walkPath([...pts, ...arc(a, Math.PI / 2), FRONT]); where = { type: "front" };
  }
  async function goHouse(s) {
    stopOrbit(); const { pts, a } = toEllipse();
    await walkPath([...pts, ...arc(a, ang(s.path[0])), ...s.path]);
    where = { type: "house", s };
  }
  async function catHome() {
    const { pts, a } = toEllipse();
    await walkPath(pts); angle = a; where = { type: "orbit" }; startOrbit();
  }

  /* ---------- Kalbėjimas ---------- */
  async function say(who, x, y, text, audioName, frames) {
    bubble.textContent = text; bubble.hidden = false;
    const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    bubble.style.left = Math.max(bw / 2 + 20, Math.min(W - bw / 2 - 20, x)) + "px";
    bubble.style.top = Math.max(bh + 20, y) + "px";
    who.classList.add("talking");
    const img = who.querySelector(".inner > img"); let i = 0;
    const timer = frames && setInterval(() => { img.src = frames[i++ % 2]; }, 190);
    await voice(audioName, Math.max(2600, text.length * 75));
    if (timer) { clearInterval(timer); img.src = frames[0]; }
    who.classList.remove("talking"); bubble.hidden = true;
  }

  /* ---------- Diena ---------- */
  const params = new URLSearchParams(location.search);
  let testDay = parseInt(params.get("diena"), 10) || null;
  function today() {
    if (testDay) return Math.max(1, Math.min(24, testDay));
    const d = new Date();
    if (d.getMonth() !== 11) return 0;           // ne gruodis
    return Math.min(24, d.getDate());
  }
  const DAYWORD = ["", "pirma", "antra", "trečia", "ketvirta", "penkta", "šešta", "septinta", "aštunta", "devinta", "dešimta", "vienuolikta", "dvylikta", "trylikta", "keturiolikta", "penkiolikta", "šešiolikta", "septyniolikta", "aštuoniolikta", "devyniolikta", "dvidešimta", "dvidešimt pirma", "dvidešimt antra", "dvidešimt trečia", "dvidešimt ketvirta"];

  let opened = [];
  try { opened = JSON.parse(localStorage.getItem("adventas-atidaryta") || "[]"); } catch (e) {}
  function saveOpened() { try { localStorage.setItem("adventas-atidaryta", JSON.stringify(opened)); } catch (e) {} }
  function refresh() {
    const t = today();
    for (let d = 1; d <= 24; d++) {
      houses[d].classList.toggle("done", opened.includes(d));
      houses[d].classList.toggle("today", d === t && !opened.includes(d));
    }
    filmLantern.classList.toggle("off", t < CFG.filmasNuoDienos);
    $("tday").textContent = t;
  }

  /* ---------- Eiga ---------- */
  let busy = false, catAt = 0;
  function lightOnly(day) { for (let d = 1; d <= 24; d++) lanterns[d].classList.toggle("on", d === day); }

  async function catAnnounce() {
    if (busy) return; busy = true;
    const t = today();
    sfx("miau");
    await goFront();
    cat.classList.remove("left"); setCat(CAT.sit[0]);
    if (!t) {
      await say(cat, FRONT.x, FRONT.y - 190, "Miau! Adventas prasidės gruodžio pirmą dieną!", "katinas-laukiam", CAT.sit);
      await catHome(); busy = false; return;
    }
    await say(cat, FRONT.x, FRONT.y - 190, `Miau! Šiandien gruodžio ${DAYWORD[t]} diena!`, `katinas-${pad(t)}`, CAT.sit);
    lightOnly(t); sfx("varpelis");
    await sleep(700);
    const s = SPOTS[t - 1];
    await goHouse(s); cat.classList.remove('left');
    setCat(CAT.sit[0]); catAt = t; cat.classList.add('waiting'); busy = false;
  }

  // Kadrų juostos: vienas kadras yra 360x520, todėl kadrų skaičių atpažįstame iš failo pločio.
  const SPR_ASPECT = 360 / 520;
  function sheetFrames(name) {
    const sz = IMGSIZE[name];
    return sz ? Math.max(1, Math.round(sz[0] / (sz[1] * SPR_ASPECT))) : 1;
  }
  function elfShow(name, animate, ms) {          // animate: "pirmyn", "pirmyn-atgal" arba null (sustingęs kadras)
    const d = elf.querySelector(".esprite"), n = sheetFrames(name);
    d.style.backgroundImage = `url("${IMG[name]}")`;
    d.style.backgroundSize = `${n * 100}% 100%`;
    d.style.backgroundPosition = "0 0";
    d.style.animation = animate ? `espr ${ms}ms steps(${n}, jump-none) infinite ${animate === "pirmyn-atgal" ? "alternate" : ""}` : "none";
  }

  function elfWalk(x, y, k1, dur) {             // elfas eina pėsčiomis ir artėdamas didėja
    return new Promise((res) => {
      const x0 = elf._x, y0 = elf._y, k0 = elf._k, t0 = performance.now(), flip = elf.querySelector(".flip"), dir = x < x0 - 4 ? -1 : 1;
      elf.classList.add("walking");
      (function step(t) {
        const q = Math.min(1, (t - t0) / dur);
        place(elf, x0 + (x - x0) * q, y0 + (y - y0) * q); elf.style.zIndex = Math.max(elf._zmin, Math.round(elf._y));
        elf._k = k0 + (k1 - k0) * q; flip.style.transform = `scale(${dir * elf._k}, ${elf._k})`;
        if (q < 1) requestAnimationFrame(step); else { elf.classList.remove("walking"); flip.style.transform = `scale(${elf._k})`; res(); }
      })(t0);
    });
  }

  async function openDoor(day) {
    if (busy) return;
    const t = today(), h = houses[day], s = SPOTS[day - 1];
    if (day > t) {
      sfx("uzrakinta"); h.classList.remove("locked-shake"); void h.offsetWidth; h.classList.add("locked-shake"); return;
    }
    busy = true;
    if (catAt !== day) { lightOnly(day); await goHouse(s); cat.classList.remove("left"); setCat(CAT.sit[0]); catAt = day; cat.classList.add("waiting"); }

    const girl = day % 2 === 0, base = girl ? "elfas-mergaite-" : "elfas-berniukas-";
    const F = [1, 2, 3].map((f) => IMG[base + f]);
    const juosta = IMG[base + "eina"] && IMG[base + "kalba"];   // ar yra kadrų juostos iš vaizdo įrašo
    const d = s.door;
    const hw = h.offsetWidth, hh = h.offsetHeight;   // namelio dydis ekrane be gylio mastelio
    const doorX = h._x + (d.x + d.w / 2 - 0.5) * hw * h._s, doorY = h._y - (1 - d.y - d.h) * hh * h._s;
    const eimg = elf.querySelector("img");
    const small = d.h * hh * 0.9 / 168;         // elfas tarpduryje telpa į duris

    sfx("durys"); h.classList.add("open");
    await sleep(1500);                           // durys atsidaro lėtai
    eimg.src = F[0]; elf._zmin = Math.round(h._y) + 1; elf._k = small;
    elf.classList.toggle("sheet", !!juosta);
    if (juosta) elfShow(base + "kalba", null);
    place(elf, doorX, doorY); elf.style.zIndex = elf._zmin;
    elf.querySelector(".flip").style.transform = `scale(${small})`;
    elf.classList.add("out");
    await sleep(900);                            // pastovi tarpduryje
    if (juosta) elfShow(base + "eina", "pirmyn", 3200);
    await elfWalk(s.elf.x, s.elf.y, 0.85, 1600); // išeina ir atsistoja šalia katino
    if (juosta) elfShow(base + "kalba", null);
    await sleep(300);
    if (!juosta) { eimg.src = F[2]; await sleep(900); } else await sleep(600);
    const text = `${CFG.elfoLabas} ${CFG.uzduotys[day] || ""} ${CFG.elfoAte}`;
    if (juosta) elfShow(base + "kalba", "pirmyn-atgal", 2400);
    await say(elf, s.elf.x, s.elf.y - 168 * 0.85 * elf._s - 20, text, `elfas-${pad(day)}`, juosta ? null : [F[0], F[1]]);
    if (juosta) { elfShow(base + "kalba", null); await sleep(900); }
    else { eimg.src = F[2]; await sleep(1100); eimg.src = F[0]; }
    if (juosta) elfShow(base + "eina", "pirmyn", 3200);
    await elfWalk(doorX, doorY, small, 1600);    // grįžta į namelį
    await sleep(300);
    elf.classList.remove("out");
    await sleep(500);
    h.classList.remove("open");
    await sleep(1500);

    if (!opened.includes(day)) { opened.push(day); saveOpened(); }
    lightOnly(0); catAt = 0; cat.classList.remove("waiting"); refresh();
    await catHome();
    busy = false;
  }

  /* ---------- Pasakos žibintas ---------- */
  function openFilm(e) {
    e.stopPropagation(); if (busy) return;
    const v = $("filmvideo"), msg = $("filmmsg");
    msg.hidden = true; v.hidden = false;
    const alt = CFG.filmoFailas.split("/").pop();
    v.onerror = () => { if (v.getAttribute("src") !== alt) { v.src = alt; v.play().catch(() => {}); } else { v.hidden = true; msg.hidden = false; } };
    v.src = CFG.filmoFailas; $("film").hidden = false;
    v.play().catch(() => {});
  }
  $("filmclose").addEventListener("pointerdown", (e) => {
    e.stopPropagation(); const v = $("filmvideo"); v.pause(); v.removeAttribute("src"); v.load(); $("film").hidden = true;
  });

  /* ---------- Sniegas ---------- */
  function snow() {
    const cv = $("snow"), g = cv.getContext("2d");
    const flakes = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 1.5 + Math.random() * 3.5, v: 25 + Math.random() * 55, p: Math.random() * 6.28 }));
    let last = performance.now();
    (function tick(t) {
      const dt = Math.min(60, t - last) / 1000; last = t;
      g.clearRect(0, 0, W, H); g.fillStyle = "rgba(255,255,255,.9)";
      for (const f of flakes) {
        f.y += f.v * dt; f.p += dt; f.x += Math.sin(f.p) * 18 * dt;
        if (f.y > H + 5) { f.y = -5; f.x = Math.random() * W; }
        g.beginPath(); g.arc(f.x, f.y, f.r, 0, 6.283); g.fill();
      }
      requestAnimationFrame(tick);
    })(last);
  }

  /* ---------- Valdymas ---------- */
  $("fs").addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {});
  });
  function setupTestBar() {
    const show = params.has("test") || params.has("diena") || new Date().getMonth() !== 11;
    $("testbar").hidden = !show;
    if (show && !testDay) testDay = 1;
    const chg = (n) => (e) => { e.stopPropagation(); if (busy) return; testDay = Math.max(1, Math.min(24, (testDay || today()) + n)); lightOnly(0); catAt = 0; cat.classList.remove('waiting'); refresh(); if (!orbiting) catHome(); };
    $("tminus").addEventListener("pointerdown", chg(-1));
    $("tplus").addEventListener("pointerdown", chg(1));
    $("treset").addEventListener("pointerdown", (e) => { e.stopPropagation(); opened = []; saveOpened(); refresh(); });
  }

  /* ---------- Užduotys iš Google Sheets (nebūtina) ---------- */
  async function loadSheet() {
    if (!CFG.sheetCsvUrl) return;
    try {
      const txt = await (await fetch(CFG.sheetCsvUrl, { cache: "no-store" })).text();
      txt.split(/\r?\n/).forEach((line) => {
        const m = line.match(/^\s*"?(\d{1,2})"?\s*,\s*(.*)$/);
        if (m) CFG.uzduotys[+m[1]] = m[2].replace(/^"|"$/g, "").replace(/""/g, '"').trim();
      });
    } catch (e) { /* lieka content.js užduotys */ }
  }

  /* ---------- Paleidimas ---------- */
  Promise.all(assetJobs).then(() => {
    CAT.walk = IMG["katinas-eina"] || "assets/img/katinas-eina.webp";
    const sit1 = IMG["katinas-sedi-1"] || IMG["katinas-moja"] || CAT.walk;   // kol nėra sėdėjimo pozų, rodoma mojanti
    const sit2 = IMG["katinas-sedi-2"] || IMG["katinas-moja"] || CAT.walk;
    CAT.sit = [sit1, sit2];
    buildWorld(); setupTestBar(); refresh(); snow(); startOrbit(); loadSheet();
  });
})();

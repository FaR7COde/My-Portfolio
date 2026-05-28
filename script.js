// ─── CURSOR ───
const cur = document.getElementById("cursor"),
  trail = document.getElementById("cursor-trail");
let mx = 0,
  my = 0,
  trx = 0,
  tr_y = 0;
document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  cur.style.left = mx + "px";
  cur.style.top = my + "px";
});
(function animTrail() {
  trx += (mx - trx) * 0.12;
  tr_y += (my - tr_y) * 0.12;
  trail.style.left = trx + "px";
  trail.style.top = tr_y + "px";
  requestAnimationFrame(animTrail);
})();
document
  .querySelectorAll("a,button,.skill-card,.project-card,.contact-link")
  .forEach((el) => {
    el.addEventListener("mouseenter", () =>
      document.body.classList.add("hovered"),
    );
    el.addEventListener("mouseleave", () =>
      document.body.classList.remove("hovered"),
    );
  });

// ─── BG PARTICLES ───
const bgC = document.getElementById("bgCanvas"),
  bgCtx = bgC.getContext("2d");
let bW = 0,
  bH = 0;
function bResize() {
  bW = bgC.width = window.innerWidth;
  bH = bgC.height = window.innerHeight;
}
bResize();
window.addEventListener("resize", bResize);
const bP = Array.from({ length: 80 }, () => {
  const p = {};
  function r() {
    p.x = Math.random() * bW;
    p.y = Math.random() * bH;
    p.vx = (Math.random() - 0.5) * 0.3;
    p.vy = (Math.random() - 0.5) * 0.3;
    p.r = Math.random() * 1.4 + 0.3;
    p.a = Math.random() * 0.3 + 0.05;
  }
  r();
  p.r2 = r;
  return p;
});
(function bgLoop() {
  bgCtx.clearRect(0, 0, bW, bH);
  bP.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > bW || p.y < 0 || p.y > bH) p.r2();
    bgCtx.beginPath();
    bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(56,189,248,${p.a})`;
    bgCtx.fill();
  });
  for (let i = 0; i < bP.length; i++)
    for (let j = i + 1; j < bP.length; j++) {
      const dx = bP[i].x - bP[j].x,
        dy = bP[i].y - bP[j].y,
        d = Math.sqrt(dx * dx + dy * dy);
      if (d < 120) {
        bgCtx.beginPath();
        bgCtx.moveTo(bP[i].x, bP[i].y);
        bgCtx.lineTo(bP[j].x, bP[j].y);
        bgCtx.strokeStyle = `rgba(56,189,248,${0.05 * (1 - d / 120)})`;
        bgCtx.lineWidth = 0.5;
        bgCtx.stroke();
      }
    }
  requestAnimationFrame(bgLoop);
})();

// ══════════════════════════════════════════════════════════
//  3D GLOBE — Canvas 2D, full interactive
// ══════════════════════════════════════════════════════════
const gc = document.getElementById("globeCanvas");
const gctx = gc.getContext("2d");

// SVG icon paths for popup
const ICONS = {
  globe: `<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`,
  car: `<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`,
  building: `<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  code: `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`,
  palette: `<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>`,
  zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  pen: `<line x1="18" y1="2" x2="22" y2="6"/><path d="M7.5 20.5L19 9l-4-4L3.5 16.5 2 22z"/>`,
  cpu: `<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>`,
  layers: `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
  git: `<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 012 2v7"/><line x1="6" y1="9" x2="6" y2="21"/>`,
  clock: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  monitor: `<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>`,
  rocket: `<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>`,
  terminal: `<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>`,
  tool: `<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>`,
  cloud: `<path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>`,
};

function svgIcon(key, size = 24, col = "#38bdf8") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[key] || ICONS.globe}</svg>`;
}

const NODE_DATA = [
  {
    lat: 0.7,
    lng: 0.3,
    label: "Portfolio v1",
    type: "project",
    icon: "globe",
    desc: "Website portofolio pribadi dengan animasi interaktif dan desain modern.",
    link: "https://far7code.github.io/",
  },
  {
    lat: -0.4,
    lng: 2.2,
    label: "Katalog Mobil",
    type: "project",
    icon: "car",
    desc: "Katalog otomotif mewah dengan UI interaktif dan informatif.",
    link: "https://far7code.github.io/katalog-mobil/",
  },
  {
    lat: 0.5,
    lng: 4.4,
    label: "Masjid Al-Qalam",
    type: "project",
    icon: "building",
    desc: "Sistem informasi digital masjid modern & user-friendly.",
    link: "https://far7code.github.io/Masjid-Al-Qalam1/",
  },
  {
    lat: 1.0,
    lng: 3.1,
    label: "HTML5",
    type: "skill",
    icon: "code",
    desc: "Struktur web semantik, aksesibel, SEO-friendly. Level: Expert (92%).",
  },
  {
    lat: -0.6,
    lng: 1.1,
    label: "CSS3",
    type: "skill",
    icon: "palette",
    desc: "Animasi, grid/flex, glassmorphism, responsive design. Level: Advanced (88%).",
  },
  {
    lat: 0.2,
    lng: 5.7,
    label: "JavaScript",
    type: "skill",
    icon: "zap",
    desc: "DOM, Canvas, interaktivitas penuh. Level: Intermediate (75%).",
  },
  {
    lat: 0.7,
    lng: 1.8,
    label: "UI Design",
    type: "skill",
    icon: "pen",
    desc: "Antarmuka modern, UX, typography, color theory. Level: Advanced (85%).",
  },
  {
    lat: -0.5,
    lng: 3.7,
    label: "AI Supervisor",
    type: "skill",
    icon: "cpu",
    desc: "Supervisi AI, prompt engineering, workflow otomasi. Level: Expert (90%).",
  },
  {
    lat: 0.9,
    lng: 0.2,
    label: "Figma",
    type: "skill",
    icon: "layers",
    desc: "Wireframing, prototyping, component system. Level: Advanced (78%).",
  },
  {
    lat: 0.4,
    lng: 4.5,
    label: "Git & GitHub",
    type: "skill",
    icon: "git",
    desc: "Version control, branching, GitHub Pages deploy. Level: Intermediate (72%).",
  },
  {
    lat: -0.2,
    lng: 2.8,
    label: "Coming Soon",
    type: "project",
    icon: "clock",
    desc: "Proyek baru sedang pengerjaan. Segera hadir!",
  },
  {
    lat: 0.6,
    lng: 0.9,
    label: "Responsive",
    type: "skill",
    icon: "monitor",
    desc: "Mobile-first, breakpoints, fluid layouts. Level: Expert (90%).",
  },
  {
    lat: 0.3,
    lng: 1.4,
    label: "Performance",
    type: "skill",
    icon: "rocket",
    desc: "Optimasi loading, lazy load, Core Web Vitals. Level: Advanced (80%).",
  },
  {
    lat: -0.1,
    lng: 4.8,
    label: "Prompt Eng.",
    type: "skill",
    icon: "terminal",
    desc: "Prompt efektif untuk AI generatif & workflow. Level: Expert (88%).",
  },
  {
    lat: 0.5,
    lng: 0.6,
    label: "VS Code",
    type: "skill",
    icon: "tool",
    desc: "Editor utama, extension, snippets, optimal config. Level: Expert (92%).",
  },
  {
    lat: -0.3,
    lng: 4.1,
    label: "GitHub Pages",
    type: "skill",
    icon: "cloud",
    desc: "Deploy & hosting statis gratis, CI/CD otomatis. Level: Advanced (85%).",
  },
];

// ── State ──
let rotY = 0,
  rotX = 0,
  velY = 0.004,
  velX = 0;
let tiltX = 0,
  tiltY = 0,
  targetTiltX = 0,
  targetTiltY = 0;
let isDragging = false,
  dragX = 0,
  dragY = 0,
  lastVX = 0,
  lastVY = 0;
let hoveredNode = -1,
  activeNode = -1;
let globeTime = 0;

// ── Shooting stars ──
const STARS = [];
function spawnStar() {
  const la = (Math.random() - 0.5) * Math.PI * 1.6,
    lo = Math.random() * Math.PI * 2;
  const dla = (Math.random() - 0.5) * 1.1,
    dlo = (Math.random() - 0.5) * 1.1;
  STARS.push({
    la,
    lo,
    endLa: la + dla,
    endLo: lo + dlo,
    t: 0,
    spd: 0.02 + Math.random() * 0.018,
    life: 1,
  });
}
setInterval(spawnStar, 900);
spawnStar();
spawnStar();

// ── Ripples ──
const RIPPLES = [];

// ── Dynamic arcs ──
const DYN_ARCS = [];
let dynTimer = 0;

// ── Parallax ──
document.addEventListener("mousemove", (e) => {
  targetTiltY = (e.clientX / window.innerWidth - 0.5) * 0.34;
  targetTiltX = (e.clientY / window.innerHeight - 0.5) * 0.24;
});

// ── Drag ──
gc.addEventListener("mousedown", (e) => {
  isDragging = true;
  dragX = e.clientX;
  dragY = e.clientY;
  velY = 0;
  velX = 0;
  lastVX = 0;
  lastVY = 0;
  gc.style.cursor = "grabbing";
  e.preventDefault();
});
window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  lastVX = (e.clientX - dragX) * 0.007;
  lastVY = (e.clientY - dragY) * 0.006;
  rotY += lastVX;
  rotX += lastVY;
  rotX = Math.max(-1.3, Math.min(1.3, rotX));
  dragX = e.clientX;
  dragY = e.clientY;
});
window.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;
  velY = lastVX * 0.55;
  velX = lastVY * 0.4;
  gc.style.cursor = "grab";
});
gc.addEventListener(
  "touchstart",
  (e) => {
    const t = e.touches[0];
    isDragging = true;
    dragX = t.clientX;
    dragY = t.clientY;
    velY = 0;
    velX = 0;
  },
  { passive: true },
);
gc.addEventListener(
  "touchmove",
  (e) => {
    if (!isDragging) return;
    const t = e.touches[0];
    lastVX = (t.clientX - dragX) * 0.007;
    lastVY = (t.clientY - dragY) * 0.006;
    rotY += lastVX;
    rotX += lastVY;
    rotX = Math.max(-1.3, Math.min(1.3, rotX));
    dragX = t.clientX;
    dragY = t.clientY;
    e.preventDefault();
  },
  { passive: false },
);
gc.addEventListener("touchend", () => {
  isDragging = false;
  velY = lastVX * 0.55;
  velX = lastVY * 0.4;
});
gc.style.cursor = "grab";

// ── Slerp ──
function slerp(la1, lo1, la2, lo2, steps = 60) {
  function ll(la, lo) {
    const c = Math.cos(la);
    return [c * Math.sin(lo), Math.sin(la), c * Math.cos(lo)];
  }
  const v1 = ll(la1, lo1),
    v2 = ll(la2, lo2);
  const dt = Math.max(
    -1,
    Math.min(1, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]),
  );
  const om = Math.acos(dt),
    pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let v;
    if (Math.abs(om) < 0.001)
      v = [
        v1[0] * (1 - t) + v2[0] * t,
        v1[1] * (1 - t) + v2[1] * t,
        v1[2] * (1 - t) + v2[2] * t,
      ];
    else {
      const s = Math.sin(om),
        a = Math.sin((1 - t) * om) / s,
        b = Math.sin(t * om) / s;
      v = [v1[0] * a + v2[0] * b, v1[1] * a + v2[1] * b, v1[2] * a + v2[2] * b];
    }
    pts.push({
      lat: Math.asin(Math.max(-1, Math.min(1, v[1]))),
      lng: Math.atan2(v[0], v[2]),
    });
  }
  return pts;
}

// ── Projection ──
function proj(lat, lng, R, CX, CY) {
  const ry = rotY + tiltY,
    rx = rotX + tiltX;
  const c = Math.cos(lat);
  const x3 = c * Math.sin(lng + ry);
  const yRaw = Math.sin(lat);
  const z3 = c * Math.cos(lng + ry);
  const y4 = yRaw * Math.cos(rx) - z3 * Math.sin(rx);
  const z4 = yRaw * Math.sin(rx) + z3 * Math.cos(rx);
  // perspective divide for real 3D depth
  const fov = 2.2;
  const scale = fov / (fov + z4 + 1.0);
  return {
    x: CX + x3 * R * scale,
    y: CY - y4 * R * scale,
    z: z4,
    depth: scale,
    vis: z4 > -0.85,
  };
}

// ── Build static geometry ──
// Grid dots
const DOTS = [];
for (let la = -88; la <= 88; la += 7) {
  const c = Math.cos((la * Math.PI) / 180);
  const n = Math.max(10, Math.floor(c * 75));
  for (let i = 0; i < n; i++)
    DOTS.push({
      lat: (la * Math.PI) / 180,
      lng: (i / n) * Math.PI * 2,
      sz: 1.1 + Math.random() * 0.9,
      a: 0.4 + Math.random() * 0.4,
    });
}
for (let i = 0; i < 200; i++)
  DOTS.push({
    lat: (Math.random() - 0.5) * Math.PI,
    lng: Math.random() * Math.PI * 2,
    sz: 0.7 + Math.random() * 1.6,
    a: 0.18 + Math.random() * 0.3,
  });

// Static arcs
const ARCS = [];
for (let i = 0; i < NODE_DATA.length; i++)
  for (let j = i + 1; j < NODE_DATA.length; j++) {
    if (Math.random() < 0.42)
      ARCS.push({
        pts: slerp(
          NODE_DATA[i].lat,
          NODE_DATA[i].lng,
          NODE_DATA[j].lat,
          NODE_DATA[j].lng,
          60,
        ),
        nA: i,
        nB: j,
      });
  }

// Packets on arcs
const PACKETS = [];
ARCS.forEach((_, i) => {
  const n = 2 + Math.floor(Math.random() * 2);
  for (let k = 0; k < n; k++)
    PACKETS.push({
      arc: i,
      t: (k / n + Math.random() * 0.12) % 1,
      spd: 0.003 + Math.random() * 0.005,
    });
});

// Node pulse state
const nodePulse = NODE_DATA.map(() => Math.random() * Math.PI * 2);
const nodePulseS = NODE_DATA.map(() => 0.022 + Math.random() * 0.04);

// ── Popup ──
const popup = document.createElement("div");
popup.style.cssText = `position:fixed;z-index:9999;pointer-events:none;background:rgba(4,7,16,0.97);border:1px solid rgba(56,189,248,0.38);border-radius:18px;padding:22px 24px;width:272px;font-family:'DM Sans',sans-serif;color:#e8e8f0;backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);box-shadow:0 0 60px rgba(56,189,248,0.10),0 24px 70px rgba(0,0,0,0.75);opacity:0;transform:translateY(10px) scale(.93);transition:opacity .2s ease,transform .2s ease;`;
document.body.appendChild(popup);

function showPopup(idx, sx, sy) {
  const n = NODE_DATA[idx];
  const badge =
    n.type === "project"
      ? `<span style="background:rgba(56,189,248,0.13);color:#38bdf8;font-size:.58rem;letter-spacing:2px;padding:3px 10px;border-radius:20px;font-family:'Space Mono',monospace">PROJECT</span>`
      : `<span style="background:rgba(139,92,246,0.13);color:#a78bfa;font-size:.58rem;letter-spacing:2px;padding:3px 10px;border-radius:20px;font-family:'Space Mono',monospace">SKILL</span>`;
  const btn = n.link
    ? `<a href="${n.link}" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;background:#38bdf8;color:#000;text-align:center;text-decoration:none;font-family:'Space Mono',monospace;font-size:.68rem;font-weight:700;letter-spacing:1px;padding:11px;border-radius:10px;pointer-events:all;transition:box-shadow .2s" onmouseover="this.style.boxShadow='0 0 24px rgba(56,189,248,0.5)'" onmouseout="this.style.boxShadow='none'">View Project ${svgIcon("globe", 14, "#000")}</a>`
    : "";
  popup.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <div style="width:42px;height:42px;border-radius:12px;background:rgba(56,189,248,0.10);border:1px solid rgba(56,189,248,0.18);display:flex;align-items:center;justify-content:center;flex-shrink:0">${svgIcon(n.icon, 20)}</div>
      <div>${badge}<div style="font-size:1rem;font-weight:700;color:#fff;margin-top:4px">${n.label}</div></div>
    </div>
    <div style="font-size:.82rem;color:rgba(232,232,240,.60);line-height:1.68">${n.desc}</div>${btn}`;
  const pw = 280;
  let px = sx + 20,
    py = sy - 90;
  if (px + pw > window.innerWidth - 16) px = sx - pw - 20;
  if (py < 16) py = 16;
  if (py + 220 > window.innerHeight - 16) py = window.innerHeight - 236;
  popup.style.left = px + "px";
  popup.style.top = py + "px";
  popup.style.opacity = "1";
  popup.style.transform = "translateY(0) scale(1)";
  popup.style.pointerEvents = "all";
}
function hidePopup() {
  popup.style.opacity = "0";
  popup.style.transform = "translateY(10px) scale(.93)";
  popup.style.pointerEvents = "none";
}

// ── Hit test ──
function hitTest(ex, ey) {
  const rect = gc.getBoundingClientRect();
  const S = gc.width,
    CX = S / 2,
    CY = S / 2,
    R = S * 0.38;
  const scX = S / rect.width,
    scY = S / rect.height;
  const cx = (ex - rect.left) * scX,
    cy = (ey - rect.top) * scY;
  let best = -1,
    bestD = 30 * scX;
  NODE_DATA.forEach((n, i) => {
    const p = proj(n.lat, n.lng, R, CX, CY);
    if (!p.vis) return;
    const d = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

gc.addEventListener("mousemove", (e) => {
  if (isDragging) return;
  const hit = hitTest(e.clientX, e.clientY);
  hoveredNode = hit;
  gc.style.cursor = hit >= 0 ? "pointer" : "grab";
  if (hit >= 0 && hit !== activeNode) showPopup(hit, e.clientX, e.clientY);
  else if (hit < 0 && activeNode < 0) hidePopup();
});
gc.addEventListener("mouseleave", () => {
  hoveredNode = -1;
  if (activeNode < 0) hidePopup();
});
gc.addEventListener("click", (e) => {
  if (Math.abs(lastVX) > 0.008 || Math.abs(lastVY) > 0.008) return;
  const hit = hitTest(e.clientX, e.clientY);
  if (hit >= 0 && hit === activeNode) {
    activeNode = -1;
    hidePopup();
  } else if (hit >= 0) {
    activeNode = hit;
    showPopup(hit, e.clientX, e.clientY);
    // spawn ripple at node screen position
    const rect = gc.getBoundingClientRect();
    const S = gc.width,
      CX = S / 2,
      CY = S / 2,
      R = S * 0.38;
    const p = proj(NODE_DATA[hit].lat, NODE_DATA[hit].lng, R, CX, CY);
    RIPPLES.push({
      x: p.x,
      y: p.y,
      r: 0,
      maxR: R * 0.55,
      life: 1,
      spd: 3.5,
    });
  } else {
    activeNode = -1;
    hidePopup();
  }
});
document.addEventListener("click", (e) => {
  if (e.target !== gc && !popup.contains(e.target) && activeNode >= 0) {
    activeNode = -1;
    hidePopup();
  }
});

// ── MAIN DRAW ──
function drawGlobe() {
  requestAnimationFrame(drawGlobe);
  globeTime += 0.016;

  // Smooth tilt
  tiltX += (targetTiltX - tiltX) * 0.055;
  tiltY += (targetTiltY - tiltY) * 0.055;

  // Inertia
  if (!isDragging) {
    rotY += velY;
    velY *= 0.993;
    rotX += velX;
    velX *= 0.9;
    rotX = Math.max(-1.3, Math.min(1.3, rotX));
  }
  nodePulse.forEach((_, i) => {
    nodePulse[i] += nodePulseS[i];
  });

  // Spawn dynamic arcs periodically
  dynTimer += 0.016;
  if (dynTimer > 2.8) {
    dynTimer = 0;
    const a = Math.floor(Math.random() * NODE_DATA.length);
    let b = Math.floor(Math.random() * NODE_DATA.length);
    while (b === a) b = Math.floor(Math.random() * NODE_DATA.length);
    DYN_ARCS.push({
      pts: slerp(
        NODE_DATA[a].lat,
        NODE_DATA[a].lng,
        NODE_DATA[b].lat,
        NODE_DATA[b].lng,
        50,
      ),
      life: 1,
      spd: 0.007,
    });
  }
  for (let i = DYN_ARCS.length - 1; i >= 0; i--) {
    DYN_ARCS[i].life -= DYN_ARCS[i].spd;
    if (DYN_ARCS[i].life <= 0) DYN_ARCS.splice(i, 1);
  }

  // Packets
  PACKETS.forEach((pk) => {
    pk.t += pk.spd;
    if (pk.t > 1) pk.t = 0;
  });

  // Stars
  for (let i = STARS.length - 1; i >= 0; i--) {
    const s = STARS[i];
    s.t += s.spd;
    s.life = 1 - s.t;
    if (s.t >= 1) STARS.splice(i, 1);
  }

  // Ripples
  for (let i = RIPPLES.length - 1; i >= 0; i--) {
    const r = RIPPLES[i];
    r.r += r.spd;
    r.life = 1 - r.r / r.maxR;
    if (r.r >= r.maxR) RIPPLES.splice(i, 1);
  }

  const S = gc.width,
    CX = S / 2,
    CY = S / 2,
    R = S * 0.38;
  gctx.clearRect(0, 0, S, S);

  // ── Deep glow ──
  [
    [1.8, 0.07],
    [1.35, 0.045],
    [1.0, 0.02],
  ].forEach(([sc, al]) => {
    const g = gctx.createRadialGradient(CX, CY, 0, CX, CY, R * sc);
    g.addColorStop(0, `rgba(14,165,233,${al})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    gctx.fillStyle = g;
    gctx.beginPath();
    gctx.arc(CX, CY, R * sc, 0, Math.PI * 2);
    gctx.fill();
  });

  // ── Atmosphere ──
  const atm = gctx.createRadialGradient(CX, CY, R * 0.78, CX, CY, R * 1.12);
  atm.addColorStop(0, "rgba(0,0,0,0)");
  atm.addColorStop(0.6, "rgba(56,189,248,0.06)");
  atm.addColorStop(1, "rgba(56,189,248,0.28)");
  gctx.fillStyle = atm;
  gctx.beginPath();
  gctx.arc(CX, CY, R * 1.12, 0, Math.PI * 2);
  gctx.fill();

  // ── Globe sphere shading (3D illusion) ──
  const shade = gctx.createRadialGradient(
    CX - R * 0.3,
    CY - R * 0.3,
    0,
    CX,
    CY,
    R,
  );
  shade.addColorStop(0, "rgba(255,255,255,0.04)");
  shade.addColorStop(0.5, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(0,0,0,0.35)");
  gctx.fillStyle = shade;
  gctx.beginPath();
  gctx.arc(CX, CY, R, 0, Math.PI * 2);
  gctx.fill();

  // ── Globe outline ──
  gctx.beginPath();
  gctx.arc(CX, CY, R, 0, Math.PI * 2);
  gctx.strokeStyle = "rgba(56,189,248,0.38)";
  gctx.lineWidth = 2;
  gctx.stroke();
  gctx.beginPath();
  gctx.arc(CX, CY, R * 1.016, 0, Math.PI * 2);
  gctx.strokeStyle = "rgba(56,189,248,0.06)";
  gctx.lineWidth = 6;
  gctx.stroke();

  // ── Latitude ellipses ──
  [-65, -40, -15, 15, 40, 65].forEach((deg) => {
    const la = (deg * Math.PI) / 180;
    const p0 = proj(la, 0, R, CX, CY),
      p1 = proj(la, Math.PI / 2, R, CX, CY);
    const eRx = Math.abs(p1.x - p0.x) * 0.85 + R * Math.cos(la) * 0.15;
    const eRy = Math.abs(p1.y - p0.y) * 0.5;
    const ey = CY - Math.sin(la) * R * Math.cos(rotX + tiltX) * 0.96;
    gctx.beginPath();
    gctx.ellipse(
      CX,
      ey,
      Math.max(1, R * Math.cos(la)),
      Math.max(1, R * Math.cos(la) * 0.22),
      0,
      0,
      Math.PI * 2,
    );
    gctx.strokeStyle = "rgba(56,189,248,0.12)";
    gctx.lineWidth = 0.8;
    gctx.stroke();
  });

  // ── Meridians ──
  [0, 1, 2, 3, 4, 5].forEach((k) => {
    const lo = (k * Math.PI) / 3;
    gctx.beginPath();
    let first = true;
    for (let la = -Math.PI / 2; la <= Math.PI / 2; la += 0.055) {
      const p = proj(la, lo, R, CX, CY);
      if (!p.vis) {
        first = true;
        continue;
      }
      first ? (gctx.moveTo(p.x, p.y), (first = false)) : gctx.lineTo(p.x, p.y);
    }
    gctx.strokeStyle = "rgba(56,189,248,0.09)";
    gctx.lineWidth = 0.7;
    gctx.stroke();
  });

  // ── Grid dots with depth-based size ──
  DOTS.forEach((d) => {
    const p = proj(d.lat, d.lng, R, CX, CY);
    if (!p.vis || p.z < -0.15) return;
    const al = (d.a * (p.z + 0.15)) / 1.15;
    const sz = d.sz * (0.7 + p.depth * 0.5);
    gctx.beginPath();
    gctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
    gctx.fillStyle = `rgba(125,211,252,${al})`;
    gctx.fill();
  });

  // ── Static arcs (dashed animated) ──
  ARCS.forEach((arc) => {
    const isHl =
      arc.nA === hoveredNode ||
      arc.nB === hoveredNode ||
      arc.nA === activeNode ||
      arc.nB === activeNode;
    const dashOff = (globeTime * 22 + arc.nA * 11) % 16;
    gctx.beginPath();
    let first = true;
    arc.pts.forEach((pt) => {
      const p = proj(pt.lat, pt.lng, R, CX, CY);
      if (!p.vis) {
        first = true;
        return;
      }
      first ? (gctx.moveTo(p.x, p.y), (first = false)) : gctx.lineTo(p.x, p.y);
    });
    gctx.setLineDash([5, 4]);
    gctx.lineDashOffset = -dashOff;
    gctx.strokeStyle = isHl
      ? "rgba(125,211,252,0.80)"
      : "rgba(56,189,248,0.36)";
    gctx.lineWidth = isHl ? 2 : 1.1;
    gctx.stroke();
    gctx.setLineDash([]);
  });

  // ── Dynamic arcs (fade in/out) ──
  DYN_ARCS.forEach((arc) => {
    const al = (Math.min(arc.life, 0.5) / 0.5) * arc.life;
    gctx.beginPath();
    let first = true;
    arc.pts.forEach((pt) => {
      const p = proj(pt.lat, pt.lng, R, CX, CY);
      if (!p.vis) {
        first = true;
        return;
      }
      first ? (gctx.moveTo(p.x, p.y), (first = false)) : gctx.lineTo(p.x, p.y);
    });
    gctx.strokeStyle = `rgba(125,211,252,${al * 0.6})`;
    gctx.lineWidth = 1.5;
    gctx.stroke();
  });

  // ── Packets ──
  PACKETS.forEach((pk) => {
    const arc = ARCS[pk.arc],
      pts = arc.pts;
    const idx = Math.floor(pk.t * (pts.length - 1));
    const p = proj(pts[idx].lat, pts[idx].lng, R, CX, CY);
    if (!p.vis) return;
    const al = (p.z + 0.1) / 1.1;
    // Tail
    gctx.beginPath();
    let first = true;
    for (let k = Math.max(0, idx - 12); k <= idx; k++) {
      const tp = proj(pts[k].lat, pts[k].lng, R, CX, CY);
      if (!tp.vis) {
        first = true;
        continue;
      }
      first
        ? (gctx.moveTo(tp.x, tp.y), (first = false))
        : gctx.lineTo(tp.x, tp.y);
    }
    gctx.strokeStyle = `rgba(125,211,252,${al * 0.88})`;
    gctx.lineWidth = 2.8;
    gctx.stroke();
    gctx.beginPath();
    first = true;
    for (let k = Math.max(0, idx - 5); k <= idx; k++) {
      const tp = proj(pts[k].lat, pts[k].lng, R, CX, CY);
      if (!tp.vis) {
        first = true;
        continue;
      }
      first
        ? (gctx.moveTo(tp.x, tp.y), (first = false))
        : gctx.lineTo(tp.x, tp.y);
    }
    gctx.strokeStyle = `rgba(255,255,255,${al * 0.82})`;
    gctx.lineWidth = 1.3;
    gctx.stroke();
    // Head
    const hg = gctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9);
    hg.addColorStop(0, `rgba(255,255,255,${al})`);
    hg.addColorStop(0.4, `rgba(125,211,252,${al * 0.65})`);
    hg.addColorStop(1, "rgba(56,189,248,0)");
    gctx.fillStyle = hg;
    gctx.beginPath();
    gctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
    gctx.fill();
  });

  // ── Shooting stars ──
  STARS.forEach((s) => {
    const t = s.t;
    const la = s.la + (s.endLa - s.la) * t;
    const lo = s.lo + (s.endLo - s.lo) * t;
    const p = proj(la, lo, R, CX, CY);
    if (!p.vis) return;
    // tail
    const t0 = Math.max(0, t - 0.12);
    const la0 = s.la + (s.endLa - s.la) * t0,
      lo0 = s.lo + (s.endLo - s.lo) * t0;
    const p0 = proj(la0, lo0, R, CX, CY);
    const grad = gctx.createLinearGradient(p0.x, p0.y, p.x, p.y);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.4, `rgba(125,211,252,${s.life * 0.5})`);
    grad.addColorStop(1, `rgba(255,255,255,${s.life})`);
    gctx.beginPath();
    gctx.moveTo(p0.x, p0.y);
    gctx.lineTo(p.x, p.y);
    gctx.strokeStyle = grad;
    gctx.lineWidth = 2.5;
    gctx.stroke();
    // head glow
    const sg = gctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 7);
    sg.addColorStop(0, `rgba(255,255,255,${s.life})`);
    sg.addColorStop(1, "rgba(125,211,252,0)");
    gctx.fillStyle = sg;
    gctx.beginPath();
    gctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    gctx.fill();
  });

  // ── Ripples ──
  RIPPLES.forEach((rp) => {
    gctx.beginPath();
    gctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
    gctx.strokeStyle = `rgba(56,189,248,${rp.life * 0.7})`;
    gctx.lineWidth = 2;
    gctx.stroke();
    gctx.beginPath();
    gctx.arc(rp.x, rp.y, rp.r * 0.65, 0, Math.PI * 2);
    gctx.strokeStyle = `rgba(125,211,252,${rp.life * 0.45})`;
    gctx.lineWidth = 1;
    gctx.stroke();
  });

  // ── Nodes ──
  // Sort back-to-front for correct depth ordering
  const nodeOrder = [...NODE_DATA.keys()].sort((a, b) => {
    const pa = proj(NODE_DATA[a].lat, NODE_DATA[a].lng, R, CX, CY);
    const pb = proj(NODE_DATA[b].lat, NODE_DATA[b].lng, R, CX, CY);
    return pa.z - pb.z;
  });
  nodeOrder.forEach((i) => {
    const n = NODE_DATA[i];
    const p = proj(n.lat, n.lng, R, CX, CY);
    if (!p.vis || p.z < -0.05) return;
    const al = (p.z + 0.05) / 1.05;
    nodePulse[i] += nodePulseS[i];
    const blink = 0.5 + 0.5 * Math.sin(nodePulse[i]);
    const isHov = i === hoveredNode,
      isAct = i === activeNode;
    const base = n.type === "project" ? 10 : 7.5;
    const sz =
      (isAct ? base * 1.9 : isHov ? base * 1.5 : base) *
      (0.65 + p.depth * 0.55);

    // Outer ripple ring
    gctx.beginPath();
    gctx.arc(p.x, p.y, sz + 10 + blink * 12, 0, Math.PI * 2);
    gctx.strokeStyle = `rgba(56,189,248,${al * 0.16 * blink})`;
    gctx.lineWidth = 1.5;
    gctx.stroke();

    // Second ring
    gctx.beginPath();
    gctx.arc(p.x, p.y, sz + 5 + blink * 4, 0, Math.PI * 2);
    gctx.strokeStyle = `rgba(125,211,252,${al * (isHov || isAct ? 0.75 : 0.38)})`;
    gctx.lineWidth = 2;
    gctx.stroke();

    // Inner ring
    gctx.beginPath();
    gctx.arc(p.x, p.y, sz + 2, 0, Math.PI * 2);
    gctx.strokeStyle = `rgba(125,211,252,${al * 0.82})`;
    gctx.lineWidth = 1.5;
    gctx.stroke();

    // Glow
    const ng = gctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz + 8);
    ng.addColorStop(0, `rgba(255,255,255,${al * 0.95})`);
    ng.addColorStop(0.45, `rgba(56,189,248,${al * 0.7})`);
    ng.addColorStop(1, "rgba(0,80,200,0)");
    gctx.fillStyle = ng;
    gctx.beginPath();
    gctx.arc(p.x, p.y, sz + 8, 0, Math.PI * 2);
    gctx.fill();

    // Core
    gctx.beginPath();
    gctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
    gctx.fillStyle =
      n.type === "project"
        ? `rgba(56,189,248,${al})`
        : `rgba(125,211,252,${al})`;
    gctx.fill();

    // Bright center
    gctx.beginPath();
    gctx.arc(p.x, p.y, sz * 0.4, 0, Math.PI * 2);
    gctx.fillStyle = `rgba(255,255,255,${al})`;
    gctx.fill();
  });
}
drawGlobe();

// ── Globe position ──
function resizeGlobe(size) {
  gc.width = size;
  gc.height = size;
  gc.style.width = size + "px";
  gc.style.height = size + "px";
}
function setGlobePreloader() {
  const s = Math.round(Math.min(400, window.innerWidth * 0.85));
  resizeGlobe(s);
  gc.style.position = "fixed";
  gc.style.left = window.innerWidth / 2 - s / 2 + "px";
  gc.style.top = window.innerHeight / 2 - s / 2 + "px";
  gc.style.zIndex = "99995";
  gc.style.transition = "none";
  gc.style.opacity = "1";
  gc.style.pointerEvents = "none";
}
setGlobePreloader();

// ─── PRELOADER ───
const preBar = document.getElementById("preBar"),
  preCount = document.getElementById("preCount"),
  preStatus = document.getElementById("preStatus");
const preStats = [
  "CONNECTING...",
  "MAPPING NODES...",
  "SYNCING DATA...",
  "BUILDING UI...",
  "READY!",
];
let pct = 0;
const pInt = setInterval(() => {
  pct += Math.floor(Math.random() * 8) + 2;
  if (pct >= 100) {
    pct = 100;
    clearInterval(pInt);
    preStatus.textContent = "READY!";
    setTimeout(doTransition, 500);
  }
  preBar.style.width = pct + "%";
  preCount.textContent = String(pct).padStart(3, "0");
  preStatus.textContent = preStats[Math.min(4, Math.floor(pct / 25))];
}, 65);

function doTransition() {
  const pre = document.getElementById("preloader"),
    anchor = document.getElementById("heroGlobeAnchor");
  const pb = pre.querySelector(".pre-bottom");
  if (pb) {
    pb.style.transition = "opacity .4s";
    pb.style.opacity = "0";
  }
  setTimeout(() => {
    pre.style.transition = "opacity .65s";
    pre.style.opacity = "0";
    setTimeout(() => (pre.style.display = "none"), 700);
    const rect = anchor.getBoundingClientRect();
    const isMob = window.innerWidth <= 900;
    const ts = Math.round(
      isMob ? rect.height : Math.min(rect.width, rect.height),
    );
    const tl = rect.left + rect.width / 2 - ts / 2,
      tt = rect.top + rect.height / 2 - ts / 2;
    gc.style.transition =
      "left 1.1s cubic-bezier(.77,0,.18,1),top 1.1s cubic-bezier(.77,0,.18,1),width 1.1s cubic-bezier(.77,0,.18,1),height 1.1s cubic-bezier(.77,0,.18,1)";
    gc.style.left = tl + "px";
    gc.style.top = tt + "px";
    gc.style.width = ts + "px";
    gc.style.height = ts + "px";
    resizeGlobe(ts);
    setTimeout(() => {
      gc.style.transition = "none";
      gc.style.zIndex = "2";
      gc.style.pointerEvents = "all";
      anchor.classList.add("visible");
      function pin() {
        const r = anchor.getBoundingClientRect();
        const s = Math.min(r.width, r.height);
        gc.style.left = r.left + r.width / 2 - s / 2 + "px";
        gc.style.top = r.top + r.height / 2 - s / 2 + "px";
        if (gc.width !== Math.round(s)) resizeGlobe(Math.round(s));
      }
      window.addEventListener("scroll", pin, { passive: true });
      window.addEventListener("resize", pin);
      pin();
      initTyped();
    }, 1150);
  }, 120);
}
function initTyped() {
  new Typed("#typed-out", {
    strings: [
      "Creative Developer & UI Designer.",
      "AI Supervisor & Prompt Engineer.",
      "Building digital experiences that matter.",
    ],
    typeSpeed: 42,
    backSpeed: 20,
    backDelay: 2500,
    loop: true,
    showCursor: true,
    cursorChar: "_",
  });
}

// ─── NAV ───
const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const navOverlay = document.getElementById("navOverlay");

// 1. Scroll effect
if (navbar) {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
}

// 2. Hamburger menu
function openNav() {
  hamburger.classList.add("open");
  navLinks.classList.add("open");
  if (navOverlay) navOverlay.classList.add("active");
  hamburger.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}
function closeNav() {
  hamburger.classList.remove("open");
  navLinks.classList.remove("open");
  if (navOverlay) navOverlay.classList.remove("active");
  hamburger.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    if (navLinks.classList.contains("open")) closeNav();
    else openNav();
  });

  // Close when a nav link is clicked
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  // Close when overlay (backdrop) is clicked
  if (navOverlay) navOverlay.addEventListener("click", closeNav);

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) closeNav();
  });

  // Close if viewport resizes above mobile threshold
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && navLinks.classList.contains("open"))
      closeNav();
  });
}

// ─── SKILLS — Bento Grid ───
const SKILLS = {
  tech: [
    { icon: "code", name: "HTML5", pct: 92, tag: "Expert", size: "wide" },
    { icon: "palette", name: "CSS3", pct: 88, tag: "Advanced", size: "mid" },
    {
      icon: "zap",
      name: "JavaScript",
      pct: 75,
      tag: "Intermediate",
      size: "mid",
    },
    {
      icon: "monitor",
      name: "Responsive",
      pct: 90,
      tag: "Expert",
      size: "thin",
    },
    {
      icon: "git",
      name: "Git & GitHub",
      pct: 72,
      tag: "Intermediate",
      size: "thin",
    },
    {
      icon: "rocket",
      name: "Performance",
      pct: 80,
      tag: "Advanced",
      size: "thin",
    },
  ],
  design: [
    { icon: "pen", name: "UI Design", pct: 85, tag: "Advanced", size: "wide" },
    { icon: "layers", name: "Figma", pct: 78, tag: "Advanced", size: "mid" },
    {
      icon: "globe",
      name: "UX Thinking",
      pct: 82,
      tag: "Advanced",
      size: "mid",
    },
    {
      icon: "palette",
      name: "Color Theory",
      pct: 86,
      tag: "Advanced",
      size: "thin",
    },
    {
      icon: "code",
      name: "Motion Design",
      pct: 70,
      tag: "Intermediate",
      size: "thin",
    },
    {
      icon: "monitor",
      name: "Grid Systems",
      pct: 88,
      tag: "Advanced",
      size: "thin",
    },
  ],
  tools: [
    {
      icon: "cpu",
      name: "AI Supervision",
      pct: 90,
      tag: "Expert",
      size: "wide",
    },
    {
      icon: "terminal",
      name: "Prompt Eng.",
      pct: 88,
      tag: "Expert",
      size: "mid",
    },
    { icon: "tool", name: "VS Code", pct: 92, tag: "Expert", size: "mid" },
    {
      icon: "cloud",
      name: "GitHub Pages",
      pct: 85,
      tag: "Advanced",
      size: "thin",
    },
    {
      icon: "monitor",
      name: "Analytics",
      pct: 65,
      tag: "Intermediate",
      size: "thin",
    },
    {
      icon: "rocket",
      name: "SEO Basics",
      pct: 70,
      tag: "Intermediate",
      size: "thin",
    },
  ],
};

const SVG_ICONS = {
  code: `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`,
  palette: `<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>`,
  zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  monitor: `<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>`,
  git: `<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 012 2v7"/><line x1="6" y1="9" x2="6" y2="21"/>`,
  rocket: `<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>`,
  pen: `<line x1="18" y1="2" x2="22" y2="6"/><path d="M7.5 20.5L19 9l-4-4L3.5 16.5 2 22z"/>`,
  layers: `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
  globe: `<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>`,
  cpu: `<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>`,
  terminal: `<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>`,
  tool: `<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>`,
  cloud: `<path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>`,
};

function makeSVG(key, size = 22, col = "#38bdf8") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${SVG_ICONS[key] || SVG_ICONS.globe}</svg>`;
}

function levelLabel(pct) {
  if (pct >= 88) return "Expert";
  if (pct >= 75) return "Advanced";
  return "Intermediate";
}

function dotsFilled(pct) {
  const n = 5,
    filled = Math.round((pct / 100) * n);
  return Array.from(
    { length: n },
    (_, i) => `<span class="sk-dot ${i < filled ? "on" : ""}"></span>`,
  ).join("");
}

const skillsGrid = document.getElementById("skillsGrid");
let currentTab = "tech";

function renderSkills(tab) {
  currentTab = tab;
  skillsGrid.innerHTML = "";
  const data = SKILLS[tab];
  data.forEach((s, i) => {
    const isWide = s.size === "wide";
    const card = document.createElement("div");
    card.className = `skill-card sk-${s.size} reveal`;
    card.style.transitionDelay = i * 0.06 + "s";

    card.innerHTML = `
      <div class="sk-inner">
        ${isWide ? `<div class="sk-glow"></div>` : ""}
        <div class="sk-watermark">${s.pct}</div>
        <div>
          ${isWide ? `<div class="sk-tag"><span class="sk-tag-dot"></span>${s.tag}</div>` : ""}
          <div class="sk-icon-wrap">${makeSVG(s.icon, isWide ? 24 : 20)}</div>
          <div class="sk-name">${s.name}</div>
          ${isWide ? "" : `<div class="sk-level-dots">${dotsFilled(s.pct)}</div>`}
        </div>
        <div>
          <div class="sk-bar-wrap"><div class="sk-bar" data-pct="${s.pct / 100}"></div></div>
          <div class="sk-pct">
            <span class="sk-pct-val">${s.pct}%</span>
            ${isWide ? `<span class="sk-pct-label">${levelLabel(s.pct)}</span>` : ""}
          </div>
        </div>
      </div>`;
    skillsGrid.appendChild(card);
  });

  // Animate bars + reveal on next frame
  requestAnimationFrame(() => {
    document.querySelectorAll("#skillsGrid .reveal").forEach((el) => {
      el.classList.add("visible");
    });
    setTimeout(() => {
      document.querySelectorAll("#skillsGrid .sk-bar").forEach((bar) => {
        const pct = parseFloat(bar.dataset.pct);
        bar.style.transform = `scaleX(${pct})`;
        bar.classList.add("animated");
      });
    }, 120);
  });

  // Re-init skills canvas
  initSkillsCanvas();
}

// ── Skills section animated canvas (node network bg) ──
let skillsCanvasAF = null;
function initSkillsCanvas() {
  if (skillsCanvasAF) cancelAnimationFrame(skillsCanvasAF);
  const sc = document.getElementById("skillsCanvas");
  if (!sc) return;
  const sb = document.getElementById("skillsBody");
  if (!sb) return;
  sc.width = sb.offsetWidth;
  sc.height = sb.offsetHeight;
  const ctx = sc.getContext("2d");
  const W = sc.width,
    H = sc.height;

  // Spawn random nodes
  const nodes = Array.from({ length: 18 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: 1.5 + Math.random() * 1.5,
  }));

  function loopCanvas() {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56,189,248,0.35)";
      ctx.fill();
    });
    // Draw connections
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x,
          dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 160) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(56,189,248,${0.12 * (1 - d / 160)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    skillsCanvasAF = requestAnimationFrame(loopCanvas);
  }
  loopCanvas();
}

document.querySelectorAll(".skill-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".skill-tab")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderSkills(btn.dataset.tab);
  });
});
renderSkills("tech");

// ── Stats bar counter animation ──
const ssNums = document.querySelectorAll(".ssb-num[data-target]");
const ssObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target);
      let cur = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur;
        if (cur >= target) clearInterval(timer);
      }, 35);
      ssObs.unobserve(el);
    });
  },
  { threshold: 0.5 },
);
ssNums.forEach((n) => ssObs.observe(n));
// ─── SCROLL REVEAL ───
const revObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      e.target
        .querySelectorAll(".sk-bar")
        .forEach((b) => (b.style.transform = "scaleX(1)"));
    });
  },
  { threshold: 0.12 },
);
function obsAll() {
  document.querySelectorAll(".reveal").forEach((el) => revObs.observe(el));
}
obsAll();
new MutationObserver(obsAll).observe(skillsGrid, { childList: true });

// ─── IFRAME LAZY LOAD ───
document.querySelectorAll(".project-card[data-url]").forEach((card) => {
  const url = card.dataset.url,
    wrap = card.querySelector(".p-iframe-wrap"),
    sk = card.querySelector(".p-skeleton");
  let loaded = false;
  card.addEventListener("mouseenter", () => {
    if (loaded) return;
    loaded = true;
    const f = document.createElement("iframe");
    f.src = url;
    f.setAttribute("loading", "lazy");
    f.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");
    wrap.appendChild(f);
    f.addEventListener("load", () => {
      f.classList.add("loaded");
      if (sk) setTimeout(() => sk.classList.add("hidden"), 300);
    });
    setTimeout(() => {
      f.classList.add("loaded");
      if (sk) sk.classList.add("hidden");
    }, 4000);
  });
});

// ─── WA WIDGET ───
const waW = document.getElementById("waWidget"),
  waF = document.getElementById("waFab"),
  waC = document.getElementById("waClose");
setTimeout(() => waW.classList.add("open"), 3500);
waF.addEventListener("click", () => waW.classList.toggle("open"));
waC.addEventListener("click", () => waW.classList.remove("open"));

// ─── CONTACT FORM (Formspree) ───
(function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const btnTxt = form.querySelector(".cf-submit-txt");
  const btnLoad = form.querySelector(".cf-submit-loading");
  const btnDone = form.querySelector(".cf-submit-done");
  const submitBtn = document.getElementById("cfSubmit");
  const successMsg = document.getElementById("cfSuccess");
  const errorMsg = document.getElementById("cfError");

  function setSubmitState(state) {
    btnTxt.style.display = state === "idle" ? "flex" : "none";
    btnLoad.style.display = state === "loading" ? "flex" : "none";
    btnDone.style.display = state === "done" ? "flex" : "none";
    submitBtn.disabled = state !== "idle";
  }

  // Validate field on blur
  form.querySelectorAll(".cf-input").forEach(function (input) {
    input.addEventListener("blur", function () {
      if (input.required && !input.value.trim()) {
        input.classList.add("cf-invalid");
      } else if (
        input.type === "email" &&
        input.value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)
      ) {
        input.classList.add("cf-invalid");
      } else {
        input.classList.remove("cf-invalid");
      }
    });
    input.addEventListener("input", function () {
      input.classList.remove("cf-invalid");
    });
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Basic validation
    let valid = true;
    form.querySelectorAll(".cf-input[required]").forEach(function (input) {
      if (!input.value.trim()) {
        input.classList.add("cf-invalid");
        valid = false;
      }
    });
    const emailInput = form.querySelector('input[type="email"]');
    if (
      emailInput &&
      emailInput.value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)
    ) {
      emailInput.classList.add("cf-invalid");
      valid = false;
    }
    if (!valid) return;

    setSubmitState("loading");
    successMsg.style.display = "none";
    errorMsg.style.display = "none";

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setSubmitState("done");
        errorMsg.style.display = "none";
        successMsg.style.display = "flex";
        form.reset();
        // Reset button after 4s
        setTimeout(function () {
          setSubmitState("idle");
        }, 4000);
      } else {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Server error");
      }
    } catch (err) {
      setSubmitState("idle");
      successMsg.style.display = "none";
      errorMsg.style.display = "flex";
      console.error("Form error:", err);
    }
  });
})();

// ─── BACK TO TOP ───
(function () {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  window.addEventListener(
    "scroll",
    function () {
      btn.classList.toggle("visible", window.scrollY > 500);
    },
    { passive: true },
  );
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

// ─── ACTIVE NAV ON SCROLL ───
(function () {
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navAnchors.length) return;

  function setActive() {
    const navH = navbar ? navbar.offsetHeight : 64;
    const triggerY = navH + window.innerHeight * 0.15;
    let current = "";

    sections.forEach(function (sec) {
      const top = sec.getBoundingClientRect().top;
      if (top <= triggerY) current = sec.getAttribute("id");
    });

    navAnchors.forEach(function (link) {
      link.classList.remove("nav-active");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("nav-active");
      }
    });
  }

  window.addEventListener("scroll", setActive, { passive: true });
  setActive();
})();

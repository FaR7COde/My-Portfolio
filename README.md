# 🌐 FaR Portfolio — Muhamad Fadil

> **Creative Developer · AI Supervisor · UI Designer**  
> Personal portfolio website built with vanilla HTML, CSS & JavaScript — zero frameworks, zero dependencies (except Typed.js).

[![Live Demo](https://img.shields.io/badge/Live%20Demo-far7code.github.io-38bdf8?style=for-the-badge&logo=github)](https://far7code.github.io/)
[![License](https://img.shields.io/badge/License-MIT-a78bfa?style=for-the-badge)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 📸 Preview

```
┌──────────────────────────────────────────┐
│  MUFADIL                          [≡]    │
├──────────────────────────────────────────┤
│                                          │
│  ● Open to Work — Jakarta, Remote        │
│                                          │
│  MUHAMAD                  ┌─────────┐   │
│  FADIL.          [GLOBE]  │ 3D Node │   │
│                            └─────────┘   │
│  [ View Work ↗ ] [ Let's Talk → ] [CV]  │
│                                          │
│  3+ Years  ·  15+ Projects  ·  10+ Clients │
└──────────────────────────────────────────┘
```

---

## ✨ Features

### 🎨 UI / Visual
- **3D Interactive Globe** — Canvas 2D globe dengan 16 node data, drag-to-rotate, inertia physics, shooting stars, dan animated data packets
- **Custom Cursor** — Dot + trail cursor dengan blend-mode `difference`, hover expansion effect
- **Animated Preloader** — Loading bar dengan counter dan status text, kemudian globe bertransisi ke posisi hero
- **Particle Background** — 80 partikel floating + connection lines menggunakan Canvas 2D
- **Typed.js Integration** — Typewriter effect pada hero subtitle
- **Marquee Ticker** — Smooth infinite-scroll text ticker

### 🧩 Sections
| # | Section | Keterangan |
|---|---------|------------|
| 0 | **Hero** | Nama, tagline, tech badges, CTA buttons, live stats |
| 1 | **About** | Profile photo + animated corner frame, floating badges, personal bio |
| 2 | **Skills** | Bento grid layout dengan 3 tab (Tech / Design / Tools), progress bars, dot indicators |
| 3 | **Projects** | Browser mockup cards dengan lazy-loaded iframes, hover overlay, skeleton loader |
| 4 | **Services** | 4 service cards dengan icon & tag chips |
| 5 | **Contact** | Contact form (Formspree), terminal widget, WhatsApp widget |

### ⚙️ Functionality
- **Scroll Reveal** — IntersectionObserver-based fade-up animations
- **Active Nav Highlight** — Auto-highlight nav link sesuai section yang sedang terlihat
- **Responsive Hamburger Menu** — Slide-in mobile nav dengan backdrop overlay + Escape key support
- **Contact Form** — Integrasi Formspree dengan loading state, success & error handling
- **WhatsApp Widget** — Auto-open popup setelah 3.5 detik
- **Back to Top** — Muncul setelah scroll 500px
- **CV Download** — Direct download button untuk PDF CV

---

## 🏗️ Project Structure

```
far7code.github.io/
│
├── index.html          # Markup utama — semua section
├── style.css           # Styling global, komponen, responsive
├── script.js           # Semua JavaScript — globe, animasi, interaksi
│
└── assets/
    ├── main.jpeg       # Foto profil (About section)
    ├── emam.jpg        # OG image (social media preview)
    ├── logo.jpg        # Favicon
    ├── whatsapp.jpeg   # Avatar WhatsApp widget
    └── CV-Muhamad-Fadil.pdf  # File CV untuk download
```

---

## 🛠️ Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| **HTML5** | Struktur semantik, SEO meta tags, Open Graph |
| **CSS3** | Custom properties, Grid, Flexbox, animasi, responsive |
| **Vanilla JavaScript (ES6+)** | DOM manipulation, Canvas 2D, async/await, IntersectionObserver |
| **Canvas 2D API** | 3D globe rendering, particle background, skills canvas |
| **Typed.js** | Typewriter animation (CDN) |
| **Formspree** | Form submission backend (no server required) |
| **Google Fonts** | Space Mono, Bebas Neue, DM Sans |
| **GitHub Pages** | Static hosting & deployment |

> ⚡ **Zero build tools. Zero frameworks. Zero bundlers.**  
> Pure HTML/CSS/JS — buka browser, langsung jalan.

---

## 🌍 3D Globe — Technical Deep Dive

Globe adalah komponen paling kompleks di project ini. Dibangun sepenuhnya dengan Canvas 2D (bukan WebGL).

### Arsitektur Globe

```
┌──────────────────────────────────┐
│          GLOBE ENGINE            │
│                                  │
│  proj(lat, lng, R, CX, CY)      │  ← Proyeksi 3D → 2D dengan perspective divide
│  slerp(la1,lo1, la2,lo2, steps) │  ← Spherical linear interpolation untuk arc
│                                  │
│  ┌────────────────────────────┐  │
│  │     DRAW LAYERS (order):   │  │
│  │  1. Deep glow radials      │  │
│  │  2. Atmosphere ring        │  │
│  │  3. Sphere shading         │  │
│  │  4. Globe outline          │  │
│  │  5. Latitude ellipses      │  │
│  │  6. Meridian lines         │  │
│  │  7. Grid dots (1000+)      │  │
│  │  8. Static arcs (dashed)   │  │
│  │  9. Dynamic arcs (fade)    │  │
│  │  10. Data packets (trail)  │  │
│  │  11. Shooting stars        │  │
│  │  12. Click ripples         │  │
│  │  13. Nodes (depth-sorted)  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### Projection Formula
```javascript
// Koordinat spherical → 3D Cartesian → Rotasi → Perspective divide → 2D screen
function proj(lat, lng, R, CX, CY) {
  const x3 = cos(lat) * sin(lng + rotY);
  const y4 = sin(lat) * cos(rotX) - cos(lat)*cos(lng+rotY) * sin(rotX);
  const z4 = sin(lat) * sin(rotX) + cos(lat)*cos(lng+rotY) * cos(rotX);
  const scale = fov / (fov + z4 + 1.0); // perspective divide
  return { x: CX + x3 * R * scale, y: CY - y4 * R * scale, z: z4 };
}
```

### Interaksi
- **Drag** → update `rotY` / `rotX` dengan inertia (`velY *= 0.993`)
- **Hover node** → popup muncul otomatis
- **Click node** → popup sticky + ripple effect
- **Mouse parallax** → `tiltX` / `tiltY` smooth lerp (55ms)

---

## 🚀 Getting Started

### Prerequisites
- Browser modern (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Tidak perlu Node.js, NPM, atau build tool apapun

### Clone & Run

```bash
# Clone repository
git clone https://github.com/FaR7COde/FaR7COde.github.io.git

# Masuk ke folder
cd FaR7COde.github.io

# Buka di browser — bisa langsung dobel klik index.html
# Atau pakai live server untuk pengalaman terbaik:
npx serve .
# atau
python -m http.server 8000
```

Buka `http://localhost:8000` di browser.

---

## 🎛️ Konfigurasi

### Ganti Data Personal
Edit bagian berikut di `index.html`:

```html
<!-- Nama, tagline, availability status -->
<h1 class="hero-name">MUHAMAD<br /><span class="outline">FADIL</span></h1>

<!-- Stats -->
<span class="hs-num">3+</span> <!-- Years Exp -->
<span class="hs-num">15+</span> <!-- Projects -->
<span class="hs-num">10+</span> <!-- Clients -->
```

### Ganti Data Kontak
```html
<!-- Email -->
<a href="mailto:YOUR_EMAIL@gmail.com">

<!-- WhatsApp (format: 62xxxxxxxxxx) -->
<a href="https://wa.me/62XXXXXXXXXX">

<!-- Formspree endpoint -->
<form action="https://formspree.io/f/YOUR_FORM_ID">
```

### Tambah Project di Globe
Edit array `NODE_DATA` di `script.js`:

```javascript
const NODE_DATA = [
  {
    lat: 0.7,          // latitude dalam radian
    lng: 0.3,          // longitude dalam radian  
    label: "Nama Project",
    type: "project",   // "project" atau "skill"
    icon: "globe",     // key dari objek ICONS
    desc: "Deskripsi singkat project kamu.",
    link: "https://your-project-url.com",
  },
  // ...
];
```

### Tambah Skill di Bento Grid
Edit objek `SKILLS` di `script.js`:

```javascript
const SKILLS = {
  tech: [
    { icon: "code", name: "Nama Skill", pct: 85, tag: "Advanced", size: "wide" },
    // size: "wide" (4 col × 2 row) | "mid" (4 col × 1 row) | "thin" (3 col × 1 row)
  ],
};
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| `> 900px` | Desktop — hero split (text + globe), skills 12-col bento, projects 2-col |
| `481px – 900px` | Tablet — stacked hero, globe di atas, skills 3-col, projects 1-col |
| `< 480px` | Mobile — compact hero, globe strip, skills 2-col, custom cursor dinonaktifkan |

---

## ⚡ Performance

- **Lazy iframe loading** — project preview hanya load saat hover
- **IntersectionObserver** — animasi hanya jalan saat elemen terlihat
- **requestAnimationFrame** — semua loop animasi menggunakan rAF
- **CSS `will-change`** — implicit melalui transform/opacity transitions
- **Passive event listeners** — `scroll`, `touchstart`, `touchmove`

---

## 🤝 Kontribusi

Pull request sangat diterima. Untuk perubahan besar, buka issue terlebih dahulu untuk mendiskusikan apa yang ingin diubah.

1. Fork repository ini
2. Buat feature branch: `git checkout -b feature/NamaFitur`
3. Commit perubahan: `git commit -m 'feat: tambah NamaFitur'`
4. Push ke branch: `git push origin feature/NamaFitur`
5. Buka Pull Request

---

## 📄 Lisensi

Didistribusikan di bawah lisensi **MIT**. Lihat `LICENSE` untuk informasi lebih lanjut.

---

## 📬 Kontak

**Muhamad Fadil**

[![Email](https://img.shields.io/badge/Email-muhammadfadhil1019%40gmail.com-38bdf8?style=flat-square&logo=gmail)](mailto:muhammadfadhil1019@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-muhamad--fadil-0077B5?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/muhamad-fadil-444ba8394/)
[![GitHub](https://img.shields.io/badge/GitHub-FaR7COde-181717?style=flat-square&logo=github)](https://github.com/FaR7COde)
[![Instagram](https://img.shields.io/badge/Instagram-soft.pdil-E4405F?style=flat-square&logo=instagram)](https://www.instagram.com/soft.pdil/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Chat-25D366?style=flat-square&logo=whatsapp)](https://wa.me/6281210333463)

---

<div align="center">

**⭐ Kalau project ini bermanfaat, jangan lupa kasih star ya! ⭐**

*Crafted with ❤️ by Muhamad Fadil — © 2026 All rights reserved*

</div>

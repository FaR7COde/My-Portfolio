document.addEventListener("DOMContentLoaded", () => {
  // PRELOADER
  const preloader = document.getElementById("preloader");
  const loadBar = document.getElementById("load-bar");
  const loadPc = document.getElementById("load-pc");
  const shuffleEl = document.getElementById("shuffle-text");

  const phrases = ["INITIATING", "DESIGNING", "CODING", "OPTIMIZING", "READY"];
  let count = 0;

  const shuffleInterval = setInterval(() => {
    shuffleEl.innerText = phrases[Math.floor(Math.random() * phrases.length)];
  }, 140);

  const loadInterval = setInterval(() => {
    count += Math.floor(Math.random() * 10) + 1;
    if (count >= 100) {
      count = 100;
      clearInterval(loadInterval);
      clearInterval(shuffleInterval);
      shuffleEl.innerText = "WELCOME";
      setTimeout(() => {
        preloader.classList.add("hide");
        document.getElementById("home").classList.add("active");
        initTyped();
      }, 800);
    }
    loadBar.style.width = count + "%";
    loadPc.innerHTML = count < 10 ? "0" + count : count;
  }, 75);

  // TYPED.JS
  function initTyped() {
    const el = document.getElementById("typed-output");
    if (!el) return;
    new Typed("#typed-output", {
      strings: [
        "Membangun harmoni antara estetika minimalis dan kode yang sangat presisi.",
        "Turning ideas into beautiful, functional digital experiences.",
        "Creative Developer · AI Supervisor · UI Designer.",
      ],
      typeSpeed: 38,
      backSpeed: 18,
      backDelay: 2400,
      loop: true,
      showCursor: true,
      cursorChar: "|",
    });
  }

  // CUSTOM CURSOR
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  let mouseX = 0,
    mouseY = 0;
  let ringX = 0,
    ringY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + "px";
    dot.style.top = mouseY + "px";
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + "px";
    ring.style.top = ringY + "px";
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document
    .querySelectorAll(
      "a, button, .social-tag, .marquee-item, .role-card, .skill-card",
    )
    .forEach((el) => {
      el.addEventListener("mouseenter", () =>
        document.body.classList.add("cursor-hover"),
      );
      el.addEventListener("mouseleave", () =>
        document.body.classList.remove("cursor-hover"),
      );
    });

  document.addEventListener("mouseleave", () => {
    dot.style.opacity = "0";
    ring.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    dot.style.opacity = "1";
    ring.style.opacity = "1";
  });

  // REVEAL ON SCROLL
  const revealObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("active");
      }),
    { threshold: 0.13 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((el) => revealObserver.observe(el));

  // WORD 3D FLIP REVEAL — repeat on every scroll into view
  const wordRevealObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const words = e.target.querySelectorAll(".glitch-word");
          // Reset dulu biar bisa replay
          words.forEach((w) => {
            w.classList.remove("word-revealed");
            w.style.animation = "none";
            void w.offsetWidth; // reflow
            w.style.animation = "";
          });
          // Trigger flip per kata dengan stagger
          words.forEach((word, i) => {
            setTimeout(() => {
              word.classList.add("word-revealed");
            }, i * 120);
          });
        }
      }),
    { threshold: 0.3 },
  );
  document
    .querySelectorAll(".glitch-title")
    .forEach((el) => wordRevealObserver.observe(el));

  // COUNTER STATS
  function countUp(el, target, duration = 1600) {
    let start = 0;
    const step = target / (duration / 16);
    const run = () => {
      start += step;
      if (start < target) {
        el.innerText = Math.floor(start) + "+";
        requestAnimationFrame(run);
      } else {
        el.innerText = target + "+";
      }
    };
    run();
  }
  const statObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".stat-item h3").forEach((el) => {
            const val = parseInt(
              el.getAttribute("data-target") || el.innerText,
            );
            if (!isNaN(val)) countUp(el, val);
          });
          statObserver.unobserve(e.target);
        }
      }),
    { threshold: 0.5 },
  );
  document
    .querySelectorAll(".experience-stats")
    .forEach((el) => statObserver.observe(el));

  // SKILL BAR ANIMATION
  const skillObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("bar-animated");
      }),
    { threshold: 0.3 },
  );
  document
    .querySelectorAll(".skill-card")
    .forEach((c) => skillObserver.observe(c));

  // MAGNETIC BUTTON
  const magBtn = document.querySelector(".magnetic-btn");
  if (window.innerWidth > 768 && magBtn) {
    window.addEventListener("mousemove", (e) => {
      if (magBtn.dataset.frozen) return;
      const rect = magBtn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      if (Math.hypot(x, y) < 200) {
        magBtn.style.transform = `translate(${x * 0.38}px, ${y * 0.38}px)`;
      } else {
        magBtn.style.transform = "translate(0,0)";
      }
    });
  }

  // PARALLAX ORBS
  const orb1 = document.querySelector(".orb-1");
  const orb2 = document.querySelector(".orb-2");
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const s = window.scrollY;
        if (orb1)
          orb1.style.transform = `translate(${s * 0.04}px, ${s * 0.03}px)`;
        if (orb2)
          orb2.style.transform = `translate(${-s * 0.02}px, ${s * 0.035}px)`;
        ticking = false;
      });
      ticking = true;
    }
  });

  // PARTICLE NETWORK BACKGROUND
  const canvas = document.getElementById("particle-network");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let W,
      H,
      particles = [];
    let mx = -999,
      my = -999;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    function initParticles() {
      particles = [];
      const count = Math.min(70, Math.floor((W * H) / 14000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.8 + 0.8,
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        else if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        else if (p.y > H) p.y = 0;
      }
      ctx.fillStyle = "rgba(0,122,255,0.45)";
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(0,122,255,0.1)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x,
            dy = particles[i].y - particles[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      if (mx > 0) {
        ctx.strokeStyle = "rgba(0,122,255,0.2)";
        for (const p of particles) {
          const dx = p.x - mx,
            dy = p.y - my;
          if (Math.sqrt(dx * dx + dy * dy) < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    });
    resize();
    initParticles();
    draw();
  }

  // ========== 3D PERSPECTIVE TILT EFFECT (FIXED) ==========
  const tiltCards = document.querySelectorAll(".p-card");
  if (tiltCards.length) {
    tiltCards.forEach((card) => {
      let rect = card.getBoundingClientRect();
      let active = false;

      const updateRect = () => {
        rect = card.getBoundingClientRect();
      };

      const onMouseMove = (e) => {
        if (!active) return;
        updateRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const relX = mouseX / rect.width;
        const relY = mouseY / rect.height;
        const maxRotate = 12;
        const rotY = (relX - 0.5) * maxRotate;
        const rotX = (0.5 - relY) * maxRotate;
        const scaleVal = 1.02;
        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scaleVal})`;
        card.style.transition = "transform 0.1s ease-out";
        card.classList.add("tilt-active");
      };

      const onMouseLeave = () => {
        active = false;
        card.style.transform = "";
        card.style.transition = "transform 0.3s ease";
        card.classList.remove("tilt-active");
      };

      const onMouseEnter = () => {
        active = true;
        updateRect();
      };

      card.addEventListener("mouseenter", onMouseEnter);
      card.addEventListener("mousemove", onMouseMove);
      card.addEventListener("mouseleave", onMouseLeave);

      window.addEventListener("resize", () => {
        if (card.matches(":hover")) updateRect();
      });
    });
    console.log("3D Tilt effect enabled on", tiltCards.length, "project cards");
  } else {
    console.warn("No .p-card elements found for tilt effect");
  }

  // ========== LAZY IFRAME INJECTION ON HOVER ==========
  document.querySelectorAll(".p-preview-wrap[data-src]").forEach((wrap) => {
    let loaded = false;
    const card = wrap.closest(".p-card");
    card.addEventListener("mouseenter", () => {
      if (loaded) return;
      loaded = true;
      const iframe = document.createElement("iframe");
      iframe.src = wrap.dataset.src;
      iframe.className = "p-preview-frame";
      iframe.tabIndex = -1;
      iframe.setAttribute("loading", "lazy");
      wrap.appendChild(iframe);
    });
  });

  // ========== DARK MODE TOGGLE ==========
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Load saved preference
  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      localStorage.setItem(
        "theme",
        body.classList.contains("dark-mode") ? "dark" : "light",
      );
      // Rebuild radar with updated colors
      if (window._radarChart) {
        updateRadarColors();
      }
    });
  }

  // ========== RADAR CHART ==========
  const radarEl = document.getElementById("skillRadar");
  if (radarEl && typeof Chart !== "undefined") {
    const getRadarColors = () => {
      const isDark = body.classList.contains("dark-mode");
      return {
        gridColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
        tickColor: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
        labelColor: isDark ? "#c0c8e0" : "#444",
      };
    };

    const radarData = {
      labels: [
        "HTML & CSS",
        "JavaScript",
        "UI Design",
        "PHP",
        "Git",
        "Performance",
      ],
      datasets: [
        {
          label: "Skill Level",
          data: [95, 80, 85, 70, 75, 78],
          backgroundColor: "rgba(0, 122, 255, 0.15)",
          borderColor: "#007aff",
          borderWidth: 2,
          pointBackgroundColor: "#007aff",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };

    const buildRadarConfig = () => {
      const c = getRadarColors();
      return {
        type: "radar",
        data: radarData,
        options: {
          responsive: true,
          animation: { duration: 1200, easing: "easeInOutQuart" },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(0,0,0,0.8)",
              titleFont: { family: "Syne", weight: "800" },
              bodyFont: { family: "Plus Jakarta Sans" },
              padding: 12,
              cornerRadius: 10,
            },
          },
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: {
                stepSize: 25,
                color: c.tickColor,
                font: { size: 10, family: "Plus Jakarta Sans" },
                backdropColor: "transparent",
              },
              grid: { color: c.gridColor },
              angleLines: { color: c.gridColor },
              pointLabels: {
                color: c.labelColor,
                font: { size: 12, family: "Syne", weight: "700" },
              },
            },
          },
        },
      };
    };

    window._radarChart = new Chart(radarEl, buildRadarConfig());

    window.updateRadarColors = () => {
      const c = getRadarColors();
      const chart = window._radarChart;
      chart.options.scales.r.ticks.color = c.tickColor;
      chart.options.scales.r.grid.color = c.gridColor;
      chart.options.scales.r.angleLines.color = c.gridColor;
      chart.options.scales.r.pointLabels.color = c.labelColor;
      chart.update();
    };

    // Animate radar on scroll
    const radarObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            window._radarChart.update();
            radarObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 },
    );
    radarObserver.observe(radarEl);
  }

  // ========== WHATSAPP WIDGET ==========
  const waFab = document.getElementById("wa-fab");
  const waBubble = document.getElementById("wa-bubble");
  const waClose = document.getElementById("wa-close");

  if (waFab && waBubble) {
    waFab.addEventListener("click", () => {
      waBubble.classList.toggle("open");
      // hide notif badge
      const notif = waFab.querySelector(".wa-notif");
      if (notif) notif.style.display = "none";
    });

    if (waClose) {
      waClose.addEventListener("click", (e) => {
        e.stopPropagation();
        waBubble.classList.remove("open");
      });
    }

    // Add to cursor hover targets
    [waFab, waBubble].forEach((el) => {
      el.addEventListener("mouseenter", () =>
        body.classList.add("cursor-hover"),
      );
      el.addEventListener("mouseleave", () =>
        body.classList.remove("cursor-hover"),
      );
    });
  }

  // ========== RIPPLE EFFECT ==========
  function addRipple(btn) {
    btn.addEventListener("click", function (e) {
      const circle = document.createElement("span");
      circle.classList.add("ripple-wave");
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      circle.style.width = circle.style.height = size + "px";
      circle.style.left = e.clientX - rect.left - size / 2 + "px";
      circle.style.top = e.clientY - rect.top - size / 2 + "px";
      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 700);
    });
  }

  document
    .querySelectorAll(".ripple-btn, .magnetic-btn, .explore-btn, .nav-btn")
    .forEach(addRipple);

  // ========== SMOOTH SCROLL MAGNETIC ON ALL NAV LINKS ==========
  document.querySelectorAll(".nav-item").forEach((link) => {
    link.addEventListener("mousemove", function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      this.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    link.addEventListener("mouseleave", function () {
      this.style.transform = "translate(0,0)";
      this.style.transition = "transform 0.4s ease";
    });
    link.addEventListener("mouseenter", function () {
      this.style.transition = "transform 0.1s ease-out";
    });
  });

  // ========== BTN-ICON EYES FOLLOW CURSOR ==========
  const pupilLeft = document.getElementById("pupil-left");
  const pupilRight = document.getElementById("pupil-right");

  function moveEye(pupil, eyeEl) {
    const eyeRect = eyeEl.getBoundingClientRect();
    const cx = eyeRect.left + eyeRect.width / 2;
    const cy = eyeRect.top + eyeRect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxMove = 5;
    const ratio = Math.min(dist, 60) / 60;
    const ex = (dx / dist || 0) * maxMove * ratio;
    const ey = (dy / dist || 0) * maxMove * ratio;
    pupil.style.transform = `translate(${ex}px, ${ey}px)`;
  }

  window.addEventListener("mousemove", (e) => {
    if (pupilLeft && pupilRight) {
      const eyes = document.querySelectorAll(".btn-eye");
      if (eyes[0]) moveEye(pupilLeft, eyes[0]);
      if (eyes[1]) moveEye(pupilRight, eyes[1]);
    }
  });

  // ========== BTN-ICON "HI" CLICK ANIMATION ==========
  const btnIcon = document.getElementById("btn-icon");
  const emojis = ["👋", "✉️", "💙", "⚡", "🚀", "✨", "🎯"];

  if (btnIcon) {
    btnIcon.addEventListener("click", function (e) {
      e.preventDefault();

      // Blink eyes
      document.querySelectorAll(".btn-eye").forEach((eye) => {
        eye.style.transform = "scaleY(0.1)";
        setTimeout(() => {
          eye.style.transform = "";
        }, 150);
      });

      // Burst animation
      btnIcon.classList.remove("clicked");
      void btnIcon.offsetWidth;
      btnIcon.classList.add("clicked");

      // Multiple ripple rings with stagger
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const ring = document.createElement("span");
          ring.classList.add("ring-burst");
          btnIcon.appendChild(ring);
          ring.addEventListener("animationend", () => ring.remove());
        }, i * 120);
      }

      // Emoji burst in random directions
      const count = 6;
      for (let i = 0; i < count; i++) {
        const emoji = document.createElement("span");
        emoji.classList.add("emoji-pop");
        emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        const angle = (360 / count) * i + Math.random() * 30;
        const dist = 70 + Math.random() * 40;
        const rad = (angle * Math.PI) / 180;
        emoji.style.setProperty("--tx", `${Math.cos(rad) * dist}px`);
        emoji.style.setProperty("--ty", `${Math.sin(rad) * dist}px`);
        emoji.style.left = "50%";
        emoji.style.top = "50%";
        emoji.style.animationDelay = `${i * 40}ms`;
        btnIcon.appendChild(emoji);
        emoji.addEventListener("animationend", () => emoji.remove());
      }

      // Navigate after animation finishes
      setTimeout(() => {
        window.location.href = "mailto:muhammadfadhil1019@gmail.com";
      }, 500);
    });

    btnIcon.addEventListener("animationend", () => {
      btnIcon.classList.remove("clicked");
    });
  }
});

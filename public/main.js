// THEME persistence
(function () {
  var root = document.documentElement;
  var sel = document.getElementById("theme-select");
  var m = document.cookie.match(/theme=([^;]+)/);
  var saved = localStorage.getItem("theme") || (m ? m[1] : "neon");
  root.setAttribute("data-theme", saved);
  if (sel) sel.value = saved;
  function apply(t) {
    root.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
    try {
      fetch("/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: t }),
      });
    } catch (e) {}
  }
  if (sel)
    sel.addEventListener("change", function (e) {
      apply(e.target.value);
    });
})();

// Stars background (random twinkles)
(function () {
  var screen = document.querySelector(".scene");
  if (!screen) return;
  for (let i = 0; i < 80; i++) {
    var s = document.createElement("div");
    s.className = "star";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 60 + "%";
    s.style.animationDelay = Math.random() * 3 + "s";
    screen.appendChild(s);
  }
})();

// Retro bleeps with WebAudio (no assets required)
const AudioFX = (function () {
  let ctx;
  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  function bleep(freq = 880, dur = 0.07, type = "square", gain = 0.04) {
    ensure();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
    }, dur * 1000);
  }
  return { bleep };
})();

// Hover/Click sounds for buttons & links
(function () {
  function attach(el) {
    el.addEventListener("mouseenter", () =>
      AudioFX.bleep(1200, 0.04, "square", 0.03)
    );
    el.addEventListener("click", () =>
      AudioFX.bleep(620, 0.08, "square", 0.05)
    );
  }
  document
    .querySelectorAll("a,.btn-8,.badge,.btn-start,button,input,select")
    .forEach(attach);
  // Observer for dynamic elements
  const obs = new MutationObserver((muts) => {
    muts.forEach((m) => {
      m.addedNodes &&
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (
            n.matches &&
            n.matches("a,.btn-8,.badge,.btn-start,button,input,select")
          )
            attach(n);
          n.querySelectorAll &&
            n
              .querySelectorAll(
                "a,.btn-8,.badge,.btn-start,button,input,select"
              )
              .forEach(attach);
        });
    });
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();

// Bracket SVG wires
(function () {
  var wrap = document.querySelector(".bracket-wrap");
  var svg = document.getElementById("bracketLines");
  if (!wrap || !svg) return;
  var matches = Array.from(wrap.querySelectorAll(".match"));
  var byId = new Map(
    matches.map(function (m) {
      return [m.dataset.id, m];
    })
  );
  function draw() {
    var rect = wrap.getBoundingClientRect();
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    matches.forEach(function (m) {
      var nextId = m.dataset.next;
      if (!nextId) return;
      var target = byId.get(nextId);
      if (!target) return;
      var a = m.getBoundingClientRect();
      var b = target.getBoundingClientRect();
      var x1 = a.right - rect.left,
        y1 = a.top + a.height / 2 - rect.top;
      var x2 = b.left - rect.left,
        y2 = b.top + b.height / 2 - rect.top;
      var mid = x1 + (x2 - x1) * 0.5;
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute(
        "d",
        "M " + x1 + " " + y1 + " H " + mid + " V " + y2 + " H " + x2
      );
      path.setAttribute("class", "line");
      svg.appendChild(path);
    });
  }
  window.addEventListener("resize", draw);
  new ResizeObserver(draw).observe(wrap);
  setTimeout(draw, 60);
})();

// Navbar responsive
(function () {
  var btn = document.getElementById("navToggle");
  var bar = document.querySelector(".nav");
  var links = document.getElementById("navLinks");
  if (!btn || !links || !bar) return;
  btn.addEventListener("click", function () {
    bar.classList.toggle("open");
  });
})();

// Menu thèmes (icône gear)
(function () {
  var btn = document.getElementById("themeBtn");
  var menu = document.getElementById("themeMenu");
  if (!btn || !menu) return;
  btn.addEventListener("click", () => {
    menu.style.display =
      menu.style.display === "none" || !menu.style.display ? "block" : "none";
  });
  menu.querySelectorAll("button[data-theme]").forEach((b) => {
    b.addEventListener("click", () => {
      var t = b.getAttribute("data-theme");
      document.documentElement.setAttribute("data-theme", t);
      localStorage.setItem("theme", t);
      try {
        fetch("/theme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: t }),
        });
      } catch (e) {}
      menu.style.display = "none";
    });
  });
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== btn)
      menu.style.display = "none";
  });
})();

// PATCH_UI_EMU_V1 — retiré: doublons Navbar/Thèmes (déjà gérés plus haut)

// Toggle Favori via fetch (étoile)
(function () {
  document.addEventListener("click", async (e) => {
    var btn = e.target.closest("[data-fav]");
    if (!btn) return;
    e.preventDefault();
    var id = btn.getAttribute("data-fav");
    try {
      const res = await fetch("/info/" + id + "/favorite", {
        method: "POST",
        headers: { "X-Requested-With": "fetch" },
      });
      if (res.ok) {
        btn.classList.toggle("on");
        if (typeof AudioFX !== "undefined") {
          AudioFX.bleep(
            btn.classList.contains("on") ? 1200 : 600,
            0.08,
            "square",
            0.05
          );
        }
      }
    } catch (err) {}
  });
})();

// Filtres Games (arcade hub) par data-attrs
(function () {
  var deck = document.querySelectorAll(".console-card");
  var form = document.querySelector("form[data-arcade-filters]");
  if (!form || !deck.length) return;
  function apply() {
    var brand = form.brand.value || "",
      year = form.year.value || "",
      fav = form.fav.value || "";
    deck.forEach(function (card) {
      var hide = 0;
      if (brand && card.getAttribute("data-brand") !== brand) hide = 1;
      if (year && card.getAttribute("data-era") !== year) hide = 1;
      if (fav === "1" && card.getAttribute("data-fav") !== "1") hide = 1;
      card.setAttribute("data-hide", hide ? "1" : "0");
    });
  }
  form.addEventListener("change", apply);
  apply();
})();

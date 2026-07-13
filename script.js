// --- Theme toggle: light/dark, persisted ---
(function () {
  const btn = document.querySelector("[data-theme-toggle]");
  if (!btn) return;
  let saved = "dark";
  try { saved = localStorage.getItem("site-theme") || "dark"; } catch (e) { /* ignore */ }
  if (saved === "light") document.documentElement.setAttribute("data-theme", "light");

  btn.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (isLight) {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
    try { localStorage.setItem("site-theme", isLight ? "dark" : "light"); } catch (e) { /* ignore */ }
  });
})();

// --- Copy-to-clipboard buttons (email / phone) ---
(function () {
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
      } catch (e) {
        // Fallback for older browsers
        const ta = document.createElement("textarea");
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      const original = btn.textContent;
      btn.textContent = "✓";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1400);
    });
  });
})();

// --- Code window "available" field: click to toggle, updates hero status ---
(function () {
  const toggle = document.querySelector("[data-available-toggle]");
  const dot = document.querySelector(".status-dot");
  if (!toggle) return;

  function setAvailable(isAvailable) {
    toggle.textContent = isAvailable ? "true" : "false";
    toggle.classList.toggle("is-false", !isAvailable);
    if (dot) dot.style.background = isAvailable ? "#7ec98f" : "#e5605a";
    if (dot) dot.style.boxShadow = isAvailable
      ? "0 0 8px rgba(126,201,143,0.8)"
      : "0 0 8px rgba(229,96,90,0.8)";
  }

  toggle.addEventListener("click", () => setAvailable(toggle.textContent.trim() !== "true"));
  toggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setAvailable(toggle.textContent.trim() !== "true");
    }
  });
})();

// --- Typed status line: cycles through short lines, typing/erasing ---
(function () {
  const el = document.querySelector("[data-typed]");
  if (!el) return;
  const lines = [
    "available for freelance work",
    "replies within a day or two",
    "based in Tirana, Albania"
  ];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) { el.textContent = lines[0]; return; }
  let li = 0, ci = 0, deleting = false;

  function tick() {
    const full = lines[li];
    if (!deleting) {
      ci++;
      el.textContent = full.slice(0, ci);
      if (ci === full.length) { deleting = true; setTimeout(tick, 1800); return; }
      setTimeout(tick, 45);
    } else {
      ci--;
      el.textContent = full.slice(0, ci);
      if (ci === 0) { deleting = false; li = (li + 1) % lines.length; setTimeout(tick, 300); return; }
      setTimeout(tick, 25);
    }
  }
  tick();
})();

// --- Scroll progress bar ---
(function () {
  const bar = document.querySelector(".scroll-progress");
  if (!bar) return;
  function update() {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + "%";
  }
  document.addEventListener("scroll", update, { passive: true });
  update();
})();

// --- Cursor spotlight: soft light that follows the pointer across the page ---
(function () {
  if (window.matchMedia("(max-width: 760px)").matches) return;
  const el = document.querySelector(".cursor-spotlight");
  if (!el) return;
  window.addEventListener("pointermove", (e) => {
    el.style.setProperty("--sx", e.clientX + "px");
    el.style.setProperty("--sy", e.clientY + "px");
  });
})();

// --- Card tilt: project cards & price cards tilt toward the cursor ---
(function () {
  if (window.matchMedia("(max-width: 760px)").matches) return;
  document.querySelectorAll(".project").forEach((card) => {
    const img = card.querySelector(".project-preview");
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--rx", (x * 3).toFixed(2) + "deg");
      card.style.setProperty("--ry", (-y * 3).toFixed(2) + "deg");
      if (img) {
        const irect = img.getBoundingClientRect();
        img.style.setProperty("--mx", ((e.clientX - irect.left) / irect.width) * 100 + "%");
        img.style.setProperty("--my", ((e.clientY - irect.top) / irect.height) * 100 + "%");
      }
    });
    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
})();

// Entrance animations (GSAP + ScrollTrigger) plus JS-controlled section
// snapping (GSAP + ScrollToPlugin) so the transition speed between full
// sections is explicit and adjustable — native CSS scroll-snap has no
// duration control, this does.

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 760px)").matches;

if (!prefersReducedMotion && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".eyebrow", { opacity: 0, y: 16, duration: 0.6 })
    .from(".hero-title", { opacity: 0, y: 24, duration: 0.8 }, "-=0.4")
    .from(".hero-sub", { opacity: 0, y: 20, duration: 0.7 }, "-=0.5")
    .from(".hero-actions a", { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 }, "-=0.4");

  function revealGroup(selector, opts = {}) {
    const items = gsap.utils.toArray(selector);
    if (!items.length) return;

    items.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 32, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          delay: (opts.stagger || 0) * i,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    });
  }

  revealGroup(".project", { stagger: 0.12 });
  revealGroup(".price-card", { stagger: 0.12 });
  revealGroup(".process-step", { stagger: 0.1 });
  revealGroup(".contact-grid");
  revealGroup(".service");

  gsap.utils.toArray(".section-title").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, x: -24 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none none"
        }
      }
    );
  });
}

// --- Parallax: as each section scrolls through the viewport, its inner
// content moves opposite to the scroll direction (classic depth effect).
// Native CSS scroll-snap (see style.css) handles the section-to-section
// snapping — this just adds the "text moves opposite way" motion on top.
if (!prefersReducedMotion && window.gsap && window.ScrollTrigger) {
  document.querySelectorAll(".hero, .work, .services, .process, .contact").forEach((section) => {
    const inner = section.querySelector(
      ".hero-title, .work-grid, .pricing-grid, .process-list, .contact-grid"
    );
    if (!inner) return;

    gsap.fromTo(
      inner,
      { y: 60 },
      {
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  });
}


// --- Slide speed control (desktop only): one wheel tick = one smooth,
// slower slide to the next/previous section. Duration below is the only
// number you need to change to make it faster/slower.
if (!prefersReducedMotion && !window.matchMedia("(max-width: 760px)").matches && window.gsap) {
  gsap.registerPlugin(ScrollToPlugin);
  const SLIDE_DURATION = 1.6; // seconds — increase to slow down further
  const sections = Array.from(document.querySelectorAll(".hero, .work, .services, .process, .contact"));
  const navButtons = Array.from(document.querySelectorAll(".side-nav button"));
  let isAnimating = false;

  function currentIndex() {
    let closest = 0, closestDist = Infinity;
    sections.forEach((sec, i) => {
      const dist = Math.abs(sec.offsetTop - window.scrollY);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    return closest;
  }

  function goTo(index) {
    if (index < 0 || index >= sections.length || isAnimating) return;
    isAnimating = true;
    navButtons.forEach((b, i) => b.classList.toggle("active", i === index));
    gsap.to(window, {
      duration: SLIDE_DURATION,
      ease: "power2.inOut",
      scrollTo: { y: sections[index], autoKill: false },
      onComplete: () => { isAnimating = false; }
    });
  }

  window.addEventListener("wheel", (e) => {
    if (isAnimating) { e.preventDefault(); return; }
    if (Math.abs(e.deltaY) < 10) return;
    e.preventDefault();
    goTo(currentIndex() + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  window.addEventListener("keydown", (e) => {
    if (isAnimating) return;
    if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); goTo(currentIndex() + 1); }
    else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); goTo(currentIndex() - 1); }
  });

  navButtons.forEach((btn, i) => btn.addEventListener("click", () => goTo(i)));
  navButtons.forEach((b, i) => b.classList.toggle("active", i === currentIndex()));
}


// --- Hero code window: tilts toward the cursor, resets on mouse leave.
// Also editable via contenteditable in the HTML — visitors can click in
// and type, it's just a decorative little playground, nothing is saved.
(function () {
  const el = document.querySelector(".code-window");
  if (!el) return;

  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });

  el.addEventListener("mouseleave", () => {
    el.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
})();


// --- Hero title: wrap each letter in a span so hover/tap can animate it
// individually (see .hero-title span rules in style.css). Must run AFTER
// i18n applies its translation (which rewrites the title's innerHTML), and
// must re-run every time the language is switched, or the spans get wiped.
function splitHeroTitle() {
  const title = document.querySelector(".hero-title");
  if (!title) return;

  const text = title.textContent;
  title.textContent = "";
  title.setAttribute("aria-label", text);

  // Split into words first so line-wraps only happen between words, not
  // between individual letter spans within a word.
  text.split(" ").forEach((word, i, arr) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "hero-word";

    [...word].forEach((char) => {
      const letterSpan = document.createElement("span");
      letterSpan.textContent = char;
      letterSpan.className = "hero-letter";
      wordSpan.appendChild(letterSpan);
    });

    title.appendChild(wordSpan);

    if (i < arr.length - 1) {
      title.appendChild(document.createTextNode(" "));
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // i18n.js registers its own DOMContentLoaded listener first (it's loaded
  // first in index.html), so by the time this one runs, translation has
  // already been applied — safe to split now.
  splitHeroTitle();

  // Re-split after every language switch, since that also rewrites innerHTML.
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => splitHeroTitle());
  });

  // Touch devices: tap a letter to trigger the same pop animation hover gives.
  const title = document.querySelector(".hero-title");
  if (title) {
    title.addEventListener("touchstart", (e) => {
      const span = e.target.closest(".hero-letter");
      if (!span) return;
      span.classList.remove("pop");
      void span.offsetWidth;
      span.classList.add("pop");
    }, { passive: true });
  }
});
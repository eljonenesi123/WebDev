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
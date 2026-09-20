(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const toggle = document.querySelector(".nav-toggle");
  const modal = document.getElementById("nav-modal");

  const setMenu = (open) => {
    if (!toggle || !modal) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.classList.toggle("is-open", open);
    body.classList.toggle("nav-open", open);
    if (open) {
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add("is-open"));
    } else {
      modal.classList.remove("is-open");
      const done = () => {
        modal.hidden = true;
        modal.removeEventListener("transitionend", done);
      };
      modal.addEventListener("transitionend", done);
      setTimeout(() => {
        if (!modal.classList.contains("is-open")) modal.hidden = true;
      }, 320);
    }
  };

  if (toggle && modal) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setMenu(open);
    });
    modal.querySelectorAll("[data-nav-close]").forEach((el) => {
      el.addEventListener("click", () => setMenu(false));
    });
    modal.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
  }

  const backTop = document.getElementById("back-to-top");
  const onScroll = () => {
    if (!backTop) return;
    const show = window.scrollY > 800;
    backTop.hidden = !show;
    backTop.classList.toggle("is-visible", show);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (backTop) {
    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -30px 0px" }
      );
      reveals.forEach((el) => io.observe(el));
    }
  }

  const toFa = (n) =>
    String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

  const animateCount = (el) => {
    const target = Number(el.getAttribute("data-target") || "0");
    const root = el.closest(".stat");
    if (reduceMotion) {
      el.textContent = toFa(target);
      if (root) root.classList.add("is-counted");
      root?.querySelectorAll(".ring-fg").forEach((ring) => {
        ring.style.setProperty("--p", String(ring.getAttribute("data-ring") || target));
      });
      root?.querySelectorAll(".stat-bars").forEach((bars) => {
        bars.classList.add("is-on");
      });
      return;
    }
    const duration = 1200;
    const start = performance.now();
    const rings = root ? root.querySelectorAll(".ring-fg") : [];
    const bars = root ? root.querySelector(".stat-bars") : null;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = toFa(Math.round(target * eased));
      rings.forEach((ring) => {
        const rp = Number(ring.getAttribute("data-ring") || target);
        ring.style.setProperty("--p", String(Math.round(rp * eased)));
      });
      if (bars && t > 0.05) bars.classList.add("is-on");
      if (t < 1) requestAnimationFrame(tick);
      else if (root) root.classList.add("is-counted");
    };
    requestAnimationFrame(tick);
  };

  const counters = document.querySelectorAll(".count[data-target]");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
    } else {
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              cio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      counters.forEach((el) => cio.observe(el));
    }
  }

  // FAQ: only one open at a time
  const faq = document.querySelector(".faq-list");
  if (faq) {
    faq.querySelectorAll("details").forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        faq.querySelectorAll("details").forEach((other) => {
          if (other !== item) other.open = false;
        });
      });
    });
  }
})();

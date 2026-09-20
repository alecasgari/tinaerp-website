(() => {
  const root = document.documentElement;
  const body = document.body;

  const setTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-accent", "blue");
    try {
      localStorage.setItem("tina-glass-theme", theme);
      localStorage.setItem("tina-glass-accent", "blue");
    } catch (e) {}
    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      const isDark = theme === "dark";
      toggle.setAttribute("aria-checked", isDark ? "true" : "false");
      toggle.classList.toggle("is-dark", isDark);
    }
  };

  const currentTheme = root.getAttribute("data-theme") || "light";
  setTheme(currentTheme);

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(next);
    });
  }

  const menuBtn = document.querySelector(".g-menu-btn");
  const modal = document.getElementById("glass-nav-modal");
  const setMenu = (open) => {
    if (!menuBtn || !modal) return;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    body.classList.toggle("g-nav-open", open);
    if (open) {
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add("is-open"));
    } else {
      modal.classList.remove("is-open");
      setTimeout(() => {
        if (!modal.classList.contains("is-open")) modal.hidden = true;
      }, 280);
    }
  };

  if (menuBtn && modal) {
    menuBtn.addEventListener("click", () => {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    modal.querySelectorAll("[data-g-close]").forEach((el) => {
      el.addEventListener("click", () => setMenu(false));
    });
    modal.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
  }
})();

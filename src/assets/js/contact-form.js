(() => {
  const modal = document.getElementById("contact-modal");
  if (!modal) return;

  const form = document.getElementById("contact-lead-form");
  const body = document.body;
  const thanksUrl = modal.dataset.thanksUrl || "/thanks/";
  const webhook = modal.dataset.webhook || "";
  const statusEl = form.querySelector("[data-form-status]");
  const submitBtn = form.querySelector(".c-submit");
  const labelEl = form.querySelector("[data-submit-label]");
  const loadingEl = form.querySelector("[data-submit-loading]");
  const charCount = form.querySelector("[data-char-count]");
  const messageInput = form.querySelector('[name="message"]');
  const whatsappInput = form.querySelector('[name="whatsapp"]');

  const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
  const STORAGE_KEY = "tina-utm";

  const toEnDigits = (value) =>
    String(value || "")
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
      .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

  const captureUtm = () => {
    const params = new URLSearchParams(window.location.search);
    const found = {};
    let has = false;
    UTM_KEYS.forEach((key) => {
      const val = params.get(key);
      if (val) {
        found[key] = val;
        has = true;
      }
    });
    if (has) {
      const payload = {
        ...found,
        landing_page: window.location.href,
        captured_at: new Date().toISOString(),
        referrer: document.referrer || "",
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {}
      return payload;
    }
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  };

  const utm = captureUtm();

  const setOpen = (open) => {
    body.classList.toggle("c-modal-open", open);
    if (open) {
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add("is-open"));
      const first = form.querySelector("input, select, textarea");
      if (first) setTimeout(() => first.focus(), 220);
    } else {
      modal.classList.remove("is-open");
      setTimeout(() => {
        if (!modal.classList.contains("is-open")) modal.hidden = true;
      }, 280);
    }
  };

  const clearErrors = () => {
    form.querySelectorAll(".c-error").forEach((el) => {
      el.hidden = true;
      el.textContent = "";
    });
    form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
    if (statusEl) {
      statusEl.hidden = true;
      statusEl.textContent = "";
      statusEl.classList.remove("is-error", "is-ok");
    }
  };

  const showError = (name, message) => {
    const field = form.querySelector(`[name="${name}"]`);
    const err = form.querySelector(`[data-error-for="${name}"]`);
    if (field) {
      const wrap = field.closest(".c-field") || field;
      wrap.classList.add("is-invalid");
      if (field.type !== "radio") field.classList.add("is-invalid");
    }
    if (err) {
      err.textContent = message;
      err.hidden = false;
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
  const validateWhatsapp = (phone) => /^09\d{9}$/.test(phone);

  const validate = () => {
    clearErrors();
    const data = Object.fromEntries(new FormData(form).entries());
    let ok = true;

    if (!String(data.firstName || "").trim()) {
      showError("firstName", "نام را وارد کنید.");
      ok = false;
    }
    if (!String(data.lastName || "").trim()) {
      showError("lastName", "نام خانوادگی را وارد کنید.");
      ok = false;
    }
    if (!String(data.company || "").trim()) {
      showError("company", "نام مجموعه را وارد کنید.");
      ok = false;
    }
    if (!data.teamSize) {
      showError("teamSize", "تعداد اعضای تیم را انتخاب کنید.");
      ok = false;
    }
    const phone = toEnDigits(data.whatsapp || "").replace(/\D/g, "");
    if (!validateWhatsapp(phone)) {
      showError("whatsapp", "شماره باید ۱۱ رقم و با ۰۹ شروع شود.");
      ok = false;
    }
    if (!validateEmail(String(data.email || "").trim())) {
      showError("email", "آدرس ایمیل معتبر نیست.");
      ok = false;
    }
    if (!data.systematic) {
      showError("systematic", "یکی از گزینه‌ها را انتخاب کنید.");
      ok = false;
    }
    const msg = String(data.message || "").trim();
    if (!msg) {
      showError("message", "متن درخواست را بنویسید.");
      ok = false;
    } else if (msg.length > 300) {
      showError("message", "حداکثر ۳۰۰ کاراکتر مجاز است.");
      ok = false;
    }
    return ok;
  };

  const setSubmitting = (busy) => {
    submitBtn.disabled = busy;
    if (labelEl) labelEl.hidden = busy;
    if (loadingEl) loadingEl.hidden = !busy;
  };

  if (whatsappInput) {
    whatsappInput.addEventListener("input", () => {
      let v = toEnDigits(whatsappInput.value).replace(/\D/g, "").slice(0, 11);
      whatsappInput.value = v;
    });
  }

  if (messageInput && charCount) {
    const updateCount = () => {
      const n = messageInput.value.length;
      charCount.textContent = `${n} / ۳۰۰`;
      charCount.classList.toggle("is-near", n >= 270);
    };
    messageInput.addEventListener("input", updateCount);
    updateCount();
  }

  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open-contact]");
    if (opener) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    const link = e.target.closest('a[href]');
    if (!link) return;
    try {
      const url = new URL(link.href, window.location.origin);
      if (url.pathname.replace(/\/$/, "").endsWith("/contact")) {
        e.preventDefault();
        setOpen(true);
      }
    } catch (err) {}
  });

  modal.querySelectorAll("[data-contact-close]").forEach((el) => {
    el.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) setOpen(false);
  });

  if (window.location.hash === "#contact" || /[?&]form=1(?:&|$)/.test(window.location.search)) {
    setOpen(true);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!webhook) {
      if (statusEl) {
        statusEl.hidden = false;
        statusEl.classList.add("is-error");
        statusEl.textContent = "آدرس ارسال تنظیم نشده است.";
      }
      return;
    }

    const fd = new FormData(form);
    const phone = toEnDigits(fd.get("whatsapp")).replace(/\D/g, "");
    const stored = captureUtm();
    const payload = {
      firstName: String(fd.get("firstName") || "").trim(),
      lastName: String(fd.get("lastName") || "").trim(),
      company: String(fd.get("company") || "").trim(),
      teamSize: String(fd.get("teamSize") || ""),
      whatsapp: phone,
      email: String(fd.get("email") || "").trim().toLowerCase(),
      systematic: String(fd.get("systematic") || ""),
      message: String(fd.get("message") || "").trim(),
      utm_source: stored.utm_source || "",
      utm_medium: stored.utm_medium || "",
      utm_campaign: stored.utm_campaign || "",
      utm_term: stored.utm_term || "",
      utm_content: stored.utm_content || "",
      gclid: stored.gclid || "",
      fbclid: stored.fbclid || "",
      referrer: stored.referrer || document.referrer || "",
      landing_page: stored.landing_page || window.location.href,
      current_page: window.location.href,
      page_path: window.location.pathname,
      submitted_at: new Date().toISOString(),
      user_agent: navigator.userAgent,
      source: "tina-erp-website",
    };

    setSubmitting(true);
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("webhook_failed");
      window.location.href = thanksUrl;
    } catch (err) {
      setSubmitting(false);
      if (statusEl) {
        statusEl.hidden = false;
        statusEl.classList.add("is-error");
        statusEl.textContent = "ارسال ناموفق بود. لطفاً دوباره تلاش کنید یا با واتساپ پیام دهید.";
      }
    }
  });
})();

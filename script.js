/* ==========================================================
   TorreOnCall – interaktion & animationer
   Ingen extern kod behövs. Respekterar prefers-reduced-motion.
   ========================================================== */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Kontaktuppgifter: ändra här vid behov ---------- */
  const CONTACT_EMAIL = "info@torreoncall.se";
  // Valfritt: lägg in en Formspree-/Getform-adress så skickas formuläret utan e-postprogram.
  // Exempel: const FORM_ENDPOINT = "https://formspree.io/f/xxxxxxx";
  const FORM_ENDPOINT = "";

  /* ---------- Tema (ljust/mörkt) ---------- */
  const themeBtn = $(".theme-toggle");
  const storedTheme = (() => { try { return localStorage.getItem("toc-theme"); } catch { return null; } })();
  const setTheme = (t) => {
    root.dataset.theme = t;
    themeBtn?.setAttribute("aria-label", t === "dark" ? "Byt till ljust läge" : "Byt till mörkt läge");
    try { localStorage.setItem("toc-theme", t); } catch {}
  };
  setTheme(storedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  themeBtn?.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));

  /* ---------- Laddningsskärm ---------- */
  document.body.classList.add("is-loading");
  const start = performance.now();
  const finishLoading = () => {
    const wait = reduceMotion ? 0 : Math.max(0, 950 - (performance.now() - start));
    setTimeout(() => {
      $(".loader")?.classList.add("done");
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-ready");
      setTimeout(() => $(".hero-title")?.classList.add("is-in"), reduceMotion ? 0 : 250);
    }, wait);
  };
  if (document.readyState === "complete") finishLoading();
  else window.addEventListener("load", finishLoading, { once: true });
  setTimeout(finishLoading, 3500); // säkerhetsnät

  /* ---------- Årtal ---------- */
  $$(".year").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Scroll: header, progress, till toppen ---------- */
  const header = $(".header");
  const bar = $(".progress span");
  const toTop = $(".to-top");
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle("is-scrolled", y > 20);
    const menuOpen = document.body.classList.contains("menu-open");
    header.classList.toggle("is-hidden", !menuOpen && y > lastY && y > 400);
    toTop.classList.toggle("is-visible", y > 900);
    lastY = y;
    updateTimeline();
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------- Aktiv länk i menyn ---------- */
  const navLinks = $$(".nav a");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        navLinks.forEach((a) => {
          const active = a.getAttribute("href") === "#" + e.target.id;
          a.classList.toggle("is-active", active);
          active ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current");
        });
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => navIO.observe(s));

  /* ---------- Mobilmeny ---------- */
  const burger = $(".burger");
  const mMenu = $("#mobile-menu");
  const toggleMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Stäng meny" : "Öppna meny");
    document.body.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      mMenu.hidden = false;
      requestAnimationFrame(() => mMenu.classList.add("is-open"));
      header.classList.remove("is-hidden");
    } else {
      mMenu.classList.remove("is-open");
      setTimeout(() => { if (!mMenu.classList.contains("is-open")) mMenu.hidden = true; }, 700);
    }
  };
  burger.addEventListener("click", () => toggleMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a", mMenu).forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("menu-open")) toggleMenu(false); });

  /* ---------- Scroll-avslöjanden med stagger ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      revealIO.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  // Stagger: syskon i samma förälder får ökande fördröjning
  const groups = new Map();
  $$(".reveal").forEach((el) => {
    const p = el.parentElement;
    const i = groups.get(p) || 0;
    groups.set(p, i + 1);
    el.style.setProperty("--d", `${Math.min(i * 0.08, 0.5)}s`);
    revealIO.observe(el);
  });

  /* ---------- Skrivmaskin ---------- */
  const typed = $(".typed");
  if (typed) {
    const words = typed.dataset.words.split("|");
    if (reduceMotion) typed.textContent = words.join(" · ");
    else {
      let w = 0, c = 0, del = false;
      const tick = () => {
        const word = words[w];
        typed.textContent = word.slice(0, c);
        if (!del && c < word.length) { c++; setTimeout(tick, 70); }
        else if (!del) { del = true; setTimeout(tick, 1600); }
        else if (c > 0) { c--; setTimeout(tick, 35); }
        else { del = false; w = (w + 1) % words.length; setTimeout(tick, 300); }
      };
      setTimeout(tick, 1400);
    }
  }

  /* ---------- Räknare & mätare ---------- */
  const animateNumber = (el, to, decimals = 0, prefix = "", dur = 1600) => {
    if (reduceMotion) { el.textContent = prefix + to.toFixed(decimals).replace(".", ","); return; }
    const t0 = performance.now();
    const from = decimals ? to * 4 : 0; // decimaltal räknar nedåt – lägre är bättre
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 4);
      const v = from + (to - from) * e;
      el.textContent = prefix + v.toFixed(decimals).replace(".", ",");
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      animateNumber(el, parseFloat(el.dataset.to), parseInt(el.dataset.decimals || 0, 10), el.dataset.prefix || "");
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$(".count").forEach((el) => countIO.observe(el));

  const gaugeIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const g = e.target;
      const v = parseInt(g.dataset.value, 10);
      setTimeout(() => {
        $(".g-fill", g).style.strokeDashoffset = String(100 - v);
        animateNumber($("b", g), v, 0, "", 1800);
      }, 900);
      gaugeIO.unobserve(g);
    });
  }, { threshold: 0.5 });
  $$(".gauge").forEach((g) => gaugeIO.observe(g));

  /* ---------- 3D-tilt + spotlight ---------- */
  if (finePointer && !reduceMotion) {
    $$(".tilt").forEach((el) => {
      const max = el.classList.contains("browser") ? 8 : 6;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.transform = `rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg)`;
        el.style.setProperty("--mx", `${x * 100}%`);
        el.style.setProperty("--my", `${y * 100}%`);
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });

    /* Magnetiska knappar */
    $$(".magnetic").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty("--bx", `${(e.clientX - r.left - r.width / 2) * 0.25}px`);
        b.style.setProperty("--by", `${(e.clientY - r.top - r.height / 2) * 0.35}px`);
      });
      b.addEventListener("pointerleave", () => { b.style.setProperty("--bx", "0px"); b.style.setProperty("--by", "0px"); });
    });
  }

  /* ---------- Egen muspekare ---------- */
  if (finePointer && !reduceMotion) {
    const ring = $(".cursor"), dot = $(".cursor-dot");
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    }, { passive: true });
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("pointerover", (e) => {
      const hit = e.target.closest("a, button, summary, label, input, textarea, .card");
      ring.classList.toggle("is-hover", !!hit);
    });
    document.addEventListener("pointerleave", () => { ring.classList.add("is-hidden"); dot.classList.add("is-hidden"); });
    document.addEventListener("pointerenter", () => { ring.classList.remove("is-hidden"); dot.classList.remove("is-hidden"); });
  }

  /* ---------- Ritningsbakgrund (canvas) ---------- */
  const canvas = $(".blueprint");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, points = [], visible = true, t = 0;
    const mouse = { x: -9999, y: -9999 };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(70, (w * h) / 22000));
      points = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    canvas.parentElement.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) draw(); }).observe(canvas);

    const draw = () => {
      if (!visible) return;
      t += 1;
      const dark = root.dataset.theme === "dark";
      const lineCol = dark ? "110,149,201" : "14,47,85";
      ctx.clearRect(0, 0, w, h);

      // Rutnät som en arkitektritning, långsamt glidande
      const g = 48, off = (t * 0.15) % g;
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${lineCol},${dark ? 0.08 : 0.06})`;
      ctx.beginPath();
      for (let x = -g + off; x < w; x += g) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = -g + off; y < h; y += g) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();

      // Ljuskägla runt muspekaren
      if (mouse.x > 0) {
        const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
        grd.addColorStop(0, `rgba(62,107,165,${dark ? 0.22 : 0.12})`);
        grd.addColorStop(1, "rgba(62,107,165,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(mouse.x - 220, mouse.y - 220, 440, 440);
      }

      // Noder och förbindelser
      for (const p of points) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 140) { p.x += dx / d * 0.8; p.y += dy / d * 0.8; }
      }
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 150) {
            ctx.strokeStyle = `rgba(62,107,165,${(1 - d / 150) * (dark ? 0.35 : 0.22)})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(62,107,165,${dark ? 0.7 : 0.5})`;
        ctx.fillRect(a.x - 1.5, a.y - 1.5, 3, 3);
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------- Tidslinje som fylls vid scroll ---------- */
  const tl = $(".timeline");
  const tlFill = $(".timeline-line span");
  const steps = $$(".step");
  const buildRects = $$(".build-mark rect");
  const buildPct = $(".build-label b");
  function updateTimeline() {
    if (!tl) return;
    const r = tl.getBoundingClientRect();
    const mid = window.innerHeight * 0.6;
    const k = Math.max(0, Math.min(1, (mid - r.top) / r.height));
    tlFill.style.transform = `scaleY(${k})`;
    buildRects.forEach((r, i) => r.classList.toggle("on", k > (i + 0.5) / buildRects.length));
    if (buildPct) buildPct.textContent = Math.round(k * 100);
    steps.forEach((s) => {
      const sr = s.getBoundingClientRect();
      s.classList.toggle("is-active", sr.top + 28 < mid);
    });
  }
  updateTimeline();

  /* ---------- Planerare ---------- */
  const planner = $(".planner-form");
  const psList = $(".ps-list");
  const psMeter = $(".ps-meter span");
  const psScope = $(".ps-scope b");
  const pages = $(".pages");
  const pagesOut = $(".pages-out");
  const plannerState = () => {
    const picked = $$("input:checked", planner).map((i) => ({ v: i.value, w: +i.dataset.w }));
    const n = +pages.value;
    return { picked, n };
  };
  const renderPlanner = () => {
    const { picked, n } = plannerState();
    pagesOut.textContent = n >= 30 ? "30+" : n;
    psList.innerHTML = "";
    if (!picked.length) {
      psList.innerHTML = '<li class="ps-empty">Inget valt ännu</li>';
    } else {
      picked.forEach((p) => { const li = document.createElement("li"); li.textContent = p.v; psList.appendChild(li); });
      const li = document.createElement("li"); li.textContent = `ca ${pagesOut.textContent} sidor`; psList.appendChild(li);
    }
    const score = picked.reduce((s, p) => s + p.w, 0) + n / 4;
    const pct = picked.length ? Math.min(100, (score / 18) * 100) : 0;
    psMeter.style.width = pct + "%";
    psScope.textContent = !picked.length ? "–" : pct < 35 ? "Mindre projekt" : pct < 70 ? "Mellanstort projekt" : "Större projekt";
  };
  planner.addEventListener("input", renderPlanner);
  renderPlanner();

  $(".planner-go").addEventListener("click", () => {
    const { picked } = plannerState();
    if (!picked.length) { toast("Välj minst ett alternativ först"); return; }
    const msg = $("#f-msg");
    msg.value = `Hej! Vi är intresserade av:\n– ${picked.map((p) => p.v).join("\n– ")}\n– Ungefär ${pagesOut.textContent} sidor\n\nOm oss: `;
    msg.dispatchEvent(new Event("input"));
    $("#kontakt").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(() => { msg.focus({ preventScroll: true }); msg.setSelectionRange(msg.value.length, msg.value.length); }, reduceMotion ? 0 : 800);
    toast("Förfrågan är ifylld – lägg till några rader om er");
  });

  /* ---------- Principer (flikar som roterar) ---------- */
  const principles = $$(".principle");
  let pIdx = 0, pTimer;
  const setPrinciple = (i) => {
    pIdx = i;
    principles.forEach((p, k) => { p.classList.toggle("is-active", k === i); p.setAttribute("aria-selected", String(k === i)); });
  };
  const autoPrinciple = () => {
    clearInterval(pTimer);
    if (!reduceMotion) pTimer = setInterval(() => setPrinciple((pIdx + 1) % principles.length), 3800);
  };
  principles.forEach((p, i) => {
    p.addEventListener("click", () => { setPrinciple(i); autoPrinciple(); });
    p.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); const n = (i + 1) % principles.length; principles[n].focus(); setPrinciple(n); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); const n = (i - 1 + principles.length) % principles.length; principles[n].focus(); setPrinciple(n); }
    });
  });
  autoPrinciple();

  /* ---------- FAQ med mjuk animation ---------- */
  $$(".faq details").forEach((d) => {
    const s = $("summary", d);
    s.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) {
        d.classList.remove("is-open");
        setTimeout(() => (d.open = false), reduceMotion ? 0 : 420);
      } else {
        $$(".faq details[open]").forEach((o) => { o.classList.remove("is-open"); setTimeout(() => (o.open = false), 420); });
        d.open = true;
        requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add("is-open")));
      }
    });
  });

  /* ---------- Kopiera e-post ---------- */
  $(".copy-mail")?.addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText(e.currentTarget.dataset.copy); toast("E-postadressen är kopierad"); }
    catch { toast(CONTACT_EMAIL); }
  });

  /* ---------- Kontaktformulär ---------- */
  const form = $("#contact-form");
  const msgEl = $("#f-msg");
  const counter = $(".counter span");
  msgEl.addEventListener("input", () => (counter.textContent = msgEl.value.length));

  const setErr = (input, text) => {
    const field = input.closest(".field");
    const err = field ? $(".err", field) : $(".err-consent");
    err.textContent = text || "";
    field?.classList.toggle("has-error", !!text);
    input.setAttribute("aria-invalid", text ? "true" : "false");
  };
  const validate = () => {
    let ok = true;
    const name = $("#f-name"), mail = $("#f-mail"), consent = $("#f-consent");
    if (name.value.trim().length < 2) { setErr(name, "Skriv ditt namn."); ok = false; } else setErr(name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim())) { setErr(mail, "Ange en giltig e-postadress."); ok = false; } else setErr(mail);
    if (msgEl.value.trim().length < 10) { setErr(msgEl, "Skriv några rader om vad ni vill bygga."); ok = false; } else setErr(msgEl);
    if (!consent.checked) { setErr(consent, "Du behöver godkänna villkoren."); ok = false; } else setErr(consent);
    return ok;
  };
  $$("input, textarea", form).forEach((el) => el.addEventListener("blur", () => { if (el.getAttribute("aria-invalid") === "true") validate(); }));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $(".form-status");
    status.textContent = "";
    if (!validate()) { $('[aria-invalid="true"]', form)?.focus(); return; }
    const btn = $(".btn-submit");
    btn.classList.add("is-loading"); btn.disabled = true;
    const data = { namn: $("#f-name").value.trim(), epost: $("#f-mail").value.trim(), meddelande: msgEl.value.trim() };

    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error("fel");
        status.textContent = "Tack! Vi återkommer så snart vi kan.";
        form.reset(); counter.textContent = "0";
      } else {
        const subject = encodeURIComponent(`Förfrågan från ${data.namn}`);
        const body = encodeURIComponent(`${data.meddelande}\n\n— ${data.namn}\n${data.epost}`);
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
        status.textContent = "Ditt e-postprogram öppnas med meddelandet ifyllt.";
      }
    } catch {
      status.textContent = `Något gick fel. Mejla oss gärna direkt på ${CONTACT_EMAIL}.`;
    } finally {
      setTimeout(() => { btn.classList.remove("is-loading"); btn.disabled = false; }, 600);
    }
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(text) {
    const t = $(".toast");
    t.textContent = text;
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2600);
  }
})();

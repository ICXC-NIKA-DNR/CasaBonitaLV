/* ============================================================
   Casa Bonita LLC — app.js
   No frameworks, no dependencies. Everything degrades gracefully
   if JavaScript is blocked: the page still reads and the phone
   links still work.
   ============================================================ */

/* ─────────────────────────────────────────────────────────────
   CONFIG — the only block you normally need to touch.
   ───────────────────────────────────────────────────────────── */
const CONFIG = {
  /* Leave formEndpoint as "" while the site is a plain static page.
     In that mode the quote form hands off to the phone's text app
     (or email on desktop) with everything pre-filled.

     When you move to a paid/managed host, or sign up for a free form
     service, paste the URL here and the form starts posting silently
     instead. Nothing else in the site has to change.

       Formspree      "https://formspree.io/f/xxxxxxxx"
       Web3Forms      "https://api.web3forms.com/submit"
       Netlify/Vercel "/api/quote"  (your own endpoint)
  */
  formEndpoint: "",

  phone: "+15551234567",
  email: "hello@casabonita.example"
};

/* ─────────────────────────────────────────────────────────────
   1. Language (EN / ES)
   ───────────────────────────────────────────────────────────── */
const ES = window.CB_ES || {};
const EN_RUNTIME = window.CB_EN_RUNTIME || {};

const TITLES = {
  en: "Casa Bonita LLC — Home Cleaning You Can Trust",
  es: "Casa Bonita LLC — Limpieza de Casas de Confianza"
};

/* Snapshot the English text once, straight out of the HTML. */
const i18nNodes = [...document.querySelectorAll("[data-i18n]")].map((el) => {
  const hasNested = !!el.querySelector("[data-i18n]");
  const textNode = hasNested
    ? [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim())
    : null;
  return {
    el,
    key: el.dataset.i18n,
    textNode,
    en: textNode ? textNode.textContent : el.textContent
  };
});

/* Elements whose aria-label needs translating rather than their text. */
const i18nAria = [...document.querySelectorAll("[data-i18n-aria]")].map((el) => ({
  el,
  key: el.dataset.i18nAria,
  en: el.getAttribute("aria-label") || ""
}));

let lang = "en";

function setLang(next) {
  lang = next === "es" ? "es" : "en";
  document.documentElement.lang = lang;
  document.title = TITLES[lang];

  i18nNodes.forEach((n) => {
    if (lang === "es") {
      const v = ES[n.key];
      if (v == null) return;
      if (n.textNode) n.textNode.textContent = v + " ";
      else n.el.textContent = v;
    } else {
      if (n.textNode) n.textNode.textContent = n.en;
      else n.el.textContent = n.en;
    }
  });

  i18nAria.forEach((n) => {
    n.el.setAttribute("aria-label", lang === "es" ? ES[n.key] || n.en : n.en);
  });

  document.querySelectorAll(".lang-opt").forEach((o) => {
    o.classList.toggle("is-on", o.dataset.lang === lang);
  });

  try { localStorage.setItem("cb-lang", lang); } catch (e) { /* private mode */ }

  /* Anything built by script (the carousel dots) relabels itself here. */
  document.dispatchEvent(new CustomEvent("cb:langchange", { detail: { lang } }));
}

function t(key) {
  return (lang === "es" ? ES[key] : EN_RUNTIME[key]) || EN_RUNTIME[key] || key;
}

/* Remember the visitor's choice; otherwise follow the browser. */
let startLang = "en";
try { startLang = localStorage.getItem("cb-lang") || ""; } catch (e) { /* ignore */ }
if (!startLang) startLang = (navigator.language || "en").toLowerCase().startsWith("es") ? "es" : "en";
if (startLang === "es") setLang("es");

document.getElementById("langToggle")?.addEventListener("click", () => {
  setLang(lang === "en" ? "es" : "en");
});

/* ─────────────────────────────────────────────────────────────
   2. Scroll reveals
   ───────────────────────────────────────────────────────────── */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealables = document.querySelectorAll(".reveal");

/* The reveal is reversible: it plays forwards as an element rises past a
   line near the bottom of the screen, and backwards as it sinks below
   that line again on the way up.

   The rootMargin does the work. The bottom edge is pulled up 22% to make
   the trigger line — high enough that the fade-out finishes well before
   the element reaches the bottom of the screen, so you actually see it
   happen. The top edge is pushed far up the page so that scrolling
   *past* something never un-reveals it: things leaving by the top just
   scroll away and scroll back, and only the bottom of the screen ever
   fades anything in or out.

   Counters are the exception: they tick up once and stay put. */
const counted = new WeakSet();

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealables.forEach((el) => el.classList.add("is-in"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        el.classList.toggle("is-in", entry.isIntersecting);

        if (entry.isIntersecting && el.classList.contains("stat") && !counted.has(el)) {
          counted.add(el);
          countUp(el);
        }
      });
    },
    { threshold: 0, rootMargin: "9999px 0px -22% 0px" }
  );
  revealables.forEach((el) => revealObserver.observe(el));
}

/* Numbers that tick up when the trust strip scrolls into view. */
function countUp(stat) {
  const node = stat.querySelector("[data-count]");
  if (!node) return;
  const target = parseInt(node.dataset.count, 10);
  if (!Number.isFinite(target)) return;

  const duration = 1100;
  const start = performance.now();

  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    node.textContent = Math.round(target * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (reduceMotion) {
  document.querySelectorAll(".stat").forEach((s) => {
    const n = s.querySelector("[data-count]");
    if (n) n.textContent = Number(n.dataset.count).toLocaleString();
  });
}

/* ─────────────────────────────────────────────────────────────
   3. Header state, scroll-spy nav, mobile menu, call bar
   ───────────────────────────────────────────────────────────── */
const header = document.getElementById("siteHeader");
const callbar = document.querySelector(".callbar");

function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle("is-stuck", y > 8);
  callbar?.classList.toggle("is-up", y > window.innerHeight * 0.7);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const navLinks = [...document.querySelectorAll(".nav a")];
const spySections = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && spySections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) =>
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  spySections.forEach((s) => spy.observe(s));
}

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

menuBtn?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
nav?.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    nav.classList.remove("is-open");
    menuBtn?.setAttribute("aria-expanded", "false");
  }
});

/* ─────────────────────────────────────────────────────────────
   4. Quote form
   ───────────────────────────────────────────────────────────── */
const form = document.getElementById("quoteForm");
const status = document.getElementById("formStatus");

function say(msg, kind) {
  if (!status) return;
  status.textContent = msg;
  status.className = "form-status" + (kind ? " " + kind : "");
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  /* Bot trap: a real person never fills a field they can't see. */
  if (form.elements._gotcha.value) return;

  const data = Object.fromEntries(new FormData(form).entries());
  delete data._gotcha;

  const nameEl = form.elements.name;
  const phoneEl = form.elements.phone;
  const missing = !nameEl.value.trim() || !phoneEl.value.trim();
  nameEl.setAttribute("aria-invalid", String(!nameEl.value.trim()));
  phoneEl.setAttribute("aria-invalid", String(!phoneEl.value.trim()));

  if (missing) {
    say(t("form.err.required"), "err");
    (nameEl.value.trim() ? phoneEl : nameEl).focus();
    return;
  }

  /* ── Mode A: a form endpoint is configured → post it. ── */
  if (CONFIG.formEndpoint) {
    say(t("form.sending"));
    try {
      const res = await fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      say(t("form.ok"), "ok");
    } catch (err) {
      say(t("form.fail"), "err");
    }
    return;
  }

  /* ── Mode B: plain static site → hand off to text or email. ── */
  const lines = [
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    data.email ? `Email: ${data.email}` : "",
    `Service: ${data.service}`,
    `Home size: ${data.size}`,
    data.message ? `Notes: ${data.message}` : ""
  ].filter(Boolean);

  const body = encodeURIComponent(lines.join("\n"));
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  say(t("form.handoff"), "ok");
  window.location.href = isMobile
    ? `sms:${CONFIG.phone}?&body=${body}`
    : `mailto:${CONFIG.email}?subject=${encodeURIComponent("Quote request — " + data.name)}&body=${body}`;
});

/* ─────────────────────────────────────────────────────────────
   5. Footer year
   ───────────────────────────────────────────────────────────── */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ─────────────────────────────────────────────────────────────
   6. Carousel

   Drives any .carousel on the page. Everything is read from the DOM,
   so adding or removing cards needs no code change: add a card and the
   dots and arrows adjust themselves. Nothing moves on its own — it only
   advances when someone clicks an arrow or a dot, presses an arrow key,
   or swipes.
   ───────────────────────────────────────────────────────────── */
function initCarousel(root) {
  const rail = root.querySelector(".rail");
  const dotsBox = root.querySelector(".dots");
  const arrows = [...root.querySelectorAll(".arrow")];
  const slides = [...rail.children];
  if (!slides.length) return;

  let perView = 1;
  let pages = 1;
  let page = 0;

  /* Distance from one card's left edge to the next, gap included. */
  function step() {
    if (slides.length < 2) return slides[0].getBoundingClientRect().width;
    return slides[1].getBoundingClientRect().left - slides[0].getBoundingClientRect().left;
  }

  function measure() {
    const s = step();
    perView = s > 0 ? Math.max(1, Math.round(rail.clientWidth / s)) : 1;
    pages = Math.max(1, Math.ceil(slides.length / perView));
    root.dataset.static = String(slides.length <= perView);
    arrows.forEach((a) => (a.disabled = pages < 2));
  }

  function drawDots() {
    if (!dotsBox) return;
    dotsBox.textContent = "";
    if (pages < 2) return;
    for (let i = 0; i < pages; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(i === page));
      b.setAttribute("aria-label", t("carousel.dot").replace("{n}", String(i + 1)));
      b.addEventListener("click", () => goTo(i));
      dotsBox.appendChild(b);
    }
  }

  function syncDots() {
    if (!dotsBox) return;
    [...dotsBox.children].forEach((b, i) => b.setAttribute("aria-selected", String(i === page)));
  }

  function goTo(next) {
    /* Wraps around, so the arrows keep cycling at either end. */
    page = ((next % pages) + pages) % pages;
    rail.scrollTo({ left: page * perView * step(), behavior: reduceMotion ? "auto" : "smooth" });
    syncDots();
  }

  function readPage() {
    const s = step() * perView;
    if (s <= 0) return;
    const atEnd = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2;
    const next = atEnd ? pages - 1 : Math.round(rail.scrollLeft / s);
    if (next !== page) {
      page = next;
      syncDots();
    }
  }

  arrows.forEach((a) => a.addEventListener("click", () => goTo(page + Number(a.dataset.dir))));

  rail.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(page + 1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); goTo(page - 1); }
  });

  /* Keep the dots honest when someone swipes or drags instead. */
  let scrollTimer;
  rail.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(readPage, 90);
  }, { passive: true });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasOn = page;
      measure();
      drawDots();
      goTo(Math.min(wasOn, pages - 1));
    }, 150);
  });

  document.addEventListener("cb:langchange", drawDots);

  measure();
  drawDots();
}

document.querySelectorAll(".carousel").forEach(initCarousel);

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

  document.querySelectorAll(".lang-opt").forEach((o) => {
    o.classList.toggle("is-on", o.dataset.lang === lang);
  });

  try { localStorage.setItem("cb-lang", lang); } catch (e) { /* private mode */ }
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

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealables.forEach((el) => el.classList.add("is-in"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
        if (entry.target.classList.contains("stat")) countUp(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
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

/* ══════════════════════════════════════════════════════════════
   PALETTE PREVIEW SWITCHER — temporary.
   Delete this block, the .palette-switch CSS, and the matching
   markup in index.html once a palette is chosen.
   ══════════════════════════════════════════════════════════════ */
(function palettePreview() {
  const box = document.getElementById("paletteSwitch");
  if (!box) return;

  const fromUrl = new URLSearchParams(location.search).get("palette");
  let saved = null;
  try { saved = localStorage.getItem("cb-palette"); } catch (e) { /* ignore */ }

  function set(name) {
    document.documentElement.dataset.palette = name;
    box.querySelectorAll("button").forEach((b) => b.classList.toggle("is-on", b.dataset.set === name));
    try { localStorage.setItem("cb-palette", name); } catch (e) { /* ignore */ }
  }

  set(fromUrl || saved || "warm");
  box.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-set]");
    if (b) set(b.dataset.set);
  });
})();

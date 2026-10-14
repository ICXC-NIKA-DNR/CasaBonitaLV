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

/* The reveal is scrubbed, not timed. Each element gets a --p from 0 to 1
   based purely on where it currently sits on screen, recalculated every
   animation frame while the page is scrolling.

   That is what makes scrolling up a real undo: the same frames, in
   reverse, at whatever speed you move. A timed animation can be outrun —
   scroll fast enough and the element leaves the screen before the clock
   finishes. Position-driven animation can't be, because there is no
   clock. Fast scrolling just plays it fast.

   An element is hidden at FADE_START (just below the bottom of the
   screen's useful area), fully revealed by FADE_END, and holds at 1
   above that — so passing something by the top never undoes it. Only
   the bottom of the screen fades anything, in either direction. */
const FADE_START = 0.95;   /* share of viewport height: --p hits 0 here */
const FADE_END   = 0.62;   /* ...and 1 here */
const STAGGER_PX = 36;     /* extra travel per data-d step, for the cascade */

const counted = new WeakSet();

if (reduceMotion) {
  revealables.forEach((el) => el.style.setProperty("--p", "1"));
} else {
  const items = [...revealables].map((el) => ({
    el,
    top: 0,
    p: -1,
    off: Number(el.dataset.d || 0) * STAGGER_PX,
    isStat: el.classList.contains("stat")
  }));

  let p0 = 0;
  let band = 1;

  /* Document-space offsets are cached so the per-frame loop never reads
     layout — it only does arithmetic and writes a custom property. */
  function measure() {
    const sy = window.scrollY;
    const vh = window.innerHeight;
    p0 = vh * FADE_START;
    band = Math.max(1, vh * (FADE_START - FADE_END));
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);

    items.forEach((it) => {
      it.top = it.el.getBoundingClientRect().top + sy;

      /* Two cases where scrubbing can't work, because the page doesn't
         have the scroll range to run the animation through: anything on
         the first screen, which is already in view before a single pixel
         of scrolling, and anything so near the bottom that the page runs
         out before the fade finishes. Either would sit stranded at a
         partial opacity forever. Both are pinned fully visible instead,
         and get their entrance from the intro animation. */
      it.pin =
        it.top < vh ||
        it.top + it.off - vh * FADE_END > maxScroll;
    });
  }

  function paint() {
    frameQueued = false;
    const sy = window.scrollY;

    for (const it of items) {
      const raw = it.pin ? 1 : (p0 - it.off - (it.top - sy)) / band;
      const p = raw < 0 ? 0 : raw > 1 ? 1 : raw;

      if (p !== it.p) {
        it.p = p;
        it.el.style.setProperty("--p", p.toFixed(3));
      }
      if (p > 0.6 && it.isStat && !counted.has(it.el)) {
        counted.add(it.el);
        countUp(it.el);
      }
    }
  }

  let frameQueued = false;
  function schedule() {
    if (frameQueued) return;
    frameQueued = true;
    requestAnimationFrame(paint);
  }

  window.addEventListener("scroll", schedule, { passive: true });

  /* Anything that can change the page's height invalidates the cache:
     a window resize, images arriving, an FAQ row opening, a language
     switch changing how much text there is. */
  let remeasureTimer;
  function remeasure() {
    clearTimeout(remeasureTimer);
    remeasureTimer = setTimeout(() => { measure(); schedule(); }, 100);
  }
  window.addEventListener("resize", remeasure);
  window.addEventListener("load", remeasure);
  document.addEventListener("cb:langchange", remeasure);
  document.addEventListener("toggle", remeasure, true);
  if ("ResizeObserver" in window) new ResizeObserver(remeasure).observe(document.body);

  /* Play the page in on a timer once, with the stagger, then hand over
     to the scrubber. */
  measure();
  document.body.classList.add("intro");
  requestAnimationFrame(paint);
  setTimeout(() => {
    document.body.classList.remove("intro");
    measure();
    schedule();
  }, 1400);
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

/* ─────────────────────────────────────────────────────────────
   7. Before / after sliders

   The range input does the hard parts — dragging, touch, keyboard,
   screen readers — so all this has to do is copy its value into a CSS
   variable that the clip-path reads.
   ───────────────────────────────────────────────────────────── */
document.querySelectorAll("[data-compare]").forEach((fig) => {
  const range = fig.querySelector(".cmp-range");
  if (!range) return;

  const apply = () => fig.style.setProperty("--cmp", range.value + "%");
  range.addEventListener("input", apply);
  apply();

  /* Nudge it off centre on first sight so it reads as draggable rather
     than as a photo with a line through it. */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const hint = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        hint.unobserve(fig);
        let v = 50;
        const to = (target, after) => {
          const step = () => {
            v += (target - v) * 0.12;
            range.value = String(Math.round(v));
            apply();
            if (Math.abs(target - v) > 0.6) requestAnimationFrame(step);
            else if (after) setTimeout(after, 120);
          };
          requestAnimationFrame(step);
        };
        setTimeout(() => to(66, () => to(50)), 220);
      });
    }, { threshold: 0.45 });
    hint.observe(fig);
  }
});

/* ─────────────────────────────────────────────────────────────
   8. One-time / recurring switch on the service card
   ───────────────────────────────────────────────────────────── */
document.querySelectorAll(".card-switch").forEach((card) => {
  const buttons = [...card.querySelectorAll(".seg-btn")];
  const plans = [...card.querySelectorAll(".plan")];

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-selected", String(on));
      });
      plans.forEach((p) => { p.hidden = p.dataset.plan !== btn.dataset.plan; });
    });
  });
});

/* ─────────────────────────────────────────────────────────────
   9. Availability calendar

   Renders the next 14 days from assets/js/availability.js. Days are
   open by default; only exceptions are listed in that file, which keeps
   the upkeep to marking the days that fill. No times are ever shown —
   only how many slots remain.
   ───────────────────────────────────────────────────────────── */
(function availability() {
  const grid = document.getElementById("availGrid");
  const data = window.CB_AVAILABILITY;
  if (!grid || !data) return;

  const DAYS_SHOWN = 14;
  const dowKeys = ["dow.sun", "dow.mon", "dow.tue", "dow.wed", "dow.thu", "dow.fri", "dow.sat"];

  /* Local date as YYYY-MM-DD. Deliberately not toISOString(), which
     converts to UTC and can land on the wrong day. */
  function key(d) {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function render() {
    grid.textContent = "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < DAYS_SHOWN; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const override = data.dates ? data.dates[key(d)] : undefined;
      const normal = data.weekly ? data.weekly[d.getDay()] : 0;
      const closed = override === "closed" || (override === undefined && normal === 0);
      const left = closed ? 0 : (override === undefined ? normal : Number(override));

      let state = "full";
      let label = t("avail.full");
      if (closed) {
        state = "closed";
        label = t("avail.closed");
      } else if (left > 1) {
        state = "open";
        label = t("avail.spots").replace("{n}", String(left));
      } else if (left === 1) {
        state = "few";
        label = t("avail.one");
      }

      const li = document.createElement("li");
      li.className = `day day-${state}` + (i === 0 ? " day-today" : "");

      const dow = document.createElement("span");
      dow.className = "day-dow";
      dow.textContent = t(dowKeys[d.getDay()]);

      const num = document.createElement("span");
      num.className = "day-num";
      num.textContent = String(d.getDate());

      const st = document.createElement("span");
      st.className = "day-state";
      st.textContent = label;

      li.append(dow, num, st);
      grid.appendChild(li);
    }
  }

  render();
  document.addEventListener("cb:langchange", render);
})();

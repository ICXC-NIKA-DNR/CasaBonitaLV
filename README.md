# Casa Bonita LLC — website

A static, dependency-free marketing site for a home cleaning business.
Three files do all the work. No build step, no npm, no framework.

```
index.html                   all the content and structure
privacy.html / terms.html    legal pages (drafts — see CONTENT.md)
assets/css/styles.css        all the styling; colours and fonts are variables at the top
assets/js/i18n.js            the Spanish translations
assets/js/availability.js    the booking calendar — the one file that needs regular updating
assets/js/app.js             scroll animations, language, sliders, carousel, quote form
assets/img/                  placeholder images (swap these for real photos)
CONTENT.md                   what to collect from her and exactly where it goes
```

Everything degrades gracefully: with JavaScript blocked the page still reads
end to end in English and the phone links still work.

---

## Run it locally

```bash
cd ~/Claude/casa-bonita && python3 -m http.server 8010
```

Then open <http://localhost:8010>.

(Opening `index.html` straight from the file system mostly works too, but a
local server matches how GitHub Pages will serve it.)

---

## Colours and fonts

The look is **warm**: off-white ground, terracotta accent, serif headings.

Every colour comes from the variable block at the top of
`assets/css/styles.css`. Nothing below it hard-codes a colour except the star
gold and the form's error red. Change `--accent` and the buttons, icons,
section labels, prices, links, and focus rings all move together.

```css
:root {
  --bg:          #FBF8F4;   /* page background        */
  --bg-alt:      #F4EEE6;   /* alternating sections   */
  --accent:      #B4653A;   /* terracotta             */
  --accent-ink:  #8E4C28;   /* darker, for text       */
  --accent-soft: #F6E8DC;   /* tint behind icons      */
  --accent-glow: 180 101 58;  /* same accent as "R G B", for soft shadows */
  ...
}
```

If you change `--accent`, change `--accent-ink` (darker), `--accent-soft`
(much lighter), and `--accent-glow` (the same colour written as three numbers)
to match, or the shadows and tints will drift out of step.

**Fonts** are two variables in the same block:

```css
--font-display: "Fraunces", "Iowan Old Style", Georgia, serif;  /* headings */
--font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", …;  /* everything else */
```

To try a different heading face, swap the Google Fonts `<link>` near the top of
`index.html` and change the first name in `--font-display`. Always leave a real
fallback after it so the page still looks right before the font loads. The body
font is the visitor's own system font — no download, which is most of why the
site is fast.

---

## The quote form

The form has two modes, controlled by one line at the top of `assets/js/app.js`:

```js
formEndpoint: "",
```

**Empty (how it ships).** GitHub Pages can't run server code, so the form can't
email anyone on its own. Instead it collects the answers and hands off: on a
phone it opens the text-message app with everything pre-filled and her number
already in the To: field; on a desktop it opens the visitor's email client.
The visitor still taps send, so nothing is lost silently.

**Filled in.** Paste a form endpoint and the form posts quietly in the
background and shows a thank-you instead. Nothing else changes. Free options
that work on a static site:

- [Formspree](https://formspree.io) — `https://formspree.io/f/xxxxxxxx`
- [Web3Forms](https://web3forms.com) — `https://api.web3forms.com/submit`

If you later move to a paid host with a backend (Vercel, Netlify, Cloudflare
Pages), point `formEndpoint` at your own route — e.g. `/api/quote` — and the
front end needs no other changes. A honeypot field is already in place to catch
the simplest spam bots.

---

## Deploying to GitHub Pages

Same approach as the math site.

1. Create a repo on GitHub (public, no README).
2. Push:

```bash
cd ~/Claude/casa-bonita && git add -A && git commit -m "Casa Bonita site" && git branch -M main && git remote add origin https://github.com/USER/REPO.git && git push -u origin main
```

3. On GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**.
4. It goes live at `https://USER.github.io/REPO/` in a minute or two.

`.nojekyll` is already in the repo so GitHub serves the files as-is.

### A real domain

Once she has one (`casabonitacleaning.com` or similar — about $12/year):

1. Add a file named `CNAME` at the top of the repo containing just the domain.
2. At the registrar, point the DNS at GitHub Pages
   (`A` records to `185.199.108–111.153`, plus a `CNAME` for `www`).
3. GitHub issues the HTTPS certificate automatically.

### Moving off GitHub later

Nothing here is GitHub-specific. The whole folder is plain files, so it drops
onto Netlify, Cloudflare Pages, Vercel, or ordinary web hosting by upload —
drag the folder in and it works. That's the main reason the site has no build
step: there's nothing to get stranded on.

---

## The scroll animation

The reveals are **scrubbed, not timed**. Each element's progress through the
animation is a number from 0 to 1 derived from where it currently sits on
screen, recalculated every frame while the page scrolls. Scrolling down plays it
forward; scrolling up plays the same frames backward. Scroll fast and it plays
fast — there's no clock to outrun, which is the whole point: a timed animation
loses the race when the element leaves the screen before the timer ends.

Three numbers at the top of the reveal section in `assets/js/app.js`:

```js
const FADE_START = 0.95;   // share of screen height where the fade begins
const FADE_END   = 0.62;   // ...and where it's complete
const STAGGER_PX = 36;     // how far apart cascading items are, in pixels
```

Widen the gap between `FADE_START` and `FADE_END` for a slower, longer fade;
narrow it for a snappier one. Raise `STAGGER_PX` for a more pronounced cascade
across a row of cards.

Two things deliberately don't scrub: anything on the **first screen** (it would
be stranded part-faded, since you can't scroll above the top of the page) and
anything too close to the **bottom** for the page to finish the fade. Those are
pinned fully visible and get their entrance from the one-time intro animation
that plays on load. The `.intro` class on `<body>` drives that, and the script
removes it after 1.4s.

Under `prefers-reduced-motion` none of this runs — everything is simply visible.

---

## Before / after sliders

Any `<figure>` with `data-compare` becomes a slider. It needs two images —
`.cmp-before` and `.cmp-after` — plus the handle and the range input; copy an
existing one from the gallery in `index.html` rather than writing it from
scratch.

The mechanism is deliberately boring: both photos stack at full size, the
"after" one is clipped to `--cmp` percent of the width, and a real
`<input type="range">` sits invisibly on top driving that number. Using a real
range input means keyboard support, touch dragging, and screen-reader behaviour
come for free instead of being hand-rolled and half-broken.

Each slider nudges itself off centre once when it first scrolls into view, so
people can tell it's draggable. That hint is skipped under
`prefers-reduced-motion`.

---

## The availability calendar

Lives above the quote form and shows the next 14 days. It's driven by
`assets/js/availability.js`, which is written to be edited by someone who
doesn't code — days are open by default, so only the ones that fill up or close
need listing.

It never shows times, only how many slots remain, so the schedule itself stays
private.

It is **manual**. There's no booking system behind it, and it will be wrong the
moment it isn't updated. Deleting the `<div class="avail">` block from
`index.html` removes it cleanly if it becomes a chore.

---

## The reviews carousel

The reviews sit in a manual carousel — it never moves on its own. Arrows, dots,
arrow keys, and swipe all work, and it wraps around at both ends.

**It counts itself.** To add a review, copy one `<figure class="quote">` block
inside `<div class="rail">` and edit the text. The dots renumber, the arrows
recalculate, and nothing else needs touching. Three cards show at a time on a
desktop, two on a tablet, one on a phone; if you end up with fewer reviews than
fit on screen, the arrows and dots hide themselves automatically.

To change how many show at once, edit `--per` in the `.carousel` rules in
`styles.css` (and in the two media queries below it).

The same markup works for any other section you'd want to make scrollable
later — give a wrapper `class="carousel"`, put the cards in a `.rail` inside it,
and the script picks it up.

---

## Language

The site is bilingual. **English lives in `index.html`** so the page reads
correctly and search engines index it even without JavaScript. **Spanish lives
in `assets/js/i18n.js`**, keyed to the `data-i18n="..."` attributes in the HTML.

- To change an English string → edit `index.html`.
- To change a Spanish string → find its key in `i18n.js`.
- To add a new translatable element → give it `data-i18n="some.key"` in the
  HTML and add `"some.key": "…"` to `i18n.js`.

The toggle remembers the visitor's choice. First-time visitors whose browser is
set to Spanish land on Spanish automatically.

---

## Accessibility and performance notes

- Reveal animations are disabled entirely under `prefers-reduced-motion`.
- All interactive elements are keyboard reachable; there's a skip link.
- Images are lazy-loaded below the fold and carry width/height so the page
  doesn't jump while loading.
- One external request (the display font). Delete the two `<link>` tags in
  `index.html` and the `--font-display` line in `styles.css` to make the site
  fully self-contained.

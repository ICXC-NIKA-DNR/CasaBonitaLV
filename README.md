# Casa Bonita LLC — website

A static, dependency-free marketing site for a home cleaning business.
Three files do all the work. No build step, no npm, no framework.

```
index.html              all the content and structure
assets/css/styles.css   all the styling, including both palettes
assets/js/i18n.js       the Spanish translations
assets/js/app.js        scroll animations, language toggle, the quote form
assets/img/             placeholder images (swap these for real photos)
CONTENT.md              what to collect from her and exactly where it goes
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

## Picking a palette

The site ships with two complete looks. A temporary switcher sits in the
bottom-right corner so you can compare them on the real page:

- **Warm** — off-white, terracotta, serif headings. Reads "home".
- **Fresh** — cool white, teal, sans headings. Reads "clean".

You can also force one with a URL: `?palette=warm` or `?palette=fresh`.

**Once you've chosen**, lock it in — three deletions:

1. `index.html` — delete the `<div class="palette-switch">…</div>` block near
   the bottom, and set `data-palette="…"` on the `<html>` tag to your choice.
2. `assets/css/styles.css` — delete the losing palette's `[data-palette="…"]`
   block and the `.palette-switch` rules.
3. `assets/js/app.js` — delete the `palettePreview()` block at the bottom.

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

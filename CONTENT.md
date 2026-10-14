# What to collect from your mom, and where it goes

Everything on the site right now is a **placeholder**. Nothing here is a real
fact about Casa Bonita — it all needs to be replaced before the site goes live.

Work down this list. Each item says exactly which file to open.

---

## 1. The essentials (do these first)

| What | Current placeholder | Where it lives |
|---|---|---|
| Phone number | `(555) 123-4567` | `index.html` (7 places) + `assets/js/app.js` |
| Email | `hello@casabonita.example` | `index.html` (3 places) + `assets/js/app.js` |
| Service area towns | "Your City", "Neighboring Town", … | `index.html` → `<section id="areas">` |
| Hours | Mon–Sat, 8am–6pm | `index.html` → contact section + footer |

**Fastest way to do the phone number:** find-and-replace across the whole folder.

```bash
cd ~/Claude/casa-bonita && grep -rl '555-123-4567\|(555) 123-4567\|+15551234567' . --exclude-dir=.git
```

Then replace all three spellings:
- `(555) 123-4567` — what people read
- `+15551234567` — what `tel:` and `sms:` links dial (no spaces, no dashes)
- `555-123-4567` — the one inside the structured-data block at the bottom of `index.html`

Same idea for the email. Also update the Spanish copies in `assets/js/i18n.js`
(search for `555` there too).

---

## 2. Photos

Eight photo slots. Replace the files in `assets/img/` — **keep the same
filenames** and nothing else has to change.

| File | Used for | Best shape |
|---|---|---|
| `placeholder-hero.svg` | Big photo at the top | Tall / portrait |
| `placeholder-about.svg` | Her, or the team | Tall / portrait |
| `placeholder-1.svg` … `-6.svg` | The "Our work" grid | Wide / landscape |

If you swap in `.jpg` files instead of `.svg` (recommended — real photos should
be JPEG), update the `src="..."` lines in `index.html` to match the new
extension. There are 8 of them; search for `placeholder-`.

**Photo tips for her:**
- Shoot in daylight, blinds open, lights on.
- Same angle before and after makes the strongest pair.
- Kitchens, bathrooms, and floors sell the best — those are what people judge.
- No faces, no mail, no family photos visible. Get the homeowner's OK in writing
  (a text message is fine) before any photo of their home goes online.
- Resize to about 1600px wide before uploading so the site stays fast.

---

## 3. Reviews

Five placeholder reviews live in `index.html` → `<section id="reviews">`, inside
`<div class="rail">`. For each one you need: the quote, a first name + last
initial, and what service they got.

The carousel counts itself, so you can have any number:

- **To add one** — copy a whole `<figure class="quote">…</figure>` block, paste
  it after the last one, and edit the text. Give it the next number
  (`rev6.q`, `rev6.n`, `rev6.m`) in its `data-i18n` attributes.
- **To remove one** — delete the whole `<figure>` block.

The dots and arrows renumber themselves either way. If you end up with three or
fewer, the arrows and dots disappear on their own and it becomes a plain row.

Spanish versions go in `assets/js/i18n.js` under `rev1.q` … `rev5.q`. If a
review was written in English, it's honest to show a translation on the Spanish
side — just make sure it says the same thing.

**Only use real reviews.** All five here are invented filler. Two real reviews
beat five invented ones, and invented ones are the kind of thing that gets a
business in trouble.

If she has a Google Business profile, the "Read more reviews on Google →" link
below the carousel needs her real Google link — right now it points nowhere
(`href="#"`).

---

## 4. Prices

In `index.html` → `<section id="services">`, each card ends with a `price` line.
Current numbers are **made up**. Replace with her real starting prices, or
change them all to "Free quote" if she'd rather not publish numbers.

Spanish: `svc1.price` … `svc6.price` in `assets/js/i18n.js`.

Also check the six services themselves actually match what she offers — delete
any card she doesn't do, and the add-on chips below them.

---

## 5. Facts in the "About" and stats sections

These are currently invented and **must** be checked before launch:

- `8+ years`, `500+ homes` — the two numbers in the trust strip near the top
- "Registered LLC & fully insured" — true, but confirm the insurance part
- "Background-checked, long-term staff"
- The whole About story (`about.p1`, `about.p2`)
- "Casa Bonita LLC" — confirm the exact legal name on the LLC paperwork,
  including whether it's "LLC" or "L.L.C."

---

## 6. Before going live

- [ ] Every `(555)` and `example` string is gone (`grep -rn '555\|example' . --exclude-dir=.git`)
- [ ] Real photos in place
- [ ] Only real reviews
- [ ] Prices confirmed with her
- [ ] The two stat numbers confirmed
- [ ] `<link rel="canonical">` and `og:url` in `index.html` point at the real address
- [ ] Spanish side proofread by her (machine-assisted Spanish is a good start, not a finish)

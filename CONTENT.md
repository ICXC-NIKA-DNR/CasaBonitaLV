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

## 2. Photos — now mostly BEFORE / AFTER pairs

Most photo slots are sliders: two photos of the same spot, and the visitor
drags between them. **The two shots in a pair must be taken from the same
position**, or the slider looks broken instead of impressive. Tell her to take
the "before" shot from a spot she can stand in again — a doorway corner works
well — and take the "after" from exactly there.

Replace the files in `assets/img/`, **keeping the same filenames**, and nothing
else has to change.

| Files | Used for | Shape |
|---|---|---|
| `placeholder-hero-before.svg` + `-after.svg` | Big slider at the top of the page | Tall / portrait |
| `ba-kitchen-before.svg` + `-after.svg` | "Our work" tile 1 | Wide |
| `ba-bath-before.svg` + `-after.svg` | "Our work" tile 2 | Wide |
| `ba-floor-before.svg` + `-after.svg` | "Our work" tile 3 | Wide |
| `ba-oven-before.svg` + `-after.svg` | "Our work" tile 4 | Wide |
| `placeholder-about.svg` | Her, or the team (single photo) | Tall / portrait |

That's 11 photos. If she only has four good pairs to start, delete a whole
`<figure>` block from the gallery in `index.html` — the grid reflows on its own.

If you swap in `.jpg` files instead of `.svg` (recommended — real photos should
be JPEG), update the `src="..."` lines in `index.html` to match. Search for
`ba-` and `placeholder-`.

**Photo tips for her:**
- Shoot in daylight, blinds open, lights on. Same light for both shots.
- Same spot, same angle, same framing. This matters more than photo quality.
- Kitchens, bathrooms, ovens, and floors sell the best — those are what people
  judge a cleaner on.
- No faces, no mail, no family photos visible. Get the homeowner's OK in writing
  (a text message is fine) before any photo of their home goes online.
- Resize to about 1600px wide before uploading so the site stays fast.

---

## 2b. The availability calendar

`assets/js/availability.js` drives the "Next two weeks" calendar near the quote
form. **This is the one file that needs regular updating**, and the file itself
explains how — it's written for a non-programmer.

The design keeps the work minimal: every weekday is assumed open with the normal
number of slots, so only the days that are **full, partly booked, or closed**
need listing.

Be honest with yourself about whether this will get kept up. A calendar showing
free slots on a day that's actually full is a worse first impression than no
calendar at all. If it starts going stale, delete the `<div class="avail">`
block from `index.html` and the section simply disappears.

The example dates in the file right now are **made up** and must be replaced.

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

The first card has a **One-time / Recurring** switch with two prices. The whole
point of it is the difference between those two numbers, so make sure the
recurring price is genuinely lower — otherwise the note under it ("every visit
from then on is cheaper") isn't true and the card undercuts itself.

Spanish: `svc1.oncePrice`, `svc1.repeatPrice`, `svc2.price` … `svc6.price` in
`assets/js/i18n.js`.

Also check the six services themselves actually match what she offers — delete
any card she doesn't do, and the add-on chips below them.

---

## 5. Facts in the "About" and stats sections

These are currently invented and **must** be checked before launch:

- `8+ years`, `500+ homes`, `2h typical reply` — the numbers in the trust strip
- "Registered LLC, licensed to operate"
- "The same small team every visit"
- The whole About story (`about.p1`, `about.p2`)
- "Casa Bonita LLC" — confirm the exact legal name on the LLC paperwork,
  including whether it's "LLC" or "L.L.C."

### On insurance

Insurance is deliberately **not** used as a selling point anywhere in the sales
copy — no hero badge, no stat, no bullet. It appears once, in small text in the
dark footer strip, phrased as "available on request."

That was a decision, not an oversight: advertising coverage up front is what
attracts staged-damage claims, and the customers who genuinely care about it
will go looking for it. The footer line still needs to be true — confirm the
policy is current before publishing, and edit or remove the sentence if it
isn't.

The business licence stays visible, since that's the part that signals a real
registered company rather than cash-in-hand work.

---

## 6. The two legal pages

`privacy.html` and `terms.html` are **drafts written in plain language, not
legal advice.** Every blank that still needs filling is marked in bright yellow
on the page, so open both in a browser and look for the highlights:

- The date at the top of each
- City and state
- How long quote requests are kept
- Cancellation notice period and late-cancellation fee
- Accepted payment methods
- The damage reporting window
- Governing state

**Have a lawyer read `terms.html` before it goes live.** The damage and
"what we don't do" sections are the ones that actually matter if something
goes wrong, and template wording is not a substitute for someone who knows the
rules in her state. A one-off consultation is cheap next to a dispute.

The privacy policy is lower risk — it mostly describes what the site genuinely
does, which right now is very little. Two things would make it wrong, so update
it if either happens:

1. **The quote form starts posting to a service** (Formspree, Web3Forms, your
   own backend). The policy currently says no third party sits in between.
2. **Analytics get added.** The policy currently says there is no tracking of
   any kind.

Both pages are English-only. A Spanish version is offered "on request" rather
than machine-translated, because an unreviewed translation of legal wording can
say something she never agreed to. Translate them properly once the English is
final.

---

## 7. Before going live

- [ ] Every `(555)` and `example` string is gone (`grep -rn '555\|example' . --exclude-dir=.git`)
- [ ] No yellow `[BLANKS]` left on `privacy.html` or `terms.html`
- [ ] A lawyer has read `terms.html`
- [ ] Real before/after photo pairs in place, shot from the same spot
- [ ] Written permission from each homeowner whose home appears
- [ ] Only real reviews
- [ ] Prices confirmed, and the recurring price is actually lower than one-time
- [ ] Availability calendar reflects her real schedule — or has been removed
- [ ] The trust-strip numbers confirmed
- [ ] The footer insurance sentence is accurate (or deleted)
- [ ] `<link rel="canonical">` and `og:url` in `index.html` point at the real address
- [ ] Spanish side proofread by her (machine-assisted Spanish is a good start, not a finish)

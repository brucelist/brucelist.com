# Website Update Guide — brucelist.com

How to keep the site current. Every updatable thing on the site is listed below with: where it lives, where the data comes from, how often to refresh, and whether it can be automated by a scheduled remote agent.

## Quick start — interactive update session

Paste this prompt to your AI assistant to start an update session:

> Read `refresh.md`. Ask me which item(s) I want to update from the menu (1–10 or "all"). For each chosen item, walk me through it: tell me what data you need, fetch what you can yourself (e.g. from CREB), and edit the files. Open a PR — don't push to main. When done, summarize what changed.

The menu the assistant will offer:

```
What would you like to update? (pick numbers, comma-separated, or "all")

  1.  Calgary Market Snapshot       (monthly — CREB)
  2.  Neighborhood page stats        (quarterly — CREB by community)
  3.  Years of experience            (annual — bump "20 years" badge + copy)
  4.  Testimonials                   (as new reviews arrive — Google reviews)
  5.  Recently sold listings         (monthly — your own deals)
  6.  Featured listings              (weekly — current listings on MLS)
  7.  Photos / headshot              (as needed)
  8.  Contact info                   (rare — phone/email/address/brokerage)
  9.  Buyer's Guide PDF              (annual)
  10. GA4 / GTM / Formspree IDs      (one-time setup)

  all  — walk through every applicable item
```

---

## Remote agents (automate the recurring ones)

The recurring items in the menu (1, 2, 4, 5, 6) can be handled by **scheduled remote agents** — AI sessions that run in the cloud on a cron schedule, do the work, and open a PR for you to review/merge. You never touch the placeholders by hand.

How they work:
- Run on a cron schedule (e.g. `0 9 5 * *` = 9am on the 5th of each month).
- Branch from `main`, fetch fresh data, edit files, push branch, open PR.
- You get a notification → review the PR → merge. Nothing ships without your click.
- If the data source breaks (CREB changes layout, etc.), the agent opens a PR saying "I couldn't parse this — here's what I saw" rather than pushing wrong numbers.
- Cost: pennies to a few dollars per run. Monthly agent is cheap.

To create one, run:

```
/schedule
```

…and tell it which item(s) from this guide to schedule. Suggested cadences are noted on each item below.

---

## 1. Calgary Market Snapshot

**Where:** `index.html` — section `<section id="market-snapshot">` (~line 340)
**Source:** https://www.creb.com/Housing_Statistics/Daily_Housing_Summary/
**Frequency:** monthly (CREB releases monthly summaries on the 1st–3rd)
**Automatable:** ✅ recommended — `/schedule` cron `0 9 5 * *` (9am on the 5th)

Update these seven values + the "Last updated" date:

| Value | `data-stat` attribute |
| --- | --- |
| Benchmark Price | `benchmark-price` |
| Year-over-Year change | `yoy-change` |
| Sales (units this month) | `sales` |
| New Listings | `new-listings` |
| Median Days on Market | `days-on-market` |
| Months of Supply | `months-supply` |
| Sale-to-List Ratio | `sale-to-list` |

Also update `data-market-updated` with the current month/year (e.g. `April 2026`).

If the YoY change is negative, also swap the CSS class on that element from `market-stat-up` to `market-stat-down` (color flips green → red).

---

## 2. Neighborhood page stats

**Where:** `neighborhoods/tuscany.html`, `beltline.html`, `aspen-woods.html`, `auburn-bay.html`
**Source:**
- Stats: https://www.creb.com/ — community-level reports
- Schools: https://www.cbe.ab.ca (public) and https://www.cssd.ab.ca (Catholic) — rarely change
- Auburn Bay HOA fees: https://abralife.ca
- Beltline rents: https://www.cmhc-schl.gc.ca rental market reports

**Frequency:** quarterly for stats; annually for schools/HOA
**Automatable:** ✅ stats yes — `/schedule` cron `0 9 5 1,4,7,10 *` (Jan/Apr/Jul/Oct 5th). Schools/HOA: leave manual — they almost never change.

Each neighborhood page has stat cards marked `<!-- TODO: pull from CREB -->`. Replace the values and remove the `(placeholder)` italicized line under each one.

---

## 3. Years of experience

**Where:**
- `index.html` hero — currently says nothing explicit but credentials list says "Calgary-based REALTOR® since 2002"
- `assets/images/LS20clr.png` — the "20 years" badge image (will need a new image for 21+ years)
- Body copy: "I've been working in the Calgary market for over 20 years"

**Source:** the calendar
**Frequency:** annually, on the anniversary of license (or just January 1)
**Automatable:** ✅ trivial — `/schedule` cron `0 9 1 1 *` (9am Jan 1)

Things that may need bumping each year:
- "over 20 years" → "over [N] years" in `index.html` body copy.
- The `LS20clr.png` badge — replace with a new badge image (commission a designer or use a placeholder).
- JSON-LD `foundingDate` is fixed at `"2002"` — leave alone, it's the start year.

---

## 4. Testimonials

**Where:** `index.html` — inside `<div class="testimonial-slider">` (~line 184). Each testimonial is a `<span class="single-cat">`.
**Source:** Google Business Profile reviews (`google.com/maps?cid=...` for Bruce's listing) or direct client emails.
**Frequency:** add new ones as they arrive; pull oldest if slider gets > 10 items.
**Automatable:** ⚠️ partially — fetching Google reviews requires an API key (Google Places API). Without it, this stays manual. With it, schedule weekly.

Format: keep first-person language, end with `<br />Client Name.` (first name + last initial only — see existing entries).

Long-term improvement: pull testimonials out of the hero slider into a dedicated section with star ratings.

---

## 5. Recently sold listings

**Where:** ⚠️ this section does not yet exist. Adding it is recommended.
**Source:** Bruce's own deal log; CREB's sold-data feed (paid).
**Frequency:** monthly — show last 3–6 sold properties with sale price, list price, days on market, neighborhood.
**Automatable:** ✅ once Bruce maintains a `sold.json` data file in the repo, an agent can render it into the page on a schedule.

To add this section:
1. Create `data/sold.json` with an array of `{ address, neighborhood, listPrice, salePrice, daysOnMarket, soldDate }`.
2. Add a "Recently Sold" section to `index.html` between the "Selling" and "Why Choose" sections.
3. Render via small inline script reading `data/sold.json`.

Until built, skip this menu item.

---

## 6. Featured listings

**Where:** ⚠️ does not yet exist. Adding it requires either a manual data file or an IDX provider.
**Source:**
- Manual: Bruce maintains `data/listings.json`.
- Live MLS: integrate an IDX provider (iHomeFinder / IDX Broker / Real Geeks — ~$80–150/mo). This is the bigger long-term upgrade — see `plan.md` priority #2.
**Frequency:** weekly if manual, real-time if IDX.
**Automatable:** depends on which path. IDX is real-time by definition; manual file can be PR-updated by an agent if Bruce dumps a CSV.

Until built, skip this menu item.

---

## 7. Photos / headshot

**Where:** `assets/images/bruce.png` (used in hero, about, and calling card sections)
**Source:** professional headshot
**Frequency:** every 3–5 years or whenever Bruce wants to refresh
**Automatable:** ❌ no — human decision

When updating:
- Save the new file at `assets/images/bruce.png` (same filename = no HTML changes needed).
- Also generate a 1200×630 version for `og:image` if you want a different social-share image; otherwise the existing `bruce.png` is reused as the OpenGraph image.

---

## 8. Contact info

**Where:**
- `index.html` header (~line 148): phone + email
- `index.html` calling-card section (~line 712): full address + brokerage
- JSON-LD schema (~line 53): `telephone`, `email`, `address`
- WhatsApp button (search for `wa.me`): phone in `+14038912345` E.164 format
- `tel:` and `mailto:` links throughout — search and replace
- `home-valuation.html` and all `neighborhoods/*.html` — same fields appear in the calling-card footer

**Source:** Bruce
**Frequency:** rare — only if phone/email/brokerage changes
**Automatable:** ❌ no — sensitive, manual

⚠️ NAP consistency: whatever appears here MUST match Google Business Profile exactly (name, address, phone). Mismatches hurt local SEO. Update both at once.

---

## 9. Buyer's Guide PDF

**Where:** the buyer-guide email-capture section in `index.html` (~line 637) currently captures emails but has no PDF to deliver.
**Source:** create a PDF (Bruce + a designer, or a Canva template). Topics: Calgary buyer's checklist, costs, timeline, what to expect.
**Frequency:** annual content review.
**Automatable:** ❌ no — content authoring.

To wire up delivery:
1. Save PDF to `assets/files/calgary-buyers-guide.pdf`.
2. Configure Formspree to send an autoresponder email with the PDF as an attachment, OR
3. Update the form's success handler to redirect to the PDF download URL.

---

## 10. GA4 / GTM / Formspree IDs

**Where:**
- GA4 ID `G-XXXXXXXXXX` — `index.html` head (3 occurrences, marked with `<!-- TODO -->`)
- GTM ID `GTM-XXXXXXX` — `index.html` head + body noscript (3 occurrences)
- Formspree form ID `YOUR_FORM_ID` — `index.html` (3 places) and `home-valuation.html` (1 place)

**Source:**
- GA4: create a property at https://analytics.google.com → Admin → Data Streams → copy measurement ID.
- GTM: create a container at https://tagmanager.google.com → copy container ID.
- Formspree: sign up at https://formspree.io → New Form → copy form ID. (Free tier covers low volume; one form ID can be reused across all four forms or you can split.)

**Frequency:** one-time setup. Critical — until done, no leads or analytics are captured.
**Automatable:** ❌ no — credentials.

After replacing, test by:
1. Submitting a contact form → check Formspree dashboard for the entry.
2. Opening the site in incognito → check GA4 Realtime report for the visit.
3. Clicking a `tel:` link → confirm `phone_click` event fires in GA4 Realtime.

---

## Suggested schedule (if automating everything appropriate)

| Cron | What | PR review effort |
| --- | --- | --- |
| `0 9 5 * *` | Market snapshot (#1) | < 1 min |
| `0 9 5 1,4,7,10 *` | Neighborhood stats (#2) | 2–3 min |
| `0 9 1 1 *` | Years-of-experience bump (#3) | < 1 min |
| `0 9 * * 1` | Google reviews refresh (#4, requires API key) | 1–2 min |
| `0 9 5 * *` | Recently sold render (#5, once data file exists) | < 1 min |
| `0 9 1 */3 *` | Lighthouse audit + perf-fix PR | 5–10 min |
| `0 9 1 */3 *` | Broken-link sweep | 1 min |

Total: ~30 min/quarter of PR review for a fully maintained site.

# TODO

Things to do later, with full instructions so you (or anyone helping you) can pick them up cold.

---

## Set up Google Analytics 4 + Tag Manager

**What it is:** GA4 measures what visitors do on the site. GTM is a container that lets you add/manage tags (analytics, ads, pixels) without editing code. The site is wired for both with placeholder IDs — events fire automatically once you fill them in.

**Time:** 15–20 minutes.

### Steps

**GA4 first:**

1. Go to https://analytics.google.com → Admin (gear icon) → Create → **Account**. Account name: "Bruce Lotfi". Continue.
2. Create **Property**: name "brucelist.com", time zone Calgary, currency CAD.
3. Create **Data Stream** → Web → URL `https://brucelist.com`. Stream name: "brucelist.com web".
4. Copy the **Measurement ID** that looks like `G-XXXXXXXXXX` (real one, ten characters after `G-`).
5. In the repo, find/replace `G-XXXXXXXXXX` (3 places in `index.html`).

**Then GTM:**

1. Go to https://tagmanager.google.com → Create Account → Account name "Bruce Lotfi", Container name "brucelist.com", target Web.
2. Copy the **Container ID** that looks like `GTM-XXXXXXX`.
3. Find/replace `GTM-XXXXXXX` (3 places in `index.html` — head + body noscript).

### Verify (after pushing)

1. Open https://brucelist.com in incognito mode.
2. In another tab, open GA4 → Reports → Realtime — you should see yourself as 1 active user within ~30 seconds.
3. Click the phone number CTA → in GA4 Realtime → Event count panel → look for `phone_click` event. Same for `email_click` and (after a form submit) `lead_submit`.

### Recommendation: GA4 vs GTM

- If you'll only ever have GA4 and nothing else, you can skip GTM — GA4 alone handles your needs.
- GTM becomes valuable when you want to add Meta Pixel, Google Ads conversion tracking, LinkedIn Insight Tag, etc. without touching code each time.
- Since the placeholders are already in for both, easiest is to fill both in now.

### Optional polish

- In GA4 → Admin → Events → mark `phone_click`, `email_click`, `lead_submit`, and `callback_request` as **Conversions** (toggle on each). This makes them show up as conversions in reports — critical for understanding lead flow.
- Connect GA4 to **Google Search Console** (GA4 → Admin → Search Console Links) so you see which queries bring people to the site.

When you have the IDs, paste them and someone can do the find/replace + push in 30 seconds.

---

## Other things on the radar

(Move these into their own sections when you're ready to tackle them.)

- Buyer's Guide PDF — write/design and add to `assets/files/`, then configure Formspree autoresponder to deliver it.
- "Recently Sold" section — needs a list of 3–6 sold deals.
- Verify neighborhood page stats (CREB), schools (CBE/CCSD), Auburn Bay HOA fees, Beltline rents.
- New "20 years" badge image — bump the count when you have it redesigned.
- Pro 60-second intro video for the homepage.
- Google Reviews widget on the homepage.
- IDX integration (~$80–150/mo) for live MLS search.
- Confirm Formspree's first-time form-confirmation email at `bruce@brucelist.com` is clicked (one-time activation step).

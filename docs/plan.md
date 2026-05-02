# brucelist.com — Improvement Plan

Goal: turn a static brochure page into a lead-generating site for Bruce Lotfi's Calgary real estate practice.

## Priorities (ordered by ROI)

### 1. Lead capture (highest direct ROI)
- [ ] Sticky "Get a Free Home Evaluation" form (name, email, phone, address). Submits via Formspree (or Web3Forms / Getform — picked because the site is on GitHub Pages and has no backend).
- [ ] Multi-step "What's My Home Worth?" flow (address → beds/baths → contact). Multi-step forms convert 2–3× better.
- [ ] Buyer lead magnet: "Free Calgary Buyer's Guide" PDF, email-gated.
- [ ] WhatsApp / SMS click-to-chat button (important for Farsi-speaking clientele).
- [ ] Wire `tel:` and form submits as conversion events.

### 2. Property search / IDX
- [ ] Integrate CREB MLS via an IDX provider (iHomeFinder, IDX Broker, Real Geeks — ~$80–150/mo).
- [ ] "Featured Listings" section even with a hand-curated 3–6 properties.
- _Note: requires a paid provider account; out of scope for the agent team but listed for prioritization._

### 3. SEO & content
- [ ] OpenGraph + Twitter Card meta tags.
- [ ] `RealEstateAgent` schema.org JSON-LD.
- [ ] `sitemap.xml`, `robots.txt`, canonical URL.
- [ ] Neighborhood landing pages: Tuscany, Beltline, Aspen Woods, Auburn Bay (templated).
- [ ] Monthly Calgary market report blog (templated from CREB data).
- [ ] Farsi-language version (`/fa/`) — strong differentiator.

### 4. Trust & social proof
- [ ] Pull testimonials out of the hero slider into a dedicated section with stars / names.
- [ ] Embed Google reviews widget.
- [ ] "Recently Sold" section with sale-vs-list-price highlights.
- [ ] 60-second intro video on the homepage.

### 5. Tracking
- [ ] Google Analytics 4 + Google Tag Manager.
- [ ] Conversion events on form submits + `tel:` clicks.
- [ ] Meta Pixel for paid social (if planned).

### 6. Performance & polish
- [ ] `loading="lazy"` on images.
- [ ] Lighthouse audit pass.
- [ ] NAP consistency: footer with full address, hours, brokerage info matching Google Business Profile.
- [ ] RECA license verification link.

### 7. Revenue-adjacent
- [ ] Mortgage calculator widget (on-page interactive).
- [ ] Newsletter capture (build an email list for nurture).
- [ ] Formal affiliate links/disclosure for mortgage broker, inspector, lawyer referrals.

## Agent team (this round)

Independent slices dispatched in parallel via git worktrees. Each produces its own branch for review.

| Agent | Branch | Scope |
| --- | --- | --- |
| `lead-capture` | `feat/lead-capture` | Contact form + home-valuation multi-step form + WhatsApp button + buyer-guide email gate. Formspree placeholder action. |
| `seo` | `feat/seo` | OG / Twitter meta, JSON-LD `RealEstateAgent`, sitemap.xml, robots.txt, canonical. |
| `neighborhoods` | `feat/neighborhoods` | 4 templated neighborhood pages + index links. |
| `analytics-perf` | `feat/analytics-perf` | GA4 + GTM placeholders, conversion events, `loading="lazy"`, mortgage calculator widget. |

Out of scope for this round: IDX integration, video production, Google reviews API key, Farsi translation, blog content authoring.

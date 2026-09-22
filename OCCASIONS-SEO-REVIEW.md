# Occasion pages and SEO review — 19 September 2026

## Delivered

The occasion catalogue now contains 22 distinct pages. Seven new routes cover date night, romantic getaways, surprise gifts, marriage proposals, honeymoons, engagement celebrations and family days out. Graduation already had a route and was improved in place.

The desktop Occasions dropdown and mobile disclosure list all 22 pages in four groups. Links are present in server-rendered HTML; native disclosure interaction supports keyboard access. Escape closes an open occasion menu, focus leaves it normally, and outside clicks dismiss it. The directory has matching group anchors. Each page links to a relevant existing Dubai location page, related occasions and the actual rental fleet.

Every occasion now includes a distinct Dubai planning section, vehicle-choice guidance, a contextual question and answer, live eligible vehicle selection and an inline rental request preserving the occasion in its notes. Copy explains relevant logistics and distinguishes car rental from unconfirmed venue, chauffeur, production, gift or event services. No venue partnership, fixed journey time, guaranteed availability, earnings, fake review or invented rental package was added.

## Google guidance reviewed from local records

No web search or external browsing was used. The project contains Google Search Central and Search Status Dashboard snapshots saved on 15 September 2026 under `.local/page-research/`. They were read for this review:

- `google-core-latest.txt`: core-update guidance, substantive improvements, useful content and Search Console assessment.
- `google-helpful.txt`: original value, people-first purpose, accurate authorship and avoiding artificial word counts or false freshness.
- `google-spam-latest.txt`: doorway abuse, scaled content abuse, keyword stuffing, scraping and link-spam guidance.
- `google-incident-2.txt`: May 2026 core update, May 21–June 2.
- `google-incident-1.txt`: June 2026 spam update, June 24–26.
- `google-incident-0.txt`: August 2026 spam update, August 18–21.
- `google-updates.txt`: ranking-update history as captured on September 15.

Official reference URLs recorded in the project:

- https://developers.google.com/search/docs/appearance/core-updates
- https://developers.google.com/search/docs/essentials/spam-policies
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history

The August update is the most recent spam update in the saved history. Changes after September 15 were not independently checked; live access remains disabled. Core updates are not a page-level certification or a fixed keyword checklist. This review does not predict rankings.

## SEO implementation and editorial decisions

- Kept a single canonical route per occasion; no synonym pages such as separate romantic-dinner and date-night pages.
- Added concise, unique search descriptions and descriptive titles.
- Added Open Graph and Twitter preview images using each occasion's own media.
- Kept one H1 per detail page and structured the directory with group headings and subordinate card headings.
- Added WebPage structured data alongside breadcrumbs, matching the visible title, description, URL and image. No fabricated ratings, prices or special rich-result eligibility.
- Kept all occasion routes in the existing generated sitemap and excluded private application/admin routes.
- Added distinct, useful local advice rather than repeating generic rental prose with swapped keywords.
- Did not alter dates merely to imply fresh information or claim an expert review that did not happen.
- Retained live fleet selection and a useful booking form on every page, rather than requiring another intermediary page to complete the request.
- English editorial text is identified as English. Translation coverage for new labels and copy still needs language review.

## Image provenance

Eight new Dubai-inspired illustrations were generated with the built-in image_gen tool. They cover date night, a romantic stay, a surprise gift, weddings, graduations, production shoots, family outings and business arrivals. Each generated asset was inspected, resized to 1440 pixels wide and saved as WebP (approximately 166–235 KiB each).

Final assets and exact generation prompts are in `public/occasions/` and `public/occasions/generation-notes.json`. Original PNG files are archived in `.local/occasion-originals/`; the tool originals remain in the Codex generated-images directory.

Generated scenes are identified in alt text and on the image-credits page. Visible AI labels on cards and detail captions were removed at the owner's request. They are not actual venue photographs, customer events or evidence of vehicles available to rent. The illustrated skyline layouts are not geographic documentation. Actual offered vehicles remain shown through their existing fleet galleries.

Other occasion images use existing credited Dubai skyline, marina, Palm Jumeirah and Emirates Hills photographs. No additional unverified official-property photographs were introduced. The broader project's previously documented property-photo and commercial-font permission issues remain relevant to a future public launch.

## Verification and limits

- Existing repository tests passed; new checks cover all required topics, unique descriptions, valid Dubai location links, every image's local path and successful decoding, generated-image labels and one sitemap entry per occasion.
- TypeScript and the production build passed.
- Local Semgrep: three rules across 91 TypeScript files, zero findings. This checks configured dynamic-code, SQL and cryptography patterns, not comprehensive application security.
- No new dependencies, secrets, outbound customer messages or public deployment.
- Browser navigation, responsive layout, rendered metadata, accessibility and live indexing were not retested because browser access remains disabled. The existing landing-page browser suite was updated for the expanded catalogue and remains available when browsing is authorised.
- Search Console, production crawlability, domain configuration, measured Core Web Vitals, current Google announcements and business facts were not verified. The preview remains loopback-only at http://127.0.0.1:43117.


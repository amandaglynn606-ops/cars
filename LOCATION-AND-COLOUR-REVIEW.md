# Location, navigation and vehicle colour review — 20 September 2026

## Delivered

- Locations dropdown on desktop and mobile, grouped into Dubai, Sharjah, Fujairah, Ajman, Umm Al Quwain, Ras Al Khaimah and Abu Dhabi. Each emirate links to its overview and every listed area. The catalogue now contains 74 location pages, including 25 additional districts and destinations outside Dubai. This is a curated service-planning directory, not an exhaustive gazetteer or a claim of branches at these addresses.
- Canonical location URLs follow `/dubai-marina-luxury-car-rental`. Known legacy `/locations/{slug}` URLs redirect permanently. Unknown location names return not found. Navigation, occasion links, related locations and the sitemap use the new URLs. Each emirate overview links to all its listed districts.
- Brands have their own Car brands dropdown; the Fleet menu contains categories and vehicles. Decorative photo tags and gallery counters have been removed. Directory titles and vehicle counts appear below photos. Attribution is retained on the separate image-credits page.
- Single-car pages display one photo with colour buttons. There are no thumbnail grids, photo arrows or All photos control. A selected colour chooses an actual matching exterior photo. Fleet cards use the same preview selection logic.

## Visual colour review

All 777 local photographs across 115 seed and live vehicle records were inspected in 17 contact sheets; ambiguous examples were also opened at larger size. This includes unpublished records without changing their publication status. The review identified 144 photographed colour choices and 529 exterior images suitable for those groups. Interior and other detail images remain stored but cannot become colour previews.

The Cullinan now offers Black, Blue, Brown and White. Its blue Black Badge photographs were incorrectly assigned to Black by filename inference. The misleading Green option was removed; Black now opens the clearly black exterior photograph. Missing photographed colours were also restored throughout the fleet. Shade labels describe visible appearance; they are not certified manufacturer paint codes or live availability confirmations.

`data/vehicle-colour-review.json` records the explicit decisions for every image. `scripts/apply-colour-review.mjs` applies them to the seed catalogue and live SQLite records, preserves unrelated vehicle fields, backs up vehicle records under ignored `.local/colour-review/backups/`, increments changed live revisions and records audit events. New, unreviewed image paths are rejected rather than guessed. The older media-audit command also respects these decisions. No original image files were deleted or recoloured.

## Content and search review

Reviewed navigation, homepage claims, About, Contact, booking, partner copy, collection templates, vehicle presentation, location and occasion content, metadata, structured data, canonicals, robots and sitemap behaviour. Retained useful existing rental guidance and the owner's earlier removal of vehicle descriptions. Removed stale gallery wording and changed the emirate banner's unconditional delivery statement into a delivery request. The booking page remains noindex and is now crawlable so crawlers can see that directive. Private admin and API routes remain excluded.

New area pages provide distinct arrival, entrance, parking, luggage or itinerary considerations, an individual question and answer, catalogue vehicles and a contextual enquiry. Khor Fakkan and Kalba correctly belong under Sharjah. Overview imagery is identified by its actual landmark in alt text; it does not claim to depict a particular delivery address. No branch addresses, partnerships, customer reviews, fixed travel times, earnings guarantees or unconfirmed rental inclusions were invented.

This review used the official Google guidance and Search Status Dashboard snapshots already saved in `.local/page-research/` on 15 September 2026: the May core update, June and August spam updates, core-update guidance, spam policies and helpful-content guidance. The emphasis is useful original information, accurate claims, clear navigation and avoiding doorway pages, keyword stuffing and scaled filler. See `OCCASIONS-SEO-REVIEW.md` for the source URLs. Web access remains disabled, so announcements after that snapshot were not checked. There is no Google certification of update compliance and no ranking guarantee.

## Verification and limits

- 42 tests passed, including every catalogue colour preview, all 144 initial gallery renderings with exactly one image and one active swatch, explicit Cullinan regression cases, filename edition handling, media decoding, data preservation, all seven location groups, canonical uniqueness and sitemap coverage.
- All 115 live vehicle records match the reviewed seed photo/colour assignments.
- Production build, including TypeScript checks, passed.
- Local Semgrep: three repository rules across 96 source files, zero findings. The scan covers dynamic code execution, interpolated SQL and legacy cryptographic hashes; it is not a comprehensive security assessment. New database writes use parameterized SQL. No dependencies were added for these changes and no online dependency audit was run.
- Browser interaction, responsive screenshots and HTTP crawl checks were not rerun because browsing and URL fetching remain disabled. The gallery render check runs locally without a browser or network.
- Search Console, deployed indexing, measured Core Web Vitals, business terms, contact details and existing commercial image/font permissions remain launch checks. This work does not certify those facts or permissions.

The project retains its dedicated loopback-only preview: http://127.0.0.1:43117. No public deployment was performed.

# Reservation, events and layout review

The local preview remains reserved for this project at http://127.0.0.1:43117 and binds only to loopback.

## Latest photo and title revision — 20 September 2026

The latest request supersedes the edited street and black backgrounds. The public fleet now uses the original unedited photographs directly from the vehicle records. No newly licensed stock-photo collection was sourced. Generated composites remain on disk but are no longer referenced by the application. This applies to the homepage, daily and monthly catalogues, detail pages, and related vehicles.

Single-vehicle headings combine the brand and model, use a smaller maximum font size, and fit the complete name on one line after fonts load and when the available width changes. Name/email and phone/continue remain in paired columns. The shared detail container can shrink correctly on mobile.

Current validation: production build and 61 tests passed; 115 vehicle records and 259 original photo selections checked; 16 long-name/detail combinations passed at 1440, 768, 390 and 320 pixels, along with daily/monthly rendering and four live Cullinan colour selections. Browser contact-flow and layout checks also passed. The new Semgrep run could not start because Windows Device Guard blocked its executable; previous scan results below are historical, not a scan of this revision.

The event rebuild now contains the seven requested F1 performers, dated concert programmes, galleries and visitor details in `src/lib/event-experiences.ts`. The earlier statement below that the full F1 lineup is unverified is superseded. Official source records remain in the local research folder and image credits manifest. Next-year World Cup dates and entertainment still require confirmation.

## Changes

- Internal public page headings and introductory text are centred. Supporting text fills its available content container; destination introductions now span the page above the image.
- Fleet dropdown categories update the vehicle preview on pointer hover and keyboard focus, with GSAP transitions and reduced-motion support.
- The home hero uses two heading lines and a lower CTA. Vehicle cards reserve consistent title, colour and price space. The regional notice states that delivery is available across the UAE with location-dependent charges.
- Removed the monthly catalogue statistics strip.
- Expanded location coverage to 107 pages, including 33 additional neighbourhoods across all seven emirates.
- Added four dedicated event rental guides, including Abu Dhabi F1, Dubai concerts, Abu Dhabi concerts and the Dubai World Cup. They have distinct planning content, canonical URLs, homepage links and sitemap entries. Event context carries through vehicle selection and booking.
- Vehicle booking collects contact information first, followed by dates, a custom delivery address and optional documents. Direct visits to booking include a contact step; details remain in memory rather than URLs or browser storage.
- Added private encrypted reservation documents, authenticated admin downloads/deletion, bounded uploads, a storage quota and 30-day expiry. Reservation fields are explicitly whitelisted and requests remain pending until admin approval.
- Added a required, visible country-code selector to booking and partnership forms; the server also rejects phone numbers without an international prefix. The entire date field opens the native picker.
- Cards now place View vehicle beside the title, colours beside the price, and WhatsApp across the full bottom edge. A single available colour is hidden on cards. Fixed mobile carousel overflow caused by offscreen colour labels.
- Applied the G 63 Brabus street background to every currently displayed fleet photo and colour variant. All 115 vehicle records are covered by 144 image mappings. The reference photo remains intact; the other 143 images use the original segmented car pixels, resized and composited onto a clean background plate with contact shadows. Original files and database records are unchanged. Display mapping is in `data/car-scene.json`; generated images are in `public/fleet-scene`. The reproducible compositor is `scripts/compose-fleet-scene.py`; the local background plate is `.local/fleet-background/brabus-clean-plate.png`.
- Replaced event hero car photos with actual event photographs or official artwork. Added race-weekend schedules, World Cup race details and archived results, and verified Etihad Arena artists including Hans Zimmer and Andrea Bocelli. Past imagery is labelled as archive; the next World Cup date and unverified concert lineups are not invented.
- Added specific location imagery for Address Sky View, Armani Hotel Dubai, W Dubai, FIVE Palm Jumeirah, Jumeirah Al Naseem and selected neighbourhoods. This is not a claim that all 107 location photos have received individual verification.

## Validation

- All 61 local tests passed, including contact handoff rendering, country-code validation, multipart submissions, custom addresses, upload size/type rejection, authenticated document access, expiry and encryption tamper rejection.
- Production build and TypeScript checks passed.
- Semgrep scanned 117 source files with the three configured rules and reported zero findings. This is a limited static check, not a complete security assessment.
- Local browser checks passed at 1440, 768 and 390 pixels for phone selection, contact handoff, date clicks, card widths and event-page overflow. Verified 259 default/colour selections across 115 cars, all 144 image mappings, image dimensions, daily/monthly rendering and live colour switching. Visually inspected six contact sheets covering every composite.
- All 391 canonical pages returned successfully; five legacy redirects, three protected admin endpoints and unknown-route 404 behaviour passed.

## Outstanding evidence and deployment limits

Research and image downloads were explicitly authorised by the user. Sources checked on 20 September 2026 include Formula 1's 2026 Abu Dhabi race page, Dubai Racing Club, Etihad Arena's calendar and Hans Zimmer event page. Source records and available licence information are in `public/verified-places/sources.json`. Official promotional images are local review copies: commercial publication permission has not been established for those assets and must be resolved before public launch. Creative Commons attribution is included on the credits page.

The full F1 after-race artist lineup, a current Dubai concert lineup and the next Dubai World Cup's date/entertainment remain unverified. Pages explicitly distinguish those gaps from verified dates and archive information. Current Google core-update, helpful-content and spam-policy guidance was reviewed; the May 2026 core update and subsequent June/August spam updates were checked against Google's status history. These edits do not certify site-wide policy compliance or guarantee rankings. The remaining templated location and occasion content merits a separate editorial review before public launch.

The car-background plate was generated by removing the foreground yellow G63 from its original street photo and reconstructing the asphalt, preserving the viaduct, trees, distant cars and camera view. Vehicle pixels were subsequently retained through deterministic alpha compositing; cars were not regenerated. Different source lighting and camera angles remain visible.

Uploaded documents receive signature checks, not malware scanning or full content sanitisation. They are served as attachments with no-store and nosniff headers. Add malware scanning before a public rollout, protect the encryption key and database with appropriate host access controls, and apply retention rules to backups. The broader existing public-deployment requirements in README.md still apply.

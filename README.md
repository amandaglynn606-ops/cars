# Zavi

A working luxury fleet catalogue in Next.js, React and TypeScript. Requirements are in [PRD.md](PRD.md); implementation evidence and remaining launch checks are in [IMPLEMENTATION.md](IMPLEMENTATION.md).

## Local access

- Homepage: http://127.0.0.1:43117
- Fleet: http://127.0.0.1:43117/fleet
- Marques: http://127.0.0.1:43117/brands
- Collections: http://127.0.0.1:43117/categories
- Vehicle: http://127.0.0.1:43117/fleet/lamborghini/revuelto
- Administration: http://127.0.0.1:43117/admin

Use Node.js 22.13 or newer (the current machine uses Node 26). Port 43117 is reserved for this project. Both development and production commands bind to 127.0.0.1.

```powershell
npm.cmd ci --ignore-scripts
# For a fresh checkout only: copy .env.example to .env.local.
npm.cmd run admin:init
npm.cmd run build
npm.cmd start
```

`admin:init` creates a random administrator password in `.local/admin-password.txt`, with a salted scrypt hash and independent session secret in `.local/admin-auth.json`. It does not replace existing credentials. The password file is never served to the browser or printed in logs. Protect this directory with your Windows account permissions; all `.local` files are Git-ignored.

## Data and management

`data/fleet.json` is the validated importable seed. On first use, it initializes `.local/zavi.sqlite`. After initialization, **SQLite is the live source of truth** for the homepage, filters, all catalogue pages, prices, admin edits and reservations. Editing the seed does not overwrite live changes.

Vehicle descriptions have been removed from the catalogue and editor. Startup migrates legacy records, and validation discards descriptions from older imports. See [CONTENT-REVIEW.md](CONTENT-REVIEW.md) for the content changes, verification and pending Google update review.

The current import consolidates all 255 approved source listings into 115 records: 106 published and nine drafts without a listed daily rate. Unknown years and specifications remain null. All published images exist locally. The owner confirmed permission to use Lux Motors photographs on September 14, 2026.

Use Fleet Management to add/edit/delete vehicles, change daily/original/duration prices, create categories and brands, assign locations, manage specifications, upload photos, change availability and feature vehicles. Updates appear without rebuilding. Publication requires brand, model, category, daily price and an approved local image. Existing bookings prevent vehicle deletion; unpublish instead. Renaming a canonical route preserves its previous route as a redirect.

Original prices display only when greater than the current price. Missing 3-, 7-, 14- and 21-day rates are calculated from the daily rate; explicit duration prices are retained. The 30-day offer is calculated as 30 times the daily rate with a 20% discount.

Use `npm.cmd run import:fleet` to retrieve only the approved Lux Motors catalogue endpoint and create `.local/import-review.json`. Review its proposed price changes and unmatched source listings before applying changes in Fleet Management. This command never writes to live vehicles or downloads images. Export the current full dataset from the admin screen for backup or migration. Back up the SQLite database, uploaded media and auth configuration securely before deploying.

## Partner applications

The homepage's Earn with us section offers two dedicated paths: [car consignment](http://127.0.0.1:43117/partners/consign-your-car) and [rental agency partnerships](http://127.0.0.1:43117/partners/rental-agencies). The original `/partners?type=consignment` and `/partners?type=business` links redirect to the matching page.

Owner applications collect vehicle specifications, ownership, finance, insurance, condition and availability. Agency applications collect business/licence details, fleet profile, service areas and preferences for listings, rental leads or both. Both collect contact details, explicit consent and optional notes. The server validates the fields before storing them in SQLite; the response contains only a reference. Review the structured details at `/admin/partners`. Existing free-text enquiries remain readable. Applications do not automatically publish vehicles, activate an agency account or transfer leads; the team reviews and agrees the arrangement first.

Validation and API tests use an isolated temporary database and cover persistence, invalid inputs, consent, request origins and body limits. Browser checks in `scripts/test-home-additions.mjs` support the new forms but were not run while browser browsing is disabled. New copy uses the existing translation provider and falls back to English where a translation is not present.

## Reservations

Vehicle pages collect name, email and phone first, then hand these details to the booking page in React memory. The second step collects dates, a custom delivery address and optional documents without repeating contact fields. Refreshing the page clears this temporary contact handoff.

Reservation documents accept PDF and common image formats, with at most four files of 8 MB each. Signature checks are not malware scanning or complete format validation. Unlike public fleet photographs, these originals are not re-encoded: they are encrypted with AES-256-GCM, stored privately, and downloaded only through an authenticated admin attachment endpoint. Documents expire after 30 days and are purged on the next reservation/document access. Protect the local encryption key and database together, account for backup retention, and add malware scanning before accepting public customer uploads.

Requests are stored as **pending**, with vehicle, dates, location and customer contact details. The admin confirms or cancels requests. Confirmations and overlap checks execute in an immediate SQLite transaction, preventing double confirmation for overlapping dates. Pending enquiries do not block stock. Manual reserved/unavailable/maintenance states also block booking.

Rental date ranges use Dubai calendar dates and the half-open interval `[collection, return)`: a vehicle returned on January 3 can be collected on January 3. Dates alone do not implement a turnaround buffer or hour-specific scheduling.

Public availability responses contain only vehicle IDs and confirmed date ranges. Names, phone numbers and email addresses require an authenticated admin session. Activity records are available through the authenticated “Download activity log” action.

No payments, email or WhatsApp messages are sent automatically. The team must review the local reservations inbox. The public WhatsApp number is +971 54 597 4005; car-card, vehicle-detail and floating links open a prefilled WhatsApp enquiry that the visitor sends themselves.

## Design

- **Haymila**: header and footer Zavi wordmark, as requested by the owner.
- **Qiswah**: page and section display headings.
- **Inter**: functional labels, prices and body text.
- All fonts and images are self-hosted; no font CDN, analytics or general web search.
- Original warm black, bronze and gold layout; no copied source marketing prose.

The downloaded font files match the versions in `src/fonts`. Their included font licences describe personal use. The local requested preview uses the supplied files; obtain/record appropriate commercial web licences for Haymila and Qiswah before public business deployment. Image permission does not imply font permission.

## Verification

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
npm.cmd run test:browser  # local server must be running on 43117
node scripts/test-catalogue-pages.mjs # every listing route, filter counts and navigation search
node scripts/test-homepage.mjs # homepage sections, live counts, links and responsive headings
npm.cmd audit --omit=dev
```

The browser suite uses installed Chrome (override `CHROME_PATH` if necessary), checks desktop/mobile flows, fonts, admin price persistence, date handoff, authentication boundaries, same-origin requests, and WCAG A/AA accessibility with axe. It temporarily changes and restores the Revuelto daily rate, so run it on a local review instance. Unit/repository tests use a separate temporary SQLite database.

Production traffic is restricted by a nonce-based Content Security Policy, same-origin request validation, bounded request bodies, protected admin cookies and upload validation/re-encoding. These controls do not make a machine or deployed service “absolutely secure.” A public rollout still needs HTTPS, protected persistent storage/backups, real contact and rental terms, font licences, verified fleet allocation/pricing, and operational monitoring. This implementation assumes one persistent application host; it is not configured for ephemeral/serverless or multiple hosts sharing independent SQLite files.

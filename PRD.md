# ZAVI — FLEET & RENTAL CATALOGUE PRD

Status: local implementation complete for the catalogue flows described in IMPLEMENTATION.md; commercial launch and owner acceptance remain pending.

This document records sections 36–60 supplied by the owner. The repeated copy of
the requirements has been consolidated. No existing sections 1–35 were found in
the repository; this document does not invent or replace them.

Zavi must provide an original luxury automotive experience using its
black/bronze/gold visual system and Qiswah typography. Fleet size, taxonomies,
prices, service locations, and reservation volume must be able to grow without
duplicating pages or vehicle records.

### Decisions that resolve the supplied examples

- Section 59 defines the canonical URLs: `/fleet/{brand}/{model}`,
  `/brands/{brand}`, and `/categories/{category}`. Earlier URL examples are
  compatibility aliases, not separate content pages.
- Vehicles can belong to multiple categories. One primary category supplies the
  card label; additional memberships support classifications such as Luxury/SUV
  and SuperSport/Convertible without duplicating inventory.
- Year and specifications are validated when provided. Unknown facts stay null;
  missing values must never be guessed just to populate a filter or a card.
- Published prices and operational availability are different facts. Imported
  competitor listings do not establish Zavi's ownership, allocation, live
  inventory, or confirmed bookings.
- Source prices are an initial editable reference dataset. Subsequent imports
  must not overwrite approved administrator changes without an explicit review.

## 36. Fleet Data Source

Approved primary source: [Lux Motors DXB Fleet](https://luxmotorsdxb.com/all-fleet/).

Use the source for factual vehicle names, brands, categories, models, listed
rental prices, available vehicle metadata, and model years where available.
Record each listing's source URL/identifier and retrieval timestamp. Source
access for an import must be limited to the approved site and required public
catalogue endpoints; it does not enable general web search.

Do not copy Lux Motors branding, logos, visual design, page layout, written
descriptions, or marketing copy. Do not copy or publish source photographs
without documented permission or a suitable licence. Self-hosting a downloaded
photograph does not establish permission to use it.

Write original Zavi descriptions using verified facts. Images must be Zavi-owned
or appropriately licensed, and must depict the correct vehicle. An illustration
is not evidence of the exact rental car's condition, trim, or colour.

Secondary references supplied by the owner:

- [Port de La Mer fleet/pricing landing page](https://luxmotorsdxb.com/port-de-la-mer-luxury-car-rentals/).
- [Dubai International Airport service page](https://luxmotorsdxb.com/dubai-international-airport-dxb-luxury-car-rentals/).

The owner-supplied price examples are supplemented by a fresh approved-source import on September 14, 2026. All 255 source listings are represented in the central dataset; live operational pricing still requires verification before launch.

## 37. Fleet Architecture

Use one authoritative catalogue repository for every homepage selection, fleet
result, filter, brand page, category page, detail page, admin operation, and
booking lookup. Homepage cards must be selected from this repository using the
`featured` flag, never hardcoded as independent vehicle objects.

The importable interchange file is `data/fleet.json`. A database-backed repository
must support the same domain model for admin changes and reservation enforcement.
Do not make a bundled, build-time JSON import the only live admin storage: approved
changes must become visible without editing frontend code or requiring a rebuild.

Required vehicle fields and supported extensions:

```javascript
{
  id: "",                    // Stable inventory identity; does not change with price/name.
  brand: "",
  model: "",
  slug: "",                  // Stable listing slug; preserve redirects when changed.
  brandSlug: "",
  modelSlug: "",             // Unique within a brand; distinguish actual inventory variants.
  category: "",              // Primary category label.
  categoryIds: [],           // Includes primary category; references editable taxonomy.
  year: null,
  pricePerDay: null,
  originalPrice: null,
  currency: "AED",

  seats: null,
  transmission: null,
  drivetrain: null,
  engine: null,
  power: null,
  exteriorColour: null,
  interiorColour: null,

  images: [],                // Managed image references, alt text, and rights evidence.
  featuredImage: null,
  availability: "unavailable",
  featured: false,
  description: "",           // Original Zavi copy.
  features: [],
  locations: [],             // Service-location IDs, not duplicate vehicle records.
  mileage: null,
  deposit: null,
  weeklyRate: null,
  monthlyRate: null,
  durationRates: { threeDays: null, fourteenDays: null },

  publicationStatus: "draft", // draft | published | archived
  keywords: [],
  source: {
    provider: "Lux Motors DXB",
    listingIds: [],
    urls: [],
    fetchedAt: null,
    verifiedAt: null
  },
  extensions: {},
  version: 1
}
```

This is a draft schema template, not a publishable vehicle. Required fields are
checked at publication. Unknown numerical values use null rather than zero.
Money must use integer minor units or a fixed-precision database decimal; convert
to the AED display amounts above at the boundary. Do not use floating-point
arithmetic for authoritative totals.

Brand, category, and service-location tables have stable IDs, editable labels,
slugs, and ordering. Additional attributes live in a validated extension schema;
adding optional data must not require reconstructing the catalogue frontend.

## 38. Fleet Categories

Initial categories and classification guidance:

| Category        | Slug              | Qualifying examples, when present in the source                                          |
| --------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| Luxury          | `luxury`          | Rolls-Royce, Bentley, Mercedes-Benz/BMW luxury models, Range Rover                       |
| SuperSport      | `supersport`      | Lamborghini, Ferrari, McLaren, qualifying Porsche performance models                     |
| Sports          | `sports`          | Mercedes-AMG, Porsche, BMW M, Chevrolet Camaro, Ford Mustang, Dodge                      |
| SUV             | `suv`             | Range Rover, Urus, Purosangue, Mercedes-Benz/BMW SUVs, Nissan Patrol, other premium SUVs |
| Sedan           | `sedan`           | Qualifying Mercedes-Benz, BMW, Porsche, and other premium sedans                         |
| Convertible     | `convertible`     | Qualifying Ferrari, Lamborghini, Mercedes-Benz, Porsche, Camaro, and other convertibles  |
| American Muscle | `american-muscle` | Chevrolet Camaro, Ford Mustang, Dodge Charger, other qualifying models                   |

Classify the actual model/body style, not every vehicle belonging to a brand.
An Urus must not lose its SUV membership because its brand is Lamborghini.
Store disputed or uncertain classifications for review. Categories can be added,
renamed, or reordered as data; shared page components read the taxonomy.

## 39. Brand Catalogue

Generate dedicated brand pages only for brands present in the published master
fleet. Examples, when applicable:

```text
/brands/lamborghini
/brands/ferrari
/brands/rolls-royce
/brands/bentley
/brands/mclaren
/brands/porsche
/brands/mercedes-benz
/brands/bmw
/brands/range-rover
/brands/aston-martin
```

Query by canonical brand ID. Normalize source aliases such as `Rolls Royce` to
the chosen display name and slug without treating them as separate brands.
Unknown brand slugs return a real 404, not a fabricated empty brand page.

## 40. Brand Page Layout

Use an original Zavi hero and the shared, brand-scoped catalogue component:

```text
LAMBORGHINI

Experience Lamborghini in Dubai.

[Vehicle grid from the master fleet]

Lamborghini Revuelto
AED 14,000 / DAY
```

The price above illustrates the owner's supplied reference, not a fixed template
value. Names, images, counts, prices, and availability must come from the same
repository used by `/fleet`. Additional filters refine the brand scope rather
than silently replacing it.

## 41. Category Pages

Canonical category pages are `/categories/{category}`:

```text
/categories/luxury
/categories/supersport
/categories/sports
/categories/suv
/categories/sedan
/categories/convertible
/categories/american-muscle
```

Each uses category membership in the master fleet. Earlier examples such as
`/fleet/luxury` and `/fleet/supersport` redirect to the corresponding canonical
category pages. Existing `/fleet/type/{type}` routes also redirect using explicit
taxonomy mappings. Do not create competing indexed category pages.

## 42. Main Fleet Page

URL: `/fleet`.

```text
THE ZAVI FLEET

Exceptional cars.
Selected for exceptional journeys.

[Search vehicles................................]

CATEGORY       BRAND       MODEL       YEAR

[Fleet controls and vehicle grid]
```

Search, facets, selected dates, service location, counts, pagination, and sorting
must share one normalized query state. Preserve this state in validated URL
parameters so links are shareable and browser back/forward navigation works.
Counts come from the actual matching fleet; `48 VEHICLES` is illustrative only.

## 43. Left-Side Fleet Filters

On desktop, use a restrained left sidebar labelled **FILTER FLEET** alongside
the results grid. Include:

- Category: multi-select checkboxes from the category taxonomy.
- Brand: multi-select checkboxes from actual fleet brands.
- Model: model options/search scoped to the selected brands when relevant.
- Price / Day: minimum and maximum AED controls with an accessible range input.
- Year: first-class multi-select values from known model years.
- Seats: 2, 4, and 5+ where matching verified data exists; accommodate other
  actual capacities rather than dropping them from the dataset.
- Transmission: actual known values, including Automatic where present.
- Service/delivery location.
- Availability and selected start/end dates.
- **CLEAR ALL**.

Derive price bounds and facet values from data, not permanent constants such as
AED 250–14,000 or years 2024–2026. Unknown metadata must not match a selected
known value. Do not invent seat counts or transmission to populate the sidebar.

## 44. Interactive Filtering

Update results without a full page reload. Within one multi-select facet, match
any selected value (OR); combine different facets using AND. Search, price,
date-aware availability, and location restrictions further refine that result.

Display the actual count, for example `6 VEHICLES FOUND`, and removable chips:

```text
[Lamborghini ×] [SuperSport ×] [2024–2026 ×]  CLEAR ALL
```

Remove one chip without clearing unrelated choices. Clear all resets optional
filters, dates, and search while retaining the route's brand/category scope.
Show a helpful no-results state with reset controls. For remote queries, cancel
or ignore stale responses so a slower previous request cannot replace newer
results. Announce result-count updates accessibly.

## 45. Sorting

Use a compact **SORT BY** control with:

1. Featured.
2. Price: Low to High.
3. Price: High to Low.
4. Newest.
5. Name: A–Z.

Featured sorts explicit featured records first. Newest uses verified model year
descending, with unknown years last. Use a stable secondary key for ties.
Daily price sorting must never fall back to monthly prices under a daily label.
Avoid an oversized ecommerce-style dropdown.

## 46. Search

Search brand, model, category memberships, year, and approved vehicle keywords.
Normalize case, surrounding whitespace, and common punctuation. `Lamborghini`
returns that brand; `Urus` returns matching models, within the current scope.

Validate and limit input lengths. Render search text as text, never raw HTML;
parameterize database queries. Define consistent token matching in the shared
query layer, and paginate results for larger fleets rather than loading unlimited
records and images into the browser.

## 47. Vehicle Card

Use original Zavi cards with large, authorized vehicle photography, restrained
bronze accents, and this content hierarchy:

```text
[Large vehicle image]                 [♡]

LAMBORGHINI
REVUELTO

SUPERSPORT
2 SEATS · AUTOMATIC · AWD

AED 14,000 / DAY

VIEW VEHICLE →
```

Render specification fragments only when verified fields exist. Show the valid
sale treatment from section 50 and accurate availability from section 53.
If the favourite control is shown, implement it accessibly; store only stable
vehicle IDs, never copied prices or full vehicle records. All card data remains
derived from the master catalogue.

## 48. Vehicle Detail Page

Every published vehicle has one canonical `/fleet/{brand}/{model}` URL. Preserve
the earlier `/fleet/lamborghini-revuelto` example as a redirect when applicable.

Hero: large responsive image gallery, brand, model, current daily price, relevant
availability, and **RESERVE THIS VEHICLE**.

Specifications include category, year, seats, transmission, drivetrain, engine,
power, colours, mileage terms, and deposit only when verified data exists. Include
original Zavi description/features and authorized image alt text. Hide absent
specification rows rather than guessing model defaults.

Gallery controls must work with keyboard and touch, respect reduced motion,
reserve image dimensions, and lazy-load below-the-fold images. Related vehicles
also query the master catalogue.

## 49. Pricing

Initial price references supplied by the owner:

| Vehicle                    | Listed AED / day |
| -------------------------- | ---------------: |
| Lamborghini Revuelto       |           14,000 |
| Ferrari Purosangue         |           12,000 |
| Lamborghini Aventador SVJ  |           10,500 |
| Mercedes GT63 Black Series |            9,000 |
| Rolls-Royce Phantom        |            6,300 |
| Ferrari 812 Superfast      |            6,000 |
| Rolls-Royce Cullinan       |            5,700 |
| Rolls-Royce Spectre        |            5,500 |
| Ferrari SF90               |            5,000 |

These are dated reference examples, not assertions of current or permanent
pricing. Import the current listed amount and rental period, then obtain
verification before launch. Preserve raw source names until factual normalization
is reviewed; do not infer trim/year from a loosely named listing.

Administrators can edit prices without changing code. Record currency, period,
source timestamp, verifier, edit history, and effective time. Price changes must
invalidate affected catalogue caches. Preserve an agreed quote's price snapshot;
do not silently rewrite an existing reservation when the catalogue rate changes.

## 50. Discounted Pricing

Support `originalPrice` and `pricePerDay`. Show a struck-through original price
only when both are verified, use the same currency and rental period, and the
original amount is greater than the current amount.

```javascript
// Display-format example only; not an imported Nissan price claim.
{ originalPrice: 550, pricePerDay: 425, currency: "AED" }
```

Do not invent reference prices, sale percentages, or sale expiry times. Invalid
discount pairs fail validation and do not create promotional UI.

## 51. Rental Duration Pricing

Support durations of 1, 3, 7, 14, and 30 days. Store only explicitly published or
administrator-approved rates. Daily, weekly, and monthly storage fields remain
the single values behind the following query/API projection:

```javascript
pricing: {
  daily: vehicle.pricePerDay,
  threeDays: vehicle.durationRates.threeDays,
  weekly: vehicle.weeklyRate,
  fourteenDays: vehicle.durationRates.fourteenDays,
  monthly: vehicle.monthlyRate
}
```

Do not persist two independently editable copies of the same rate. Never derive
weekly/monthly prices or invent multi-day discounts. If no approved duration rate
exists, display **Request a quote**; any daily-rate estimate requires an explicit,
approved pricing rule and a clear estimate label. Unknown fees, deposits, taxes,
and mileage charges must not be silently treated as zero or included.

## 52. Locations

Maintain one editable service-location directory and many-to-many assignments
between vehicles and locations. Initial candidate locations, subject to Zavi's
service verification:

- Dubai Marina.
- Downtown Dubai.
- Palm Jumeirah.
- Dubai International Airport (DXB).

Lux Motors location landing pages do not prove that Zavi serves those areas.
Confirm assignments before publishing them. Do not duplicate a vehicle for each
location or interpret delivery areas as simultaneous independent inventory.

## 53. Availability

Supported operational states: **AVAILABLE**, **RESERVED**, **UNAVAILABLE**, and
**MAINTENANCE**. Publication status is separate from operational availability.
New imports remain draft/unavailable until Zavi's actual inventory is verified.

Availability must be date-aware and enforced on the server. Model operational
inventory separately from marketing listings if more than one physical vehicle
shares a model. Confirmed reservations and maintenance blocks reference the
specific inventory identity or a transactionally enforced inventory capacity.

Store reservation/block timestamps in UTC and interpret selected local times
using `Asia/Dubai`. Use half-open intervals `[start, end)`:

```text
overlap = requestedStart < existingEnd AND requestedEnd > existingStart
```

A confirmed overlapping booking or maintenance block makes the affected inventory
unavailable for those dates. Adjacent reservations are allowed only if operational
turnaround rules permit them. Reject invalid/reversed dates. Clarify pickup and
return times when the UI accepts calendar dates rather than full timestamps.

Recheck availability at confirmation, inside a transaction or equivalent atomic
capacity constraint, to prevent simultaneous double bookings. Expiring holds must
have explicit rules. Cancellation/expiry releases inventory. Never expose another
customer's identity or booking details in public availability responses.

Without a functioning reservation source, say **Availability on request** and
send an enquiry; do not claim live or confirmed availability.

## 54. Booking From Fleet

Cards link through **VIEW VEHICLE**. Details provide **RESERVE THIS VEHICLE** and
carry stable vehicle ID, brand, model, selected dates, and service location into
the reservation flow. Preserve the selection when navigating back to the fleet.

Treat URL parameters and browser-supplied prices as untrusted. The server resolves
the vehicle ID, current approved rates, allowed locations, publication state,
availability, and any eligibility constraints from the central repository.

The current WhatsApp integration is an enquiry handoff, not a confirmed booking
engine. It can remain as a clearly labelled enquiry channel. A customer opening
or sending a message must not mark a car reserved. Only an authorized confirmation
action can create a blocking reservation after atomic availability validation.

Collect only necessary contact/booking details. Validate them on the server,
rate-limit submissions, keep secrets out of URLs/logs, and disclose any user-chosen
third-party handoff before transmitting personal information.

## 55. Mobile Fleet Experience

Do not stack the full desktop sidebar above the results. Use:

```text
THE ZAVI FLEET
[SEARCH VEHICLES]

[FILTER]                         [SORT]
48 VEHICLES

[VEHICLE CARD]
[VEHICLE CARD]
```

The count is dynamic. Filter opens a full-screen drawer; sort remains compact.
Keep touch targets usable, avoid horizontal overflow, preserve selections during
orientation changes, and do not lose query state when the drawer closes.

## 56. Luxury Filter Drawer

Provide a full-screen, keyboard-accessible modal drawer headed **FILTER FLEET**.
Include all relevant desktop dimensions: category, brand, model, price, year,
seats, transmission, location, availability, and dates.

Use draft selections inside the drawer. **APPLY FILTERS** commits them together;
close/Escape without applying discards draft changes. Clear/reset behaviour must
be visible. Show a draft result count if available, restore focus to the opener,
trap focus appropriately, and prevent background scrolling while open.

## 57. Data Import

Create a repeatable, validated import to `data/fleet.json` or a staging database
using the approved source. Import all source pages; report completion, source
counts, merged records, conflicts, rejected records, and timestamps. A safety cap
must report an incomplete import rather than silently dropping later pages.

Validate brand, model, category, price/period/currency, year when available,
featured image and image rights, stable ID, unique slug, and brand/model route.
Require known brand/model, at least one approved category, valid approved daily
price, a correct authorized featured image, unique identity/routes, and an
explicit publication decision before publishing. Optional unknown specs/year
remain null and are excluded from corresponding known-value filters. If Zavi
requires a model year for a particular vehicle, keep it draft until verified.

An unavailable or unlicensed image is a publication blocker, not permission to
copy the source image or display an unrelated car. Keep incomplete imports in
staging/draft with a reason; include them in reconciliation counts rather than
calling a partial public grid the complete imported fleet.

Deduplicate source daily/monthly/location listings using stable source IDs and
verified vehicle/variant identity. Do not merge genuinely distinct inventory by
name alone. Preserve year, trim, colour, and source relationships during review.

Use a dry run and reviewable diff, schema versioning, atomic promotion, backup,
and rollback. Re-imports preserve stable IDs, licensed media, original Zavi copy,
admin overrides, featured flags, operational states, location assignments, and
reservation relations. Flag source removals for review instead of deleting
referenced inventory automatically.

Restrict server-side fetch destinations and redirects, bound file sizes/timeouts,
validate content types, and treat upstream HTML/JSON as untrusted. Do not import
marketing prose as display copy, run source scripts, expose credentials, or
download source photography without documented rights.

## 58. Fleet Admin

Provide authenticated administrator workflows to:

- Add, edit, archive, and delete vehicles where referential constraints permit.
- Change daily and approved duration prices; add/remove valid sale pricing.
- Manage brands, categories, model years, and specifications.
- Upload and manage authorized imagery and alt text.
- Change operational availability and maintenance windows.
- Feature/unfeature inventory.
- Assign verified service/delivery locations.
- Review/import source updates and preserve overrides.
- Confirm/cancel reservations and inspect non-public operational history.

Protect every read/write endpoint according to role, not just the admin page.
Use maintained authentication, secure sessions, server-side authorization,
validation, CSRF protection where applicable, submission limits, and audit logs
without secrets. Public clients never receive admin credentials or private
reservation records.

Uploads must enforce allowed image types, size/dimension limits, decoded-content
validation, safe generated filenames, metadata stripping, and separation from
executable content. Reject active/untrusted formats or sanitize through a vetted
pipeline. Record rights evidence before publication.

Use optimistic version checks or equivalent protection against lost updates.
Prefer archiving vehicles referenced by reservations; destructive deletion must
be explicit and auditable. Refresh public caches after approved edits. Add
pagination and indexes for growing inventories.

## 59. SEO Structure

Canonical routes:

| Entity     | Canonical route          | Example                       |
| ---------- | ------------------------ | ----------------------------- |
| Main fleet | `/fleet`                 | `/fleet`                      |
| Vehicle    | `/fleet/{brand}/{model}` | `/fleet/lamborghini/revuelto` |
| Brand      | `/brands/{brand}`        | `/brands/ferrari`             |
| Category   | `/categories/{category}` | `/categories/supersport`      |

Further vehicle examples: `/fleet/ferrari/purosangue` and
`/fleet/rolls-royce/phantom`. Distinct years/trims/inventory variants require stable,
unambiguous model slugs; do not overwrite one variant's page with another.

Redirect existing `/fleet/{combined-slug}`, `/fleet/brand/{brand}`,
`/fleet/type/{type}`, and earlier `/fleet/{category}` examples through explicit
mapping records. Resolve legacy category/vehicle slug collisions explicitly;
never redirect by a blind string guess. Slug edits preserve old-to-new mappings.

Generate titles, canonical links, breadcrumbs, structured data, and sitemap
entries from published data. Do not invent ratings or offer availability in
structured data. Keep arbitrary filtered/sorted query combinations out of the
index using a defined canonical/noindex policy. Do not expose admin, draft,
private reservation, or unverified vehicle pages through search indexing.

## 60. Final Fleet Acceptance Criteria

All boxes remain unchecked until the implementation and its data are verified.

- [x] Complete fleet sourced from approved data, with a reconciliation report.
- [x] Lux Motors pricing imported with source timestamps and verification status.
- [x] Pricing stored as editable data; admin changes survive re-imports.
- [x] Categories implemented as editable, extensible, multi-membership taxonomy.
- [x] Brand filtering implemented.
- [x] Model search/filtering implemented.
- [x] Year filtering implemented without invented years.
- [x] Price minimum/maximum filtering implemented.
- [x] Seat filtering implemented using verified values.
- [x] Transmission filtering implemented using verified values.
- [x] Location filtering implemented using approved assignments.
- [x] Availability filtering implemented with selected dates.
- [x] Sorting implemented: Featured, both price directions, Newest, Name A–Z.
- [x] Active filter chips implemented and individually removable.
- [x] Clear-all behaviour implemented and documented for scoped pages.
- [x] Mobile filter drawer implemented with apply/cancel semantics.
- [x] Brand pages populated from the central repository.
- [x] Category pages populated from the central repository.
- [x] Individual vehicle pages implemented with authorized galleries.
- [x] Vehicle URLs are SEO-friendly with legacy redirects and canonical metadata.
- [x] Vehicle booking flow carries identity, selected dates, and location.
- [x] Enquiries are distinguished from confirmed reservations.
- [x] Atomic confirmation prevents overlapping reservations/double bookings.
- [x] Vehicle data is centrally managed, including admin edits and reservations.
- [x] No duplicate vehicle records caused by location or rental-period listings.
- [x] No hardcoded vehicle cards or duplicate editable price fields.
- [x] Pricing can be changed without code changes or a required frontend rebuild.
- [x] Availability can be changed without code changes.
- [ ] Haymila wordmark (owner override) and Qiswah display headings have documented commercial
      and web-embedding permission; maintain readable accessible functional text.
- [x] Zavi black/bronze/gold visual system maintained.
- [ ] Fleet experience feels premium and automotive on desktop and mobile.
- [x] Source design, copy, branding, logos, and unlicensed imagery are not reused.
- [x] Missing critical data blocks publication; unknown optional specs are hidden.
- [x] Unknown duration rates show quote-required behaviour, not invented prices.
- [x] Auth, role checks, upload validation, request validation, and audit history
      are tested; private data is not exposed through public APIs.
- [ ] Search, filters, chips, sorting, route scopes, drawer keyboard interaction,
      timezone boundaries, adjacent dates, cancellations, simultaneous confirmations,
      price edits, and import conflict handling have meaningful automated coverage.
- [x] Dependency, secret, accessibility, and applicable local security checks run;
      unresolved material findings and deployment limitations are reported.
- [x] Local development binds to loopback on the existing reserved port 43117;
      sandboxes and security checks remain enabled, and general web search stays off.

### Original repository baseline (before implementation)

These historical notes describe the initial baseline. The current implementation and evidence are documented in [IMPLEMENTATION.md](IMPLEMENTATION.md).

- `src/lib/fleet.ts` already supplies central data access from `data/fleet.json`;
  extend that boundary rather than introducing independent page datasets.
- The existing importer reads Lux Motors' public Store API and rewrites the JSON.
  Replace destructive refresh semantics with staging, review, and override-aware
  promotion before enabling admin edits.
- Existing image-localization tooling and the README acknowledge downloaded
  source photographs. Audit their rights; their presence on disk is not clearance.
  No image import or deletion is part of this PRD update.
- The current type uses one `bodyType`, lacks the full year/seat/location/
  availability model, and needs migration to the contract above.
- Existing routes use `/fleet/brand`, `/fleet/type`, and a combined vehicle slug;
  migrate using the explicit canonical/redirect policy in section 59.
- The current rate helper can fall back between daily and monthly periods. Remove
  that behaviour when implementing strict period-correct catalogue pricing.
- The current booking flow composes a WhatsApp enquiry and does not persist
  confirmed reservations; it cannot establish date-aware availability by itself.
- Current rendered fonts are Instrument Serif/Inter. Local Qiswah files exist,
  but `src/fonts/1001fonts-qiswah-eula.txt` is a personal-use licence and explicitly
  requires prior written permission for commercial use. Record a suitable licence
  before enabling it for this commercial site; do not silently substitute a font
  or claim that the existing file supplies commercial permission.

### Owner additions implemented

- Haymila from Downloads is used for the header and footer logo; Qiswah remains the display face.
- Colour controls must switch to relevant photos. Unsupported colour options are removed.
- The mega menu connects the full published fleet, all actual marques and every category.
- Refer to [IMPLEMENTATION.md](IMPLEMENTATION.md) for verification evidence, exact dataset counts and remaining launch requirements.

### Critical implementation instruction

> **Do not build a simplified demo fleet. Build the fleet as a real catalogue architecture from the beginning. The number of vehicles, brands, categories, pricing records and locations will grow. Every vehicle must come from the central data source, and every filter, brand page, category page, search result and booking flow must use that same source of truth.**

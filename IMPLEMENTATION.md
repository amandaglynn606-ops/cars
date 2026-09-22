# Zavi implementation record

Updated September 14, 2026. This records implementation and verification; it is not approval to launch a commercial rental operation.

## Catalogue

The approved Lux Motors Store API returned **255 listings**. Daily and monthly entries with the same normalized identity were consolidated into **115 central vehicle records**. **106 are published**, with **22 brands** and **11 categories** after classification review. Nine records remain drafts because the source does not list a daily rate.

Every source product ID is represented in the dataset. Current listed prices, retrieval time and original source URLs are retained. The live SQLite repository is initialized from `data/fleet.json` once; admin edits are read at request time and are not overwritten by refreshes.

The homepage, fleet search, brand/category directories, scoped listings, details, mega menu and booking lookup all use this repository. The mega menu links every published vehicle and includes all brand and category pages.

Canonical structure:

- `/fleet/{brand}/{model}`
- `/brands/{brand}`
- `/categories/{category}`

Legacy routes redirect. Model/brand URL edits retain aliases. Land Rover Defender now has its own correct marque and canonical URL; the previous Range Rover route redirects.

## Photography and classification review

The owner explicitly confirmed permission to use Lux Motors images. **777 local catalogue photographs** were checked for file presence and successful raster decoding, including draft-vehicle galleries.

All 115 listings were reviewed for colour/photo associations. Existing filename labels identify image groups; compound shades and colour-family labels are matched only where unambiguous. Model words such as “Black Series” are excluded from colour matching. Unlabelled images remain available in the full gallery.

**31 colour options have matching photos; 22 unsupported options were removed.** Both card swatches and detail-page colour controls change the displayed photos. A selected detail colour restricts thumbnail and previous/next navigation to that colour group. Card selections carry through to the detail gallery. The admin can assign colours per image; saving drops colours without any photos.

Classification corrections include BMW M4 as Sports/Coupe, E450 and BMW 840 as Convertible, Audi RS6 as Sports/Wagon, Dodge Ram TRX as Pickup, Chevrolet Tahoe as SUV, and the pictured Mercedes GTC/R as Sports/Coupe. Convertible listings no longer also claim a conflicting coupe/sedan body classification. Existing source-specific model names and ambiguous inventory variants require operator review rather than invented trim/year specifications.

A detailed local reconciliation record is in `.local/media-audit.json`. The audit script updates only reviewed media/taxonomy fields and retains independent price or operational edits.

## Implemented interactions

- September 15: the homepage banner uses the owner's latest downloaded Lamborghini video (`WhatsApp Video 2026-09-15 at 12.54.25 AM.mp4`), served locally from `public/videos/zavi-banner.mp4`. The muted, inline loop includes a play/pause button and a still extracted from the clip for loading/failure fallback. Reduced-motion preferences disable automatic playback. The video replaces the photo slideshow; the first featured vehicle remains the spotlight link.
- Live search across brand, model, categories, year and keywords.
- Multiple category/brand/model/year/seat/transmission/location/availability filters, minimum/maximum daily price, and saved vehicles.
- OR within a facet; AND across facets. Unknown facts do not satisfy specification filters.
- Featured, ascending/descending price, newest year and alphabetical sorting.
- Removable filter chips, scoped clear-all and URL-persisted selections.
- Desktop sidebar and mobile full-screen filter drawer with draft/apply/cancel semantics.
- Sticky navigation, desktop mega menu with vehicle search, mobile marque/category/vehicle navigation, keyboard dismissal and native modal focus handling.
- Authorized galleries, exact available specifications, valid discount treatment, source duration rates and quote requests for missing duration prices.
- Haymila header/footer logo and Qiswah page headings; local fonts and images.

## Administration and reservations

The authenticated admin supports vehicle creation, editing, deletion, publication, featuring, image upload, per-photo colours, daily/sale/duration pricing, specifications, categories/brands, locations and availability. Exports provide the current fleet JSON and activity history.

Admin sessions use signed, expiring, HTTP-only, SameSite=Strict cookies. HTTPS sessions additionally set Secure. Passwords use salted scrypt hashes; initial credentials are generated locally and never logged or served by the app.

Reservation requests are persisted as pending. Confirmation/cancellation is a separate admin operation. Immediate database transactions prevent overlapping confirmed reservations; adjacent half-open date intervals are allowed. Dates use the Dubai calendar. Public availability responses contain no customer contact data. Vehicle deletion is rejected when reservation history exists.

No automatic message or payment is sent. The operator must review the reservations inbox and agree the final rental details.

## Validation performed

- Production build and TypeScript checking pass.
- **16 automated catalogue, database, media and validation tests pass**, including complete data validation, source identity uniqueness, unknown facts, filters, sorting, half-open dates, Dubai midnight, stale edit rejection, reservation overlap/cancellation and local image decoding.
- **145 canonical public pages**, five legacy redirects, protected admin endpoints and unknown-route handling were checked.
- Chrome desktop/mobile tests cover the actual Haymila font, mega-menu links/search, matching colour galleries, card swatches, filters/chips/sorting, saved vehicles, pagination, booking date/location handoff, admin sign-in, live price changes/restoration, upload handling and audit access.
- Axe WCAG A/AA checks report no violations in the tested home, mega menu, fleet, detail, booking, admin and mobile navigation/filter states.
- Browser checks report no page errors or external runtime requests.
- `npm audit` reports **zero known vulnerabilities** across installed production and development dependencies. Next's older nested PostCSS was overridden with the patched 8.5.28 dependency.
- Gitleaks found no secrets in application source.
- Semgrep ran three local rules against 58 TypeScript targets, with zero findings. These checks cover dynamic string execution, interpolated SQL and legacy hash primitives; they are not a full external security audit.
- Source and scanner reports stay in ignored local directories.

## Outstanding before public launch

- Verify the actual rental inventory, allocations, source prices, mileage/deposit/insurance terms and delivery arrangements. Source catalogue availability is not evidence of Zavi's operational stock.
- Supply daily rates for the nine remaining drafts if they should be offered. Unknown specifications and model years remain hidden; source data does not establish seat counts.
- Record appropriate commercial web licences for **Haymila and Qiswah**. The bundled licences are personal-use documents; the owner requested these fonts for the local preview.
- Configure a real business contact, operating procedures and customer-data retention/deletion policy.
- Configure HTTPS, persistent storage/backups, monitoring and deployment-level access controls. Current defaults bind only to 127.0.0.1:43117 and assume one persistent application host.
- Have the owner review the visual design and final data. Automated testing does not certify absolute security or replace business acceptance.

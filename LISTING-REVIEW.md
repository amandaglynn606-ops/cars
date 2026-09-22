# Navigation, cards and catalogue review

## Changes

- One wider vehicle search in the navigation beside Reserve a vehicle. Exact brand names open their brand page; exact or uniquely matching vehicle names open the vehicle. Ambiguous searches show filtered results.
- Removed the separate search fields from listing pages and navigation menus.
- Vehicle cards show category and known specifications on the right, beside the brand and model. Unknown specifications are omitted.
- Removed the banner's visible play/pause button. The video still respects the browser's reduced-motion preference and retains its poster fallback.
- Brand and category pages pass only their own cars to the filter controls. Options, counts and price bounds use that scope. Counts respond to the other active filters, and unavailable options are disabled.
- Mobile options use the draft selections before Apply. Cancelling leaves the applied filters unchanged. Search parameters also update correctly through same-page navigation and browser back/forward.
- Model is expanded on every listing page, with options and counts derived from that page's vehicles.
- Removed Color, Year, Transmission, Location, Availability and Your dates from listing filters. Old URL parameters for these controls are ignored. Rental dates and delivery location remain in the vehicle reservation flow; vehicle photo colors remain in the gallery.
- No seat options are invented for vehicles without recorded seat counts. Invalid prices return a correction message.

## Listing data

Reviewed all 115 records against the saved local catalogue source. Twenty listings received targeted corrections: fourteen ambiguous drivetrain fields and six ambiguous transmission fields were cleared across nineteen records; Ferrari F8 Trubito was corrected to F8 Tributo. The previous vehicle URL redirects to the corrected URL. Prices, photos and bookings were retained. Corrections were applied to both the seed and live database, using existing revision checks and audit records.

The saved source describes alternative specifications for several models, rather than identifying the actual rental vehicle configuration. Cleared values remain unconfirmed until the owner supplies the allocated vehicle's details. Existing null values, nine drafts without daily prices and unverified launch prices remain unresolved.

The source also contains questionable model labels such as Maserati MC120, Mercedes GT63 Black Series and Mercedes GTC/R. Their exact vehicle/trim identities need owner or authoritative confirmation; this review does not certify those labels. No manufacturer or live supplier sources were accessed because web access remains disabled. The interface and filter consistency checks are not a guarantee of real-world stock or specification accuracy.

Description-only and correction backups are stored in the Git-ignored `.local/content-review/` folder. No old marketing descriptions were restored.

## Verification

- 22 unit/repository/media tests, including all published cars' recorded filters, scoped facet counts, mobile draft logic, date overlap, malformed filters, URL round-trips and specific search destinations.
- Production build includes TypeScript validation.
- `node scripts/test-catalogue-pages.mjs` checks all 34 fleet/brand/category pages, every displayed filter option and all 106 published vehicle cards. It also checks Model presence, removal of the old controls including Color and Year, direct vehicle/brand searches, ambiguous search results, browser history, mobile Apply/Cancel and header alignment at seven widths from 320 to 1440 pixels. Image downloads are skipped during exhaustive count checks; local image decoding is covered by the media tests.
- Existing browser suite covers desktop/mobile flows, ten automated accessibility scans and authentication/request/upload boundaries. Automated accessibility checks do not establish complete accessibility compliance.
- Local Semgrep rules cover dynamic code execution, SQL interpolation and legacy cryptographic hashes. No new dependencies or public deployment are part of this change.

Reports and screenshots are under `test-results/`.

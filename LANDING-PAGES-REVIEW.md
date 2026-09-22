# Location and occasion pages — 15 September 2026

## Coverage and content

The public Locations hub contains 49 pages: seven emirates and the 42 Dubai location topics identified in Lux Motors' navigation. The Occasions hub contains all 15 occasion topics. Full route inventories and original copy are in `src/lib/location-pages.ts` and `src/lib/occasion-pages.ts`. The competitor inventory is retained locally in `.local/page-research/page-inventory.json`. Dubai South covers its Dubai South villa-project topic.

Each detail page has a photograph, original arrival or event planning information, a relevant selection of up to nine available catalogue cars, working shared filters, an inline rental request, a contextual question and related pages. Canonical URLs, breadcrumb structured data and sitemap entries establish the hierarchy. Dynamic rendering reads current fleet data on each request. Car descriptions remain removed.

Requests include the destination or occasion in editable notes. Delivery options use canonical emirate names. Forms create pending reservations and make no promise of included chauffeurs, hotel partnerships, venue access, filming permission, prices or confirmed date availability. English long-form guidance is marked as English; shared controls have translations. Native-speaker review is still outstanding.

## Photographs

Dubai's accepted skyline remains. The other emirates now use Yas Island, Al Badayer Retreat, Fairmont Ajman, Vida Beach Resort Umm Al Quwain, Mövenpick Resort Al Marjan Island and InterContinental Fujairah Resort. Other destination pages use accurately captioned district imagery; a district picture is not labelled as a particular hotel.

Local WebP files and attribution records are in `public/destinations/`; `/image-credits` exposes the credits. Wikimedia images have their recorded Creative Commons or public-domain terms. Four official property photographs (Al Badayer, Fairmont, Vida and InterContinental) are local design-preview assets whose republication permission has not been verified. **Obtain publication rights or substitute licensed images before public deployment.** Download provenance and conversion details are recorded in `sources.json` and `scripts/download-destination-images.mjs`.

## Verification and limits

`scripts/test-landing-pages.mjs` checks all 64 routes, canonical URLs, sitemap inclusion, displayed inventory, brand and model filtering on every page, photo decoding and contextual booking details. Representative hubs and details are checked at six viewport widths and with axe; two actual pending requests are verified in SQLite and the generated test records are removed. Unknown routes return 404. Reports and screenshots are under `test-results/`.

`npm test` covers unique routes, media references and eligible vehicle selection, alongside existing catalogue and reservation tests. Homepage, regional controls, partnership and browser regression suites cover shared navigation and transactional boundaries. Semgrep is limited to the three configured repository rules; passing it does not establish comprehensive security. No new dependencies, public deployment or external customer messages were introduced.

Business verification prerequisites in `CONTENT-REVIEW.md` remain. Google's guidance review is documented there; it does not provide a ranking guarantee.

## Partnership enquiries

The Earn with us section links to separate consignment and business enquiry choices. Consented, validated submissions are saved in SQLite and displayed at the authenticated `/admin/partners` page. No email delivery or automated monthly lead distribution has been implemented; business owners submit interest for the team to review. The existing process-local request limiter is not a distributed abuse-prevention service.

# Monthly pages and WhatsApp enquiries

20 September 2026

- Added direct `https://wa.me/971545974005` links to shared vehicle cards and vehicle detail enquiry controls. Messages include the vehicle and, for monthly cards, the 30-day/20% offer. Card messages also include the selected photographed colour. Messages are URL-encoded and opened with `noopener noreferrer`; no messages are sent automatically.
- Restored the floating WhatsApp control in the global layout. It is visible immediately on public pages, uses the site's gold theme, respects mobile safe areas and reduced motion, and stays below navigation overlays. It is omitted on admin pages. The footer reserves space below its final links.
- Centred the full-width monthly price note and linked the homepage and footer to `/monthly-luxury-car-rental`. Added monthly navigation for desktop and mobile; intermediate screen widths use the existing menu drawer to avoid crowding the centred logo.
- Added the monthly catalogue with 30-day price filtering, sorting and facet counts. Dedicated product URLs use `/monthly-luxury-car-rental/{brand}/{model}`. Monthly cards and related monthly cars link to these pages. Vehicle pages share a component with daily listings and show their own monthly title, canonical, description, structured-data URL, price comparison, savings and booking context.
- Existing daily URLs with `?plan=monthly` permanently redirect to the corresponding monthly URL while preserving colour, dates and location. Unknown vehicles return not found. Monthly URLs are included in the sitemap.
- Booking summaries preserve monthly rate and detail-page context. The offer remains 30 times the current daily rate less 20%; no stored source prices were overwritten.

Validation: 53 tests passed, including offline server rendering of monthly/daily detail pages, metadata and redirects, sitemap coverage, monthly filters, price consistency and WhatsApp URL encoding. Production build and its TypeScript checks passed. Local Semgrep checked 108 source files against three configured rules with no findings. This is a limited scan, not a comprehensive security audit.

Browser checks and opening WhatsApp were not performed under the existing browsing restriction. No new dependencies were added. Local preview remains http://127.0.0.1:43117, bound to loopback.

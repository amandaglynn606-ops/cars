# Carousels and layout revision

20 September 2026

- Brand results show every matching vehicle in a scroll-snap carousel. The monthly carousel includes every published, available car with a positive daily rate. Controls support arrows, touch scrolling, keyboard input, RTL and reduced motion. Images remain lazy-loaded.
- Public monthly prices now use 30 times the current daily price, less 20%, rounded to two decimal places. The crossed-out comparison is 30 daily rentals. A shared calculation supplies public catalogue, detail and booking data without replacing stored source prices. Admin pricing displays this calculated offer as read-only when a daily rate exists. Tests cover price consistency, rounding, invalid rates and repeated application.
- Six practical FAQs appear in two columns of three on desktop and one column on mobile. Topics cover passports, Emirates ID, minimum age, driving permits, deposits and monthly terms. Provider-specific eligibility remains subject to confirmation.
- Rebuilt the footer with a reservation invitation, grouped navigation, location links and a compact legal row. Centred brand/category collection and directory headings. Removed visible breadcrumb navigation across pages and the collection eyebrow.
- Occasion dropdown headings keep the icon and title in one row. Gold scrollbars use reserved gutters and padding in filters and navigation; filter counts cannot shrink into the scroll track.
- The events section has a full-width image stage, keyboard-accessible tabs and GSAP image/text transitions. Current backdrops are existing city/landmark photography. **Real event/artist imagery and verified dates remain pending research permission.** Date fields are deliberately empty; no confirmed schedule or artist lineup is claimed and no Event structured data is emitted.

Validation: 47 tests passed, TypeScript check passed, production build passed. Local Semgrep ran three configured rules on 104 source files with no findings; this is a limited scan, not a comprehensive security review. Browser checks and external research remain disabled under the user's workspace instructions. No dependencies were added.

Preview: http://127.0.0.1:43117 (loopback only).

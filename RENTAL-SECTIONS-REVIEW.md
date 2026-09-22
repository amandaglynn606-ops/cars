# Homepage, agency subscription and destination images

Reviewed 20 September 2026.

- Replaced homepage category tiles, SUV listings, booking steps and final catalogue promotion with monthly rentals and event enquiry cards. Monthly cards use existing monthly prices and preserve monthly intent into the vehicle and booking pages.
- Event cards cover the Abu Dhabi Grand Prix, Dubai concerts, Abu Dhabi concerts and Dubai World Cup. They carry an allowlisted event context into the rental form. Dates and line-ups are not presented as verified; users are directed to confirm them with organisers.
- Agency applications now appear immediately after the introduction. Removed the repetitive offer and process blocks. The form offers monthly subscriptions to display cars or rental leads; fees and subscription terms require confirmation before activation.
- Replaced Sharjah overview/banner imagery with the existing local 4032 × 2268 waterfront original, and Abu Dhabi with the existing local 3150 × 2100 Grand Mosque original. Preserved original JPEG pixels, updated attribution notes and set rendered image quality to 90. The specific Yas Island page retains its Yas Island image.

Validation: 44 automated tests passed; TypeScript check and production build passed. Image metadata confirms the dimensions above. Local Semgrep ran three configured rules against 101 source files with zero findings. This limited scan is not a comprehensive security audit. Browser checks and external verification were not run because browsing and URL fetching remain disabled. No new dependencies were added.

Project preview remains bound to http://127.0.0.1:43117.

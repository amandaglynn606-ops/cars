# Navigation redesign — 20 September 2026

All four dropdowns now share a charcoal-and-bronze panel, larger editorial headings, clear overview links and consistent focus and hover treatments. Brands use the existing local bronze logos. Locations use an emirate selector with an area directory; occasions retain all four groups and 22 links. Fleet navigation keeps categories separate from the vehicle list and includes small actual vehicle previews. The mobile drawer uses the same content in compact disclosures.

GSAP provides panel entrances/exits, staggered content reveals, mobile height transitions and emirate-content fades. CSS handles underline, chevron, image and link hover feedback. Motion respects reduced-motion settings, including changes while a panel is open. Opening on pointer hover is delayed to avoid accidental flyouts; clicks and keyboard activation also work. Escape closes a disclosure and returns focus to its trigger; Arrow Down enters it. Closing content is inert during its exit. Timers, observers and animation timelines are cleaned up. Links remain in the rendered markup when panels are closed.

Validation: 42 existing tests, TypeScript check and production build passed. Local Semgrep ran three rules across 99 source files with zero findings. These rules cover dynamic code execution, interpolated SQL and legacy cryptographic hashes; they are not a comprehensive security assessment. No dependencies, external assets, authentication flows or data-writing endpoints were added.

Browser interaction, accessibility scans and responsive screenshots were not run because browsing remains disabled. The browser regression script was updated for the new menus but is not presented as a passing run. Local preview remains bound to 127.0.0.1:43117.

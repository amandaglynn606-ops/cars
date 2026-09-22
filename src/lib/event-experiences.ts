export type EventArtist = {
  name: string
  date: string
  venue: string
  image: string
  description: string
  ticket: string
}
export type EventExperience = {
  subtitle: string
  overview: string
  gallery: { src: string; alt: string; caption: string }[]
  artists: EventArtist[]
  schedule: { day: string; activity: string; venue: string; note: string }[]
  visit: { heading: string; text: string }[]
  sources: { label: string; url: string }[]
}
const gp = 'https://www.abudhabigp.com/en/yasalam'
const arena = 'https://www.etihadarena.ae/en/events'
const dubai = 'https://coca-cola-arena.com/'
const drc = 'https://dubairacingclub.com/'

export const eventExperiences: Record<string, EventExperience> = {
  'abu-dhabi-grand-prix': {
    subtitle: 'Race days. Headline nights. One extraordinary week.',
    overview:
      'The 2026 Formula 1 season finale runs from 4–6 December at Yas Marina Circuit, with music across Yas Island from 2 December. The week brings Andrea Bocelli, Lewis Capaldi, Alex Warren, Anyma, Imagine Dragons, The Chainsmokers and The Script. Choose your rental dates around the events you are actually attending: the concert venues and admission arrangements are not all the same.',
    gallery: [
      {
        src: '/verified-places/gp-circuit-action.webp',
        alt: 'Formula 1 car on track at Yas Marina Circuit',
        caption: 'The racing · Yas Marina Circuit',
      },
      {
        src: '/verified-places/gp-driver-stage.webp',
        alt: 'Formula 1 driver interviews at the Abu Dhabi Grand Prix',
        caption: 'Beyond the track · driver interviews and fan experiences',
      },
      {
        src: '/verified-places/abu-dhabi-grand-prix.webp',
        alt: 'Formula 1 car at Yas Marina Circuit after dark',
        caption: 'The atmosphere · racing into the evening',
      },
    ],
    artists: [
      {
        name: 'Andrea Bocelli',
        date: 'Wednesday, 2 December 2026',
        venue: 'Etihad Arena · Yasalam Classics',
        image: '/verified-places/andrea-bocelli.webp',
        description:
          'The 30th Anniversary Romanza World Tour opens the entertainment week. Etihad Arena lists doors at 6:00 pm and tickets from AED 295. This is a separately ticketed concert.',
        ticket:
          'https://www.etihadarena.ae/en/event-booking/yasalam-classics-presents-andrea-bocelli-live-in-concert',
      },
      {
        name: 'Lewis Capaldi',
        date: 'Thursday, 3 December 2026',
        venue: 'Etihad Live · Yas Island',
        image: '/verified-places/gp-artist-2.webp',
        description:
          'Thursday’s after-race concert brings Lewis Capaldi to the Abu Dhabi GP entertainment programme. Check which concert days your Grand Prix ticket covers before travelling.',
        ticket: gp,
      },
      {
        name: 'Alex Warren',
        date: 'Friday, 4 December 2026',
        venue: 'Etihad Live · Yas Island',
        image: '/verified-places/gp-artist-3.webp',
        description:
          'Alex Warren performs on Friday of the Grand Prix weekend. Leave time between the circuit programme and concert entry; your ticket holder instructions provide the final gate and access details.',
        ticket: gp,
      },
      {
        name: 'Anyma presents ÆDEN',
        date: 'Friday, 4 December 2026',
        venue: 'Yas Gateway Park · official after-party',
        image: '/verified-places/gp-anyma.webp',
        description:
          'Anyma’s audiovisual production blends electronic music, digital art and large-scale visuals. This is the official after-party at a different venue from Alex Warren’s concert. Check its separate admission or VIP-table terms.',
        ticket: gp,
      },
      {
        name: 'Imagine Dragons',
        date: 'Saturday, 5 December 2026',
        venue: 'Etihad Live · Yas Island',
        image: '/verified-places/gp-artist-5.webp',
        description:
          'Imagine Dragons headline Saturday’s after-race entertainment following qualifying day. Plan a late return or keep the car overnight if you are also attending Sunday’s race.',
        ticket: gp,
      },
      {
        name: 'The Chainsmokers',
        date: 'Sunday, 6 December 2026',
        venue: 'Etihad Live · Yas Island',
        image: '/verified-places/gp-artist-6.webp',
        description:
          'The Chainsmokers join the Sunday entertainment bill after the season finale. Include the concert and the journey back to your hotel in your rental period.',
        ticket: gp,
      },
      {
        name: 'The Script',
        date: 'Sunday, 6 December 2026',
        venue: 'Etihad Live · Yas Island',
        image: '/verified-places/gp-artist-7.webp',
        description:
          'The Script also appear on Sunday’s bill. The organiser has not supplied a running order in the information used here; check the official GP app for final performance times.',
        ticket: gp,
      },
    ],
    schedule: [
      {
        day: 'Wed 2 Dec',
        activity: 'Andrea Bocelli',
        venue: 'Etihad Arena',
        note: 'Yasalam Classics · doors 6:00 pm · separate concert ticket',
      },
      {
        day: 'Thu 3 Dec',
        activity: 'Lewis Capaldi',
        venue: 'Etihad Live',
        note: 'After-race concert programme · check your GP ticket access',
      },
      {
        day: 'Fri 4 Dec',
        activity: 'F1 practice · Alex Warren · Anyma',
        venue: 'Circuit / Etihad Live / Yas Gateway Park',
        note: 'Alex Warren: after-race concert. Anyma: separate official after-party.',
      },
      {
        day: 'Sat 5 Dec',
        activity: 'F1 practice & qualifying · Imagine Dragons',
        venue: 'Yas Marina Circuit / Etihad Live',
        note: 'Race sessions and concert gates have separate schedules.',
      },
      {
        day: 'Sun 6 Dec',
        activity: 'Grand Prix · The Chainsmokers & The Script',
        venue: 'Yas Marina Circuit / Etihad Live',
        note: 'Race day and closing concerts · allow for a late departure.',
      },
    ],
    visit: [
      {
        heading: 'Concert tickets & Golden Circle',
        text: 'The organiser states that general admission to after-race concerts is exclusive to Abu Dhabi GP ticket holders. Confirm your ticket’s valid concert days. Golden Circle is an upgrade offering closer stage access and fast-track entry; it is not a replacement for required admission. Bocelli and the official after-party have their own ticket terms.',
      },
      {
        heading: 'Parking & the correct venue',
        text: 'Yas Marina Circuit, Etihad Live, Etihad Arena and Yas Gateway Park are different destinations. Use your event’s issued parking map and access instructions. A rental booking does not provide a circuit parking permit, restricted-road access or venue valet service.',
      },
      {
        heading: 'Driving from Dubai',
        text: 'Discuss the full Dubai–Yas Island return itinerary and mileage allowance before booking. Request delivery to your hotel or residence with time for inspection. Race-weekend traffic can substantially change journey times; do not base a handover on an ordinary-day drive estimate.',
      },
      {
        heading: 'Entry, accessibility & bags',
        text: 'Check the final admission, age and bag rules for each concert and ticket category. Arrange accessible seating with the organiser before reserving your car so the vehicle and handover address suit your party. Doors opening and the artist’s stage time are different.',
      },
      {
        heading: 'Your weekend rental',
        text: 'A two-person trip with light luggage may suit a sports car; hotel stays and groups often need a sedan or SUV. Ask for the actual passenger and luggage capacity, permitted drivers, deposit, insurance excess and mileage before confirming. Only an authorised, fit-to-drive driver should take the wheel.',
      },
      {
        heading: 'Return after the final show',
        text: 'Give the team your last concert and whether you are staying on Yas Island or returning to another emirate. Agree a realistic return window or an extra rental day. Event admission, parking, accommodation and chauffeur services are separate from the listed self-drive rate.',
      },
    ],
    sources: [
      { label: 'Official 2026 Yasalam lineup & ticket access', url: gp },
      {
        label: 'Formula 1 race dates & sessions',
        url: 'https://www.formula1.com/en/racing/2026/united-arab-emirates',
      },
      {
        label: 'Andrea Bocelli: venue, doors & tickets',
        url: 'https://www.etihadarena.ae/en/event-booking/yasalam-classics-presents-andrea-bocelli-live-in-concert',
      },
    ],
  },
  'dubai-concerts': {
    subtitle: 'The artists. The dates. Your night in Dubai.',
    overview:
      'Coca-Cola Arena’s autumn 2026 calendar brings Arabic pop, Filipino music and Indian playback favourites to City Walk. The performances below are individually ticketed shows. Use the artist and date when requesting your car so dinner, hotel collection and the journey home fit the actual evening.',
    gallery: [
      {
        src: '/verified-places/dubai-concerts.webp',
        alt: 'Maroon 5 performing to a crowd at Coca-Cola Arena in Dubai',
        caption: 'Inside Coca-Cola Arena · archive Maroon 5 concert photograph',
      },
      {
        src: '/verified-places/dubai-tj-kz.webp',
        alt: 'TJ Monterde and KZ Tandingan concert artwork for Coca-Cola Arena',
        caption: '11 October 2026 · In Between Middle East Tour · official artwork',
      },
    ],
    artists: [
      {
        name: 'Najwa Karam',
        date: 'Friday, 2 October 2026',
        venue: 'Coca-Cola Arena · City Walk',
        image: '/verified-places/dubai-najwa-karam.webp',
        description:
          'A headline Arabic music night on the arena’s October calendar. Confirm the show’s doors and seating category directly with the venue.',
        ticket: 'https://coca-cola-arena.com/music/2050/najwa-karam',
      },
      {
        name: 'TJ Monterde & KZ Tandingan',
        date: 'Sunday, 11 October 2026',
        venue: 'Coca-Cola Arena · City Walk',
        image: '/verified-places/dubai-tj-kz.webp',
        description:
          'The In Between Middle East Tour brings the Filipino artists to Dubai. Choose your car around the number of guests and your full evening itinerary.',
        ticket: dubai,
      },
      {
        name: 'Nancy Ajram',
        date: 'Saturday, 24 October 2026',
        venue: 'Coca-Cola Arena · City Walk',
        image: '/verified-places/dubai-nancy-ajram.webp',
        description:
          'Nancy Ajram Live is listed for 24 October. Arrange collection before dinner or the concert and agree the vehicle return around the show.',
        ticket: 'https://coca-cola-arena.com/music/2059/nancy-ajram-live',
      },
      {
        name: 'Shaan',
        date: 'Sunday, 25 October 2026',
        venue: 'Coca-Cola Arena · City Walk',
        image: '/verified-places/dubai-shaan.webp',
        description:
          'The All of Me Tour comes to Dubai on 25 October. Buy admission through the organiser and request your rental separately.',
        ticket: 'https://coca-cola-arena.com/music/2125/shaan-all-of-me-tour',
      },
      {
        name: 'JONY',
        date: 'Wednesday, 4 November 2026',
        venue: 'Coca-Cola Arena · City Walk',
        image: '/verified-places/dubai-jony.webp',
        description:
          'JONY appears on the November programme. Confirm any age limits, doors and show timings with the arena before finalising your collection time.',
        ticket: dubai,
      },
      {
        name: 'Amr Diab',
        date: 'Saturday, 7 November 2026',
        venue: 'Coca-Cola Arena · City Walk',
        image: '/verified-places/dubai-amr-diab.webp',
        description:
          'Amr Diab’s November concert is listed by Coca-Cola Arena. Plan for event traffic and a late exit when agreeing the rental period.',
        ticket: dubai,
      },
    ],
    schedule: [
      { day: '2 October', activity: 'Najwa Karam', venue: 'Coca-Cola Arena', note: '2026 · music' },
      {
        day: '11 October',
        activity: 'TJ Monterde & KZ Tandingan',
        venue: 'Coca-Cola Arena',
        note: '2026 · In Between Middle East Tour',
      },
      {
        day: '24 October',
        activity: 'Nancy Ajram',
        venue: 'Coca-Cola Arena',
        note: '2026 · Nancy Ajram Live',
      },
      {
        day: '25 October',
        activity: 'Shaan',
        venue: 'Coca-Cola Arena',
        note: '2026 · All of Me Tour',
      },
      { day: '4 November', activity: 'JONY', venue: 'Coca-Cola Arena', note: '2026 · music' },
      { day: '7 November', activity: 'Amr Diab', venue: 'Coca-Cola Arena', note: '2026 · music' },
    ],
    visit: [
      {
        heading: 'City Walk arrival',
        text: 'Coca-Cola Arena is in City Walk, accessible from Financial Centre Road and Sheikh Zayed Road. Give the rental team your hotel or home address and the show you are attending. The arena’s official visitor page is the source for current approach and drop-off guidance.',
      },
      {
        heading: 'Paid parking & drop-off',
        text: 'The arena lists paid parking managed through PARKONIC, subject to capacity, with additional public parking nearby. It identifies a drop-off zone in front of entrances A, B and C and states that valet parking is not available. Parking charges are separate from your rental.',
      },
      {
        heading: 'Tickets & ID',
        text: 'Purchase tickets through the official arena website or its box office. For box-office ticket collection, the venue asks for photo ID and the card used to purchase. Each show has its own age, seating and admission policy; these are not determined by the rental provider.',
      },
      {
        heading: 'Dinner before the show',
        text: 'City Walk provides a nearby setting for a meal before entry. Agree the vehicle handover earlier in the day and allow time to inspect it, park and reach the gate. Keep personal bags small enough to meet the performance’s entry policy.',
      },
      {
        heading: 'Accessible visits',
        text: 'The venue lists designated parking bays for People of Determination and accessible public entry points. Arrange seating or entry assistance directly with the arena and tell the rental team about access or luggage requirements before choosing a model.',
      },
      {
        heading: 'After the performance',
        text: 'Allow for crowds leaving the arena and a slower drive out of City Walk. Agree the return time in advance; a next-day return may suit a late show. RTA taxis and Dubai Metro are alternatives when driving is not appropriate; check current operating times directly with RTA.',
      },
    ],
    sources: [
      { label: 'Coca-Cola Arena: upcoming artists & dates', url: dubai },
      {
        label: 'Official parking, drop-off & visitor guidance',
        url: 'https://about.coca-cola-arena.com/plan-your-visit',
      },
    ],
  },
  'abu-dhabi-concerts': {
    subtitle: 'An arena full of music. An evening made yours.',
    overview:
      'Etihad Arena sits on the Yas Bay waterfront on Yas Island. The autumn and winter programme includes Tamer Hosny and Tamer Ashour, Hans Zimmer, Tarkan and Andrea Bocelli. Plan around your selected performance, especially when travelling from Dubai or staying overnight on Yas Island.',
    gallery: [
      {
        src: '/verified-places/hans-zimmer.webp',
        alt: 'Hans Zimmer Live official Etihad Arena event artwork',
        caption: '13 November 2026 · Hans Zimmer Live',
      },
      {
        src: '/verified-places/andrea-bocelli.webp',
        alt: 'Andrea Bocelli official Yasalam Classics event artwork',
        caption: '2 December 2026 · Yasalam Classics presents Andrea Bocelli',
      },
      {
        src: '/verified-places/tamer-hosny-ashour.webp',
        alt: 'Tamer Hosny and Tamer Ashour official Etihad Arena artwork',
        caption: '17 October 2026 · Tamer Hosny & Tamer Ashour',
      },
    ],
    artists: [
      {
        name: 'Tamer Hosny & Tamer Ashour',
        date: 'Saturday, 17 October 2026',
        venue: 'Etihad Arena · Yas Bay',
        image: '/verified-places/tamer-hosny-ashour.webp',
        description:
          'Two headline Egyptian artists share the evening. Doors are listed at 7:30 pm, tickets from AED 137, and children under two are not admitted. A valid event ticket is required.',
        ticket: 'https://www.etihadarena.ae/en/event-booking/tamer-ashour-tamer-hosni',
      },
      {
        name: 'Hans Zimmer',
        date: 'Friday, 13 November 2026',
        venue: 'Etihad Arena · Yas Bay',
        image: '/verified-places/hans-zimmer.webp',
        description:
          'Live film scores with orchestra, band and immersive visuals. Doors are listed at 6:30 pm and tickets from AED 245. The venue admits ticketed guests aged six and above.',
        ticket: 'https://www.etihadarena.ae/en/event-booking/hans-zimmer-live',
      },
      {
        name: 'Andrea Bocelli',
        date: 'Wednesday, 2 December 2026',
        venue: 'Etihad Arena · Yasalam Classics',
        image: '/verified-places/andrea-bocelli.webp',
        description:
          'The 30th Anniversary Romanza World Tour comes to Yas Island before the Grand Prix weekend. Doors are listed at 6:00 pm, with tickets from AED 295.',
        ticket:
          'https://www.etihadarena.ae/en/event-booking/yasalam-classics-presents-andrea-bocelli-live-in-concert',
      },
    ],
    schedule: [
      {
        day: '17 October',
        activity: 'Tamer Hosny & Tamer Ashour',
        venue: 'Etihad Arena',
        note: '2026 · doors 7:30 pm · tickets from AED 137',
      },
      {
        day: '13 November',
        activity: 'Hans Zimmer Live',
        venue: 'Etihad Arena',
        note: '2026 · doors 6:30 pm · tickets from AED 245',
      },
      {
        day: '27 November',
        activity: 'Tarkan',
        venue: 'Etihad Arena',
        note: '2026 · consult venue for doors and current ticket prices',
      },
      {
        day: '2 December',
        activity: 'Andrea Bocelli',
        venue: 'Etihad Arena',
        note: '2026 · doors 6:00 pm · tickets from AED 295',
      },
    ],
    visit: [
      {
        heading: 'Yas Bay waterfront',
        text: 'Etihad Arena is on Yas Bay, Yas Island. It is a separate venue from the Grand Prix circuit and Etihad Live. Use the destination on your concert ticket and request a hotel or residential handover point where a rental inspection can take place safely.',
      },
      {
        heading: 'Doors & performance times',
        text: 'All listed door times are local UAE time. Doors opening is not the time an artist takes the stage. Ticket prices shown here are the venue’s advertised starting prices when checked; categories and availability may change.',
      },
      {
        heading: 'Event-specific parking',
        text: 'The arena publishes parking maps and directions that change by event and ticket category. Use the map for your performance rather than a map for a different sporting fixture. A concert ticket or luxury rental does not automatically include premium parking.',
      },
      {
        heading: 'Age & access requirements',
        text: 'Age limits vary: Hans Zimmer is listed for ages six and above, while the Tamer Hosny and Tamer Ashour show excludes children under two. Check your own concert policy. The venue directs wheelchair-seating enquiries to its concierge team on 600 511 115.',
      },
      {
        heading: 'A stay on Yas Island',
        text: 'If your evening includes Yas Bay dining or an overnight hotel stay, include both in the rental dates. Choose luggage capacity as well as seats. Agree the delivery entrance, contact number and return address before your arrival.',
      },
      {
        heading: 'Travelling from Dubai',
        text: 'Tell the provider about inter-emirate travel and include the complete return journey when discussing mileage. Plan around traffic and a late finish, with an authorised driver who remains fit to drive. A chauffeur is a separate service enquiry.',
      },
    ],
    sources: [
      { label: 'Etihad Arena: official concert calendar', url: arena },
      {
        label: 'Venue parking maps & directions',
        url: 'https://www.etihadarena.ae/en/plan-your-visit/direction-and-parking',
      },
      {
        label: 'Hans Zimmer: entry rules, doors & tickets',
        url: 'https://www.etihadarena.ae/en/event-booking/hans-zimmer-live',
      },
    ],
  },
  'dubai-world-cup': {
    subtitle: 'Racing, hospitality and a day at Meydan.',
    overview:
      'Dubai World Cup is an international horse-racing meeting at Meydan Racecourse in Nad Al Sheba. The completed 30th anniversary edition, held on 28 March 2026, featured nine races and US$30.5 million in prize money. The next edition’s date, entries and entertainment programme are awaiting confirmation in this guide; the race photographs and results below refer to past editions.',
    gallery: [
      {
        src: '/verified-places/meydan-racing.webp',
        alt: 'Horses racing at Meydan Racecourse at night',
        caption: 'Racing at Meydan · archive Dubai Racing Club photograph',
      },
      {
        src: '/verified-places/meydan-crowd.webp',
        alt: 'Racegoers photographing the action at Meydan',
        caption: 'The race-day atmosphere · archive photograph',
      },
      {
        src: '/verified-places/meydan-parade.webp',
        alt: 'Horses and participants preparing for racing at Meydan',
        caption: 'Beyond the finish line · archive photograph',
      },
    ],
    artists: [],
    schedule: [
      {
        day: 'Latest edition',
        activity: 'Saturday, 28 March 2026',
        venue: 'Meydan Racecourse',
        note: 'Completed event · 30th anniversary meeting',
      },
      {
        day: 'Feature race',
        activity: 'Dubai World Cup',
        venue: 'Meydan dirt track',
        note: '2026 winner: Magnitude · US$12 million feature race',
      },
      {
        day: 'Turf highlights',
        activity: 'Longines Dubai Sheema Classic & Dubai Turf',
        venue: 'Meydan turf track',
        note: '2026 winners: Calandagan and Ombudsman',
      },
      {
        day: 'Sprint highlights',
        activity: 'Dubai Golden Shaheen & Al Quoz Sprint',
        venue: 'Meydan Racecourse',
        note: '2026 winners: Dark Saffron and Native Approach',
      },
      {
        day: 'Next edition',
        activity: 'Date & programme to be confirmed',
        venue: 'Meydan · Dubai',
        note: 'Confirm the organiser’s current calendar before reserving travel.',
      },
    ],
    visit: [
      {
        heading: 'Tickets & hospitality',
        text: 'Arrange admission directly with Dubai Racing Club. Grandstand, dining and private-suite experiences have different inclusions and entrances. Your rental covers the vehicle arrangement; race tickets, hospitality and parking permissions are separate.',
      },
      {
        heading: 'Dining at Meydan',
        text: 'The club’s current venue directory lists the Paddock Garden, Parade Ring Lounge, Winner’s Circle Restaurant, Silks and private suites. Availability and menus vary by race meeting. Confirm what is offered specifically for the next World Cup before selecting a package.',
      },
      {
        heading: 'Dress & comfort',
        text: 'Check the dress code attached to your chosen admission or hospitality package. Formalwear, hats and personal bags may make a sedan or SUV more practical than a low sports car. Confirm ease of entry, passenger capacity and boot space for your guests.',
      },
      {
        heading: 'Arrival & parking',
        text: 'Meydan Racecourse is on Al Meydan Road in Nad Al Sheba 1. Follow the organiser’s event-day route, permitted parking and ticketed entrance instructions. Arrange the car handover at your hotel or residence; a venue forecourt is not an assumed rental-delivery point.',
      },
      {
        heading: 'Entertainment programme',
        text: 'A performer lineup for the next World Cup has not been confirmed in the official information used for this guide. The event is a horse-racing meeting with hospitality and race-day activities. Any future musical programme will be listed once announced by the organiser.',
      },
      {
        heading: 'From racing to the evening',
        text: 'Include dinner, your hotel and any late plans in your requested rental period. Agree a return window that allows for traffic leaving Meydan. If a late finish makes the original return impractical, ask for the cost and availability of an additional rental day.',
      },
    ],
    sources: [
      { label: 'Dubai Racing Club: event calendar & race results', url: drc },
      {
        label: 'Official race-day visitor information',
        url: 'https://dubairacingclub.com/plan-your-day/',
      },
      { label: 'Meydan dining & hospitality', url: 'https://dubairacingclub.com/dining/' },
    ],
  },
}

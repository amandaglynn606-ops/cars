export type OccasionGuide = {
  group: string
  description: string
  image: { src: string; caption: string; alt: string; generated: boolean }
  dubaiHeading: string
  dubaiGuide: string
  carAdvice: string
  locationSlug: string
}
export const occasionGuides: Record<string, OccasionGuide> = {
  'date-night': {
    group: 'Romance & time together',
    description:
      'Plan a Dubai date-night car rental for dinner, a show or a waterfront evening. Explore cars and confirm timing, parking and the return arrangement.',
    image: {
      src: '/occasions/dubai-date-night.webp',
      caption: 'Dubai Marina-inspired dinner for two',
      alt: 'AI illustration of a candlelit table overlooking a Dubai-inspired marina at dusk',
      generated: true,
    },
    dubaiHeading: 'An evening with room to enjoy it',
    dubaiGuide:
      "For dinner in DIFC, ask the restaurant for its car entrance rather than navigating only to the building name. If you prefer Dubai Marina, agree the restaurant's valet or parking point before you arrive. For a Downtown show followed by dinner, keep both bookings in the same district when you want less time on the road.",
    carAdvice:
      'A low sports car can be awkward with formal clothing. Explore door access, seat comfort and a closed-roof option as well as the exterior style.',
    locationSlug: 'dubai-marina',
  },
  'romantic-getaways': {
    group: 'Romance & time together',
    description:
      'Plan a romantic getaway from Dubai with the right rental car for two, overnight bags and your hotel itinerary. Explore models and request your dates.',
    image: {
      src: '/occasions/dubai-romantic-getaway.webp',
      caption: 'A Dubai-inspired seaside escape',
      alt: 'AI illustration of a breakfast terrace overlooking a Dubai-inspired coastline',
      generated: true,
    },
    dubaiHeading: 'A weekend at your own pace',
    dubaiGuide:
      'Palm Jumeirah works for a stay where the beach, dinner and breakfast are close together. A Creek Harbour stay gives you a different waterfront setting for a quiet walk. For a desert retreat outside the city, ask the property how far normal road access reaches and arrange the final approach before choosing the vehicle.',
    carAdvice:
      "Two overnight bags may fit a sedan more comfortably than a convertible's boot. Check space with the roof stowed if an open-top drive is part of the plan.",
    locationSlug: 'palm-jumeirah',
  },
  'surprise-gifts': {
    group: 'Celebrations & milestones',
    description:
      "Plan a surprise car-rental gift in Dubai. Choose the recipient's preferred model and confirm driver eligibility, discreet contact and handover details.",
    image: {
      src: '/occasions/dubai-surprise-gift.webp',
      caption: 'A surprise driving-experience gift in Dubai',
      alt: 'AI illustration of a gift box with a car key and flowers in a Dubai-inspired courtyard',
      generated: true,
    },
    dubaiHeading: 'Make the reveal easy to arrange',
    dubaiGuide:
      'For a surprise at a Downtown hotel, have the guest entrance and a named contact ready; a driveway is not necessarily available for a presentation. At a home in Dubai Hills or another gated community, arrange visitor access first. Keep flowers and the gift box separate from the car until the permitted setup is agreed.',
    carAdvice:
      "Start with the recipient's preferred model, but check that the actual driver meets the vehicle's rental requirements before building the surprise around it.",
    locationSlug: 'downtown-dubai',
  },
  'marriage-proposals': {
    group: 'Romance & time together',
    description:
      'Arrange a car for a Dubai proposal with time for dinner, photographs and the return trip. Plan venue access, flowers and vehicle permissions in advance.',
    image: {
      src: '/occasions/dubai-wedding.webp',
      caption: 'A Dubai-inspired wedding-day arrival',
      alt: 'AI illustration of wedding rings and a bouquet beside a luxury car in a Dubai-inspired setting',
      generated: true,
    },
    dubaiHeading: 'Keep the proposal, not the traffic, at the centre',
    dubaiGuide:
      'A Palm Jumeirah dinner or a Creek Harbour waterfront meeting needs a specific venue or parking point, not just a district pin. If a photographer is involved, agree where the car can legally stop and how the couple will reach the location. Confirm an indoor alternative with the venue if the setup depends on comfortable outdoor weather.',
    carAdvice:
      "A coupe or convertible suits two people travelling light. A sedan gives you more room for flowers and formal clothing without placing anything on the vehicle's bodywork.",
    locationSlug: 'dubai-creek-harbour',
  },
  honeymoons: {
    group: 'Romance & time together',
    description:
      'Choose a honeymoon rental car in Dubai around airport bags, hotel stays and outings for two. Explore models and request a personalised rental quote.',
    image: {
      src: '/occasions/dubai-romantic-getaway.webp',
      caption: 'A Dubai-inspired seaside escape',
      alt: 'AI illustration of a breakfast terrace overlooking a Dubai-inspired coastline',
      generated: true,
    },
    dubaiHeading: 'Leave room for more than the first arrival',
    dubaiGuide:
      'If you are combining a Palm Jumeirah stay with Downtown sightseeing, plan the hotel days and city days before choosing the rental period. A car collected after check-in may suit a couple who want to rest after flying. Include a second hotel if the honeymoon moves between the beach and the city, and confirm the final return there.',
    carAdvice:
      'For two large suitcases, begin with a sedan or SUV and ask about the exact boot space. A sports car can be a separate shorter rental after the bags are at the hotel.',
    locationSlug: 'palm-jumeirah',
  },
  'engagement-celebrations': {
    group: 'Celebrations & milestones',
    description:
      'Find a rental car for an engagement celebration in Dubai. Plan family seating, venue arrival, photographs and any approved vehicle decoration.',
    image: {
      src: '/occasions/dubai-wedding.webp',
      caption: 'A Dubai-inspired wedding-day arrival',
      alt: 'AI illustration of wedding rings and a bouquet beside a luxury car in a Dubai-inspired setting',
      generated: true,
    },
    dubaiHeading: 'Plan the arrival for the people attending',
    dubaiGuide:
      'For an engagement dinner on Palm Jumeirah or a family celebration in Jumeirah, confirm which entrance is reserved for guests and where relatives can wait. If photographs happen before dinner, allow time to move bags and outfits without delaying the group. Give each family car its own meeting point and contact rather than relying on a convoy.',
    carAdvice:
      'Check rear-seat access and passenger count first. Matching car colours or several vehicles can be requested, but each specific vehicle needs its own confirmation.',
    locationSlug: 'dubai',
  },
  'family-days-out': {
    group: 'Stays & days out',
    description:
      'Plan a family car rental in Dubai with suitable seats, child restraints and luggage space for a day at the beach, waterfront or local attractions.',
    image: {
      src: '/occasions/dubai-family-day.webp',
      caption: 'A Dubai-inspired family day out',
      alt: 'AI illustration of family outing bags and a stroller beside an SUV at a Dubai-inspired waterfront',
      generated: true,
    },
    dubaiHeading: 'Choose fewer stops and a comfortable car',
    dubaiGuide:
      'A Creek Harbour waterfront visit or a Jumeirah beach outing works better with a known parking point and a plan for the walk from the car. If your day includes an attraction at Dubai Parks and Resorts, include the longer drive from central Dubai in your itinerary. Keep pushchairs and spare clothing accessible rather than filling every seat with luggage.',
    carAdvice:
      "Send the number of adults, children's ages and the bags coming with you. Confirm child-seat availability and the luggage space remaining behind the seats you need.",
    locationSlug: 'dubai-creek-harbour',
  },
  weddings: {
    group: 'Celebrations & milestones',
    description:
      'Plan wedding car rental in Dubai around ceremony times, passengers and photographs. Explore models and confirm decoration, driver and venue requirements.',
    image: {
      src: '/occasions/dubai-wedding.webp',
      caption: 'A Dubai-inspired wedding-day arrival',
      alt: 'AI illustration of wedding rings and a bouquet beside a luxury car in a Dubai-inspired setting',
      generated: true,
    },
    dubaiHeading: 'Coordinate the ceremony and reception arrivals',
    dubaiGuide:
      'A ceremony in Jumeirah and a reception on Palm Jumeirah involve different arrival arrangements. Ask both venues for the guest entrance, staging area and photography rules. Give the team the order of stops and a contact who can respond on the day, so the couple do not have to manage the handover between appointments.',
    carAdvice:
      'A spacious rear seat and wide door opening may matter more than a dramatic exterior when travelling in formal clothing. Confirm passenger space with the actual vehicle.',
    locationSlug: 'dubai',
  },
  birthdays: {
    group: 'Celebrations & milestones',
    description:
      'Choose a birthday rental car in Dubai and plan the driver, collection point and celebration schedule. Explore actual models and request availability.',
    image: {
      src: '/occasions/dubai-surprise-gift.webp',
      caption: 'A surprise driving-experience gift in Dubai',
      alt: 'AI illustration of a gift box with a car key and flowers in a Dubai-inspired courtyard',
      generated: true,
    },
    dubaiHeading: 'Build the day around one memorable drive',
    dubaiGuide:
      "For a birthday dinner in Downtown Dubai or a gathering at a Marina hotel, arrange a proper car handover before guests arrive. If the recipient is being surprised, keep a separate planning contact and confirm the driver's eligibility first. A bouquet or present can make the reveal personal without attaching anything to the car.",
    carAdvice:
      'A two-seat sports car suits a driver and one guest; choose a sedan or SUV if the birthday group wants to travel together.',
    locationSlug: 'downtown-dubai',
  },
  anniversaries: {
    group: 'Romance & time together',
    description:
      'Plan an anniversary car rental in Dubai for dinner, a hotel stay or a day out. Explore comfortable models and arrange the full rental period.',
    image: {
      src: '/occasions/dubai-date-night.webp',
      caption: 'Dubai Marina-inspired dinner for two',
      alt: 'AI illustration of a candlelit table overlooking a Dubai-inspired marina at dusk',
      generated: true,
    },
    dubaiHeading: 'Make time for dinner and the following morning',
    dubaiGuide:
      'A waterfront dinner in Dubai Marina and an overnight stay on Palm Jumeirah call for a rental that includes the late finish or next-day return. Check the hotel parking arrangement and whether you will keep the car for breakfast or another outing. If the celebration is all in one district, a simple collection and return plan can reduce interruptions.',
    carAdvice:
      'Look at the actual interior, seat access and space for an overnight bag. A convertible is an option when the weather and luggage make an open-top journey comfortable.',
    locationSlug: 'dubai-marina',
  },
  graduations: {
    group: 'Celebrations & milestones',
    description:
      'Arrange a graduation car rental in Dubai with space for gowns, family and photographs. Confirm the ceremony entrance, driver eligibility and rental terms.',
    image: {
      src: '/occasions/dubai-graduation.webp',
      caption: 'A Dubai-inspired graduation celebration',
      alt: 'AI illustration of a graduation cap and diploma beside a car in a Dubai-inspired setting',
      generated: true,
    },
    dubaiHeading: 'From the ceremony to the family celebration',
    dubaiGuide:
      "Ask the university or event organiser for the ceremony entrance and where guests may collect passengers. Dubai International Academic City and Dubai Knowledge Park are different locations; use the institution's exact address. Leave time for photographs and changing out of a gown before a family meal in another part of Dubai.",
    carAdvice:
      'A graduation gift does not remove driver-age or licence requirements. For a family arrival, choose confirmed seating and easy access over a two-seat display car.',
    locationSlug: 'dubai',
  },
  'bachelor-bachelorette-parties': {
    group: 'Celebrations & milestones',
    description:
      'Plan rental cars for a bachelor or bachelorette celebration in Dubai with suitable seating, authorised drivers and a practical venue schedule.',
    image: {
      src: '/destinations/dubai-marina.webp',
      caption: 'Dubai Marina waterfront',
      alt: 'Dubai Marina waterfront',
      generated: false,
    },
    dubaiHeading: 'Keep the group and the return journey organised',
    dubaiGuide:
      'If dinner is in Dubai Marina and another venue is on Palm Jumeirah, identify a meeting point at each stop and decide who will travel in which car. Ask venues about permitted collection areas. Make the return journey part of the plan before the celebration, especially when some guests will need separate transport.',
    carAdvice:
      'Count passengers for every vehicle and use only approved drivers. An SUV may keep a small group together; a sports car cannot take extra guests for a short journey.',
    locationSlug: 'dubai-marina',
  },
  'yacht-parties': {
    group: 'Celebrations & milestones',
    description:
      'Arrange a rental car for a Dubai yacht departure. Plan Dubai Marina or Dubai Harbour access, guest bags, parking and the journey after the cruise.',
    image: {
      src: '/destinations/dubai-marina.webp',
      caption: 'Dubai Marina waterfront',
      alt: 'Dubai Marina waterfront',
      generated: false,
    },
    dubaiHeading: 'Get the boarding point before you set off',
    dubaiGuide:
      'Ask the yacht operator for the exact marina, gate and boarding instructions. Dubai Marina and Dubai Harbour are not interchangeable arrival pins. Arrange a legal road-accessible parking or handover point, then allow time to walk to the berth with bags. Confirm what happens to the car during the cruise and who is driving afterwards.',
    carAdvice:
      "Choose around the road passengers and bags, not the yacht's capacity. Check luggage space if guests are bringing food, clothing or overnight bags.",
    locationSlug: 'dubai-marina',
  },
  'corporate-events': {
    group: 'Work & productions',
    description:
      'Plan corporate-event car rental in Dubai around delegates, luggage, billing and event access. Request one vehicle or a coordinated multi-car quote.',
    image: {
      src: '/occasions/dubai-business-event.webp',
      caption: 'A Dubai-inspired business arrival',
      alt: 'AI illustration of a business bag and a sedan outside a Dubai-inspired event venue',
      generated: true,
    },
    dubaiHeading: "Use the organiser's arrival instructions",
    dubaiGuide:
      "For an event at Dubai World Trade Centre, ask for the specific hall or meeting entrance and any vehicle access instructions. A hotel meeting in DIFC may use a different entrance from the public lobby. Include the delegation's hotel and onward appointments, and leave space for event-related traffic without promising exact journey times.",
    carAdvice:
      'A sedan can suit a small delegation; an SUV may be more practical with exhibition materials. Confirm the driver, invoicing name and passenger count for every vehicle.',
    locationSlug: 'dubai',
  },
  'airport-transfers': {
    group: 'Stays & days out',
    description:
      'Request a rental car for a Dubai airport arrival. Plan DXB or DWC handover, flight timing, luggage and any separately confirmed transfer service.',
    image: {
      src: '/emirates/dubai.webp',
      caption: 'Dubai skyline',
      alt: 'Dubai skyline',
      generated: false,
    },
    dubaiHeading: 'Match the handover to the actual airport',
    dubaiGuide:
      'Dubai International (DXB) and Al Maktoum International (DWC) require different arrangements. Provide the airport, terminal, flight and a working contact number. Ask where a rental handover is permitted after baggage collection; do not assume a car can wait at the terminal door. If you need to be driven, ask for a separately confirmed service.',
    carAdvice:
      'Explore luggage capacity with all passengers seated. Large suitcases can make a sedan or SUV more suitable than a sports car, even for two travellers.',
    locationSlug: 'dubai',
  },
  'music-videos': {
    group: 'Work & productions',
    description:
      'Request a car for a Dubai music-video production with a clear shoot brief, location permissions and approved vehicle use. Explore actual vehicle photos.',
    image: {
      src: '/occasions/dubai-production.webp',
      caption: 'A Dubai-inspired production setup',
      alt: 'AI illustration of a camera and parked sports car against a Dubai-inspired skyline',
      generated: true,
    },
    dubaiHeading: 'Separate the road rental from the shoot plan',
    dubaiGuide:
      "For a shoot near Downtown Dubai, a Marina property or a private studio, give the production's exact location and access contact. A recognisable skyline does not make a roadside stopping point a filming location. Have the production team confirm the necessary location and filming permissions before the car is scheduled on set.",
    carAdvice:
      'Select the actual colour and model from the gallery. Discuss stationary shots, driving scenes and any rigging separately; a standard road rental is not stunt permission.',
    locationSlug: 'downtown-dubai',
  },
  photoshoots: {
    group: 'Work & productions',
    description:
      'Choose a rental car for a Dubai photoshoot using real vehicle colour previews. Plan approved locations, equipment and the time needed on set.',
    image: {
      src: '/occasions/dubai-production.webp',
      caption: 'A Dubai-inspired vehicle photoshoot',
      alt: 'AI illustration of a camera and parked sports car against a Dubai-inspired skyline',
      generated: true,
    },
    dubaiHeading: 'Choose the background and access together',
    dubaiGuide:
      'Creek Harbour and the Downtown area offer different city backdrops, but a location still needs a permitted place for the car. Confirm access with the property or location operator and plan your light around the agreed shoot window. If you move between locations, include travel and setup time in the vehicle request.',
    carAdvice:
      'Refer to the specific photographed car rather than a generic model colour. Send the proposed props and equipment so their use can be reviewed before booking.',
    locationSlug: 'dubai-creek-harbour',
  },
  'test-drives': {
    group: 'Work & productions',
    description:
      'Try a model through a paid Dubai trial rental. Explore the driving position, controls and luggage space under ordinary road-rental terms.',
    image: {
      src: '/destinations/emirates-hills.webp',
      caption: 'Emirates Hills and the Dubai skyline',
      alt: 'Emirates Hills and the Dubai skyline',
      generated: false,
    },
    dubaiHeading: 'Use ordinary journeys to assess the fit',
    dubaiGuide:
      'A normal day moving between your hotel, a meeting and a Dubai residential district can tell you more about comfort and parking than a brief look at the exterior. Choose familiar, permitted roads and leave time to learn the controls before setting off. This is a paid road rental, not a dealership demonstration or performance test.',
    carAdvice:
      'Assess seat adjustment, visibility, boot access and how your bags fit. Ask to confirm the specific version of the model if a feature matters to your decision.',
    locationSlug: 'emirates-hills',
  },
  staycations: {
    group: 'Stays & days out',
    description:
      'Plan a Dubai staycation rental around hotel check-in, luggage and outings. Explore suitable vehicles and confirm parking and the return arrangement.',
    image: {
      src: '/occasions/dubai-romantic-getaway.webp',
      caption: 'A Dubai-inspired seaside escape',
      alt: 'AI illustration of a breakfast terrace overlooking a Dubai-inspired coastline',
      generated: true,
    },
    dubaiHeading: 'Start the break with a straightforward handover',
    dubaiGuide:
      'For a Palm Jumeirah or Jumeirah staycation, identify the guest entrance and confirm overnight parking with the hotel. Collect the car early enough to complete the handover before check-in, or arrange a later meeting if you do not need it for the first afternoon. Include any next-day outing before agreeing the return time.',
    carAdvice:
      "Two overnight bags may suit a coupe; family luggage and a pushchair usually require more space. Check the exact vehicle's capacity rather than assuming all SUVs are the same.",
    locationSlug: 'palm-jumeirah',
  },
  'weekend-road-trips': {
    group: 'Stays & days out',
    description:
      'Plan a weekend road-trip rental from Dubai with suitable luggage space, mileage and permitted travel areas. Explore cars and request your route and dates.',
    image: {
      src: '/destinations/palm-coast.webp',
      caption: 'Palm Jumeirah, Dubai',
      alt: 'Palm Jumeirah, Dubai',
      generated: false,
    },
    dubaiHeading: 'Plan the distance as well as the destination',
    dubaiGuide:
      'Start with the Dubai collection point and list each overnight stop before choosing a mileage allowance. If your route leaves the emirate, ask the team to confirm permitted travel and recovery arrangements. For mountain or desert accommodation, verify that the approach is paved and suitable for the car; a destination pin may not show the final access road.',
    carAdvice:
      'Prioritise comfortable seating, bag space and the agreed mileage. An SUV can carry more equipment, but its appearance does not establish permission for off-road driving.',
    locationSlug: 'dubai',
  },
  'hotel-guests': {
    group: 'Stays & days out',
    description:
      'Arrange a rental car for your Dubai hotel stay with a confirmed guest entrance, luggage space and delivery request. Explore models for your itinerary.',
    image: {
      src: '/destinations/palm-coast.webp',
      caption: 'Palm Jumeirah, Dubai',
      alt: 'Palm Jumeirah, Dubai',
      generated: false,
    },
    dubaiHeading: 'Use the property name, not just the neighbourhood',
    dubaiGuide:
      'Palm Jumeirah, Dubai Marina and Downtown each contain many hotels with different vehicle entrances. Include the full property name and arrival date, and ask the concierge for the guest handover point. If you move hotels, agree the revised return location with the rental team instead of assuming every property is covered by one arrangement.',
    carAdvice:
      'Choose for the whole stay: airport bags, passengers and any shopping or day-trip luggage. A larger boot may be more useful than another seat you will not need.',
    locationSlug: 'palm-jumeirah',
  },
  'real-estate-viewings': {
    group: 'Work & productions',
    description:
      'Plan a Dubai property-viewing rental for clients or family. Choose suitable seats, organise community access and allow time between appointments.',
    image: {
      src: '/destinations/emirates-hills.webp',
      caption: 'Emirates Hills and the Dubai skyline',
      alt: 'Emirates Hills and the Dubai skyline',
      generated: false,
    },
    dubaiHeading: 'Group the viewings by district',
    dubaiGuide:
      'A viewing day across Emirates Hills, Palm Jumeirah and Downtown can involve several access procedures as well as road travel. Ask the agent to group nearby appointments, share visitor instructions and identify the final parking point at each property. Include the people coming along and leave time for a viewing to run over.',
    carAdvice:
      'A sedan is useful for a small party; an SUV may help when family members or several clients join. Any agent or colleague who drives must be approved for the rental.',
    locationSlug: 'emirates-hills',
  },
}

export const eventGuides: Record<
  string,
  { title: string; intro: string; sections: [string, string][]; questions: [string, string][] }
> = {
  'abu-dhabi-grand-prix': {
    title: 'Luxury car rental for the Abu Dhabi F1 Grand Prix',
    intro:
      'Plan your Abu Dhabi Grand Prix weekend with a luxury car for the drive to Yas Island, your hotel and the rest of your UAE stay. Explore self-drive models and request collection before the first session or concert you plan to attend.',
    sections: [
      [
        'Driving from Dubai to Yas Island',
        'Tell us whether you are collecting in Dubai or Abu Dhabi, your hotel address and the full rental period. Include the return journey and other weekend outings when checking the mileage allowance. Event traffic and venue access can affect your schedule, so leave time for vehicle inspection before travelling.',
      ],
      [
        'Choose around your group',
        'A luxury sedan can suit two guests and weekend bags; an SUV may offer more room for a group. Explore the actual seat count and boot space of each model. A sports car is an option for a smaller party travelling light, subject to age and insurance eligibility.',
      ],
      [
        'Circuit parking and after-race concerts',
        'Check your ticket holder instructions for permitted parking, road closures and the entrance for your grandstand or hospitality area. Concert admission and transport between event areas are organised separately. An ordinary rental does not include circuit driving, race tickets, parking passes or a chauffeur.',
      ],
    ],
    questions: [
      [
        'Can I rent in Dubai and drive to the Abu Dhabi Grand Prix?',
        'Request your Dubai collection address and planned Yas Island itinerary. Confirm inter-emirate use, mileage, delivery and return arrangements with the rental provider before agreeing to the rental.',
      ],
      [
        'Does a rental include F1 tickets or circuit access?',
        'No. This is a vehicle rental enquiry. Race and concert tickets, hospitality, parking permits and all venue access must be arranged with the organiser.',
      ],
      [
        'Can I keep the car for the entire race weekend?',
        'Share your intended collection and return dates. The team will check availability and quote for the full period, including any additional days around your stay.',
      ],
    ],
  },
  'dubai-concerts': {
    title: 'Luxury car rental for concerts in Dubai',
    intro:
      'Make a Dubai concert part of a complete evening, with a car for dinner, your hotel and the journey to the venue. Share the artist, confirmed show date and venue when requesting availability.',
    sections: [
      [
        'Plan around the actual venue',
        'A Coca-Cola Arena show and a performance at another Dubai venue need different arrival arrangements. Give the precise venue, your hotel or home address and any dinner stop. Follow the organiser’s parking instructions instead of assuming a space at the entrance.',
      ],
      [
        'An evening for two or a group',
        'Explore a coupe or convertible for two travelling light with a sedan or SUV for friends and family. Check the listed seats and luggage space. If several guests need transport, ask about separate vehicles rather than exceeding a car’s permitted occupancy.',
      ],
      [
        'Collection and the journey home',
        'Arrange enough time to inspect the car before leaving for the show. Agree the return window in advance, particularly for late performances. The driver must remain fit to drive and comply with UAE law; chauffeur service is a separate enquiry.',
      ],
    ],
    questions: [
      [
        'Can a car be delivered to my Dubai hotel before a concert?',
        'Provide the hotel and guest vehicle entrance, your collection time and the show venue. Delivery availability and charges are confirmed with the quote.',
      ],
      [
        'Can I return the car after the show?',
        'Request the expected return time before booking. Collection hours, minimum rental period and any late-return charge must be agreed in advance.',
      ],
      [
        'Are concert tickets included?',
        'No. Tickets, parking and venue services are separate. Confirm the artist and performance date directly with the organiser before reserving your car.',
      ],
    ],
  },
  'abu-dhabi-concerts': {
    title: 'Luxury car rental for Abu Dhabi concerts',
    intro:
      'Choose a car for a concert at Etihad Arena or another Abu Dhabi venue, with collection and return planned around your show and accommodation. Explore models for a local evening or a longer visit from Dubai.',
    sections: [
      [
        'An Etihad Arena evening',
        'For a Yas Island show, give the venue, confirmed performance date and the hotel or address where you want the car. Check the organiser’s arrival and parking guidance. Venue entrances and nearby roads can operate differently on event nights.',
      ],
      [
        'Driving from another emirate',
        'Tell the team if you are starting in Dubai, Sharjah or elsewhere in the UAE. Include the whole return journey when discussing the mileage allowance, and agree whether collection and return will happen at the same address.',
      ],
      [
        'Room for the whole stay',
        'An overnight visit may need more luggage space than a single evening out. Explore sedan comfort, SUV space and the passenger limit before choosing. If the driver needs to rest after a late show, plan accommodation and the return date accordingly.',
      ],
    ],
    questions: [
      [
        'Can I arrange collection on Yas Island?',
        'Request the hotel or property entrance and your preferred time. Venue forecourts are not automatically available for rental handovers; the team must agree a suitable location.',
      ],
      [
        'Can I drive from Dubai to an Abu Dhabi concert?',
        'Discuss your itinerary with the provider, including inter-emirate use, mileage and your proposed return. Your quote depends on the vehicle, dates and handover locations.',
      ],
      [
        'Does the car rental include a driver?',
        'The listed enquiry is for a vehicle rental. Ask separately about a chauffeur; availability, pricing and terms must be confirmed.',
      ],
    ],
  },
  'dubai-world-cup': {
    title: 'Luxury car rental for the Dubai World Cup',
    intro:
      'Plan a Dubai World Cup arrival at Meydan with a luxury car chosen for your guests, outfits and the rest of your day. Arrange delivery before you leave your hotel and confirm the return around your evening plans.',
    sections: [
      [
        'Planning your Meydan arrival',
        'Use the organiser’s current information for your ticket category, parking and permitted entrances. Give the rental team your hotel or residential collection address and the event you are attending. Event tickets and hospitality are separate bookings.',
      ],
      [
        'A car for race-day dressing',
        'A sedan or SUV can provide practical entry and room for formalwear and personal bags. Check the seating and boot dimensions for your group. Consider ease of entry as well as styling when reviewing lower sports cars with taller vehicles.',
      ],
      [
        'From race day to the evening',
        'Include dinner or other plans in the requested rental period. Confirm a return time you can meet and arrange permitted parking at each stop. Ask about an additional day if a late finish would make the original return impractical.',
      ],
    ],
    questions: [
      [
        'Can you deliver the car before we leave for Meydan?',
        'Request your exact hotel or residential address and a collection time that allows for inspection. Delivery charges and timing are confirmed before the booking.',
      ],
      [
        'Is Meydan parking included?',
        'No. Parking permissions and race admission are handled separately by the organiser. Check the instructions attached to your ticket or hospitality package.',
      ],
      [
        'Which car should I choose for Dubai World Cup?',
        'Explore passenger count, luggage space and ease of entry for your guests. A luxury sedan or SUV may suit formalwear and a group, while a coupe can suit two guests travelling light.',
      ],
    ],
  },
}
export const eventHref = (slug: string) => '/events/' + slug + '-luxury-car-rental'

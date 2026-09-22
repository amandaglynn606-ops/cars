export type EventProgramme = {
  heading: string
  introduction: string
  photoCaption: string
  items: { date: string; title: string; detail: string; image?: string }[]
  entertainment: string
  source: string
}

export const eventProgrammes: Record<string, EventProgramme> = {
  'dubai-world-cup': {
    heading: 'A day at Meydan',
    introduction:
      'The Dubai World Cup is an international horse-racing meeting at Meydan Racecourse in Nad Al Sheba. Its 30th anniversary edition took place on 28 March 2026. The organiser describes a nine-race meeting with US$30.5 million in prize money. The next edition’s date and programme have not been verified yet.',
    photoCaption: 'Dubai World Cup at Meydan · official race-replay artwork from 28 March 2026',
    items: [
      {
        date: '2026 race highlights',
        title: 'Dubai World Cup',
        detail:
          'Magnitude won the US$12 million feature race, ahead of Forever Young. The race is the centrepiece of the meeting; this result refers to the completed 2026 edition.',
      },
      {
        date: 'Turf racing',
        title: 'Sheema Classic & Dubai Turf',
        detail:
          'Calandagan won the 2026 Longines Dubai Sheema Classic, while Ombudsman won the Dubai Turf for Godolphin. Both feature in Dubai Racing Club’s official account of the meeting.',
      },
      {
        date: 'Sprint highlights',
        title: 'Golden Shaheen & Al Quoz Sprint',
        detail:
          'Dark Saffron retained the Dubai Golden Shaheen title in 2026. Native Approach won the Al Quoz Sprint, completing a sprint double for trainer Ahmad bin Harmash.',
      },
      {
        date: 'Your race-day plans',
        title: 'Grandstand, dining & hospitality',
        detail:
          'Choose admission or hospitality directly with Dubai Racing Club. Check the dress guidance, opening times and entrance attached to your package before arranging your car. Rental delivery is best agreed at your hotel or residence before travelling to Meydan.',
      },
    ],
    entertainment:
      'A singer or concert lineup for the next Dubai World Cup has not been verified. This page will not present a past performer as a future booking. Racing, dining and hospitality are the confirmed focus of the organiser’s current information.',
    source: 'https://www.dubairacingclub.com/',
  },
  'abu-dhabi-grand-prix': {
    heading: 'Three days on Yas Island',
    introduction:
      'Formula 1 lists the 2026 Abu Dhabi Grand Prix at Yas Marina Circuit for 4–6 December. Plan your rental around the sessions on your ticket, your hotel and any separately arranged evening events.',
    photoCaption: 'Yas Marina Circuit · official Formula 1 Abu Dhabi Grand Prix imagery',
    items: [
      {
        date: 'Friday · 4 December 2026',
        title: 'Practice day',
        detail:
          'The published Formula 1 weekend schedule includes the first and second practice sessions. Collect your car with enough time for the inspection and the journey to your designated circuit entrance.',
      },
      {
        date: 'Saturday · 5 December 2026',
        title: 'Practice & qualifying',
        detail:
          'Third practice and qualifying are listed for Saturday. Check the organiser’s current session times and your grandstand parking instructions before leaving your accommodation.',
      },
      {
        date: 'Sunday · 6 December 2026',
        title: 'Grand Prix race day',
        detail:
          'Sunday is the Grand Prix. Allow for event traffic on Yas Island and agree the rental return after your final plans, rather than immediately after the race.',
      },
      {
        date: 'Wednesday · 2 December 2026',
        title: 'Andrea Bocelli on Yas Island',
        detail:
          'Etihad Arena lists Yasalam Classics presents Andrea Bocelli Live in Concert on 2 December. This is a separate concert before the race weekend; confirm its own ticket and admission terms.',
        image: '/verified-places/andrea-bocelli.webp',
      },
    ],
    entertainment:
      'Yas Marina promotes after-race concerts, but the full 2026 artist lineup has not been verified for this guide. Andrea Bocelli’s 2 December Etihad Arena concert is separately listed by the venue and should not be confused with an Etihad Park after-race concert.',
    source: 'https://www.formula1.com/en/racing/2026/united-arab-emirates',
  },
  'abu-dhabi-concerts': {
    heading: 'Artists coming to Yas Island',
    introduction:
      'Etihad Arena’s published calendar includes international film music, pop and classical performances in late 2026. These are separate shows with individual tickets and admission rules.',
    photoCaption: 'Hans Zimmer Live · official Etihad Arena promotional artwork',
    items: [
      {
        date: 'Saturday · 17 October 2026',
        title: 'Tamer Hosny & Tamer Ashour',
        detail:
          'Etihad Arena lists both artists for this October concert. Confirm doors, seating and admission details on the venue’s event page before choosing your vehicle collection time.',
      },
      {
        date: 'Friday · 13 November 2026',
        title: 'Hans Zimmer Live',
        detail:
          'The composer performs with orchestra, band and immersive visuals. The venue lists doors at 6:30 pm, tickets for guests aged six and above, and no admission for children aged five or under. Doors opening is not the performance start time.',
        image: '/verified-places/hans-zimmer.webp',
      },
      {
        date: 'Friday · 27 November 2026',
        title: 'Tarkan',
        detail:
          'Tarkan appears on Etihad Arena’s November calendar. Arrange your rental for the full evening and check the latest show and parking information directly with the venue.',
      },
      {
        date: 'Wednesday · 2 December 2026',
        title: 'Andrea Bocelli',
        detail:
          'Yasalam Classics presents Andrea Bocelli Live in Concert at Etihad Arena. This show falls before the Abu Dhabi Grand Prix weekend and has its own concert admission.',
        image: '/verified-places/andrea-bocelli.webp',
      },
    ],
    entertainment:
      'Each artist above is listed by Etihad Arena. Lineups, timings and ticket availability can change. Your car rental does not include concert admission, VIP packages or venue parking.',
    source: 'https://www.etihadarena.ae/en/events',
  },
  'dubai-concerts': {
    heading: 'An evening at Coca-Cola Arena',
    introduction:
      'Coca-Cola Arena is an indoor entertainment venue at City Walk in Dubai. The car you choose should fit the actual show venue, your group and any dinner or hotel stops around the performance.',
    photoCaption:
      'Maroon 5 at Coca-Cola Arena · archive concert photograph, not an upcoming lineup announcement',
    items: [
      {
        date: 'City Walk · Dubai',
        title: 'The venue',
        detail:
          'Use the entrance and parking instructions issued for your performance. City Walk restaurants can make a nearby dinner stop, but allow time to park and walk to the correct arena gate.',
      },
      {
        date: 'Confirm before reserving',
        title: 'Artist, show date & doors',
        detail:
          'Check the current Coca-Cola Arena calendar for the artist and exact show date. Doors opening, performance start time and age restrictions are separate details; share your confirmed plans with the rental team.',
      },
      {
        date: 'After the encore',
        title: 'Your return journey',
        detail:
          'Arrange a return time that allows for the end of the show and crowds leaving the venue. An overnight rental may suit a late finish; confirm its rate and the next-day collection arrangements before booking.',
      },
    ],
    entertainment:
      'The photo shows a previous Maroon 5 performance. It does not announce a new Maroon 5 concert. A current Dubai artist lineup has not been verified for this page; use the official arena calendar for the show you intend to attend.',
    source: 'https://www.coca-cola-arena.com/',
  },
}

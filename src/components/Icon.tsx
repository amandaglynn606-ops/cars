export default function Icon({
  name,
  size = 20,
}: {
  name:
    | 'arrow'
    | 'search'
    | 'filter'
    | 'close'
    | 'heart'
    | 'menu'
    | 'check'
    | 'chevron'
    | 'pin'
    | 'calendar'
    | 'grid'
    | 'plus'
  size?: number
}) {
  const paths = {
    plus: 'M12 4v16M4 12h16',
    arrow: 'M4 12h15m-6-6 6 6-6 6',
    search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    filter: 'M4 6h16M7 12h10m-7 6h4',
    close: 'm6 6 12 12M6 18 18 6',
    heart:
      'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    menu: 'M3 7h18M3 17h18',
    check: 'm5 12 4 4L19 6',
    chevron: 'm8 4 8 8-8 8',
    pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    calendar: 'M4 5h16v16H4ZM4 10h16M8 2v6m8-6v6',
    grid: 'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}

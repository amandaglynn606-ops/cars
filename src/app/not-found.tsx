import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-lux flex min-h-screen flex-col items-center justify-center py-32 text-center">
      <p className="eyebrow mb-5">Error 404</p>
      <h1 className="font-display text-[clamp(3rem,10vw,7rem)] leading-[0.95]">Wrong turn</h1>
      <p className="mt-5 max-w-md text-muted">
        The page you were looking for is not in the garage. Let us point you back to the fleet.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/fleet"
          className="rounded-full bg-gold-500 px-9 py-4 text-xs tracking-[0.18em] uppercase text-ink-950"
        >
          Browse the fleet
        </Link>
        <Link
          href="/"
          className="rounded-full border border-bone/25 px-9 py-4 text-xs tracking-[0.18em] uppercase transition-colors hover:border-gold-500 hover:text-gold-500"
        >
          Home
        </Link>
      </div>
    </div>
  )
}

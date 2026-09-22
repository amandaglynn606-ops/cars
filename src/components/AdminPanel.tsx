'use client'
import { withMonthlyOffer } from '@/lib/monthly-pricing'
import { useState, type FormEvent } from 'react'
import type { Car, Reservation } from '@/lib/types'
import { categorySlug, carHref } from '@/lib/catalogue'
import { formatPrice } from '@/lib/format'
import Link from 'next/link'
import Icon from './Icon'
type Tab = 'vehicles' | 'reservations'
export function AdminLogin() {
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false)
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const f = new FormData(e.currentTarget)
    try {
      const r = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: f.get('password') }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed.')
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="z-admin-login">
      <p className="z-kicker">Zavi · Private access</p>
      <h1>Fleet management.</h1>
      <label className="z-field">
        Administrator password
        <input
          required
          type="password"
          name="password"
          autoComplete="current-password"
          maxLength={256}
        />
      </label>
      {error && (
        <p className="z-error" role="alert">
          {error}
        </p>
      )}
      <button className="z-button" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
        <Icon name="arrow" />
      </button>
    </form>
  )
}
function emptyCar(): Car {
  const id = 'vehicle-' + crypto.randomUUID()
  return {
    id,
    name: '',
    slug: id,
    brand: '',
    model: '',
    brandSlug: '',
    modelSlug: '',
    bodyType: 'Luxury',
    categories: ['Luxury'],
    year: null,
    seats: null,
    transmission: null,
    drivetrain: null,
    exteriorColour: null,
    interiorColour: null,
    pricing: {
      currency: 'AED',
      daily: null,
      dailyWas: null,
      threeDays: null,
      weekly: null,
      fortnightly: null,
      monthly: null,
      monthlyWas: null,
    },
    colors: [],
    specs: {},
    images: [],
    featuredImage: '',
    featured: false,
    availability: 'unavailable',
    publicationStatus: 'draft',
    imagePermission: '',
    features: [],
    keywords: [],
    locations: [],
    mileage: null,
    deposit: null,
    updatedAt: new Date().toISOString(),
    revision: 0,
  }
}
export default function AdminPanel({
  initialCars,
  initialReservations,
}: {
  initialCars: Car[]
  initialReservations: Reservation[]
}) {
  const [cars, setCars] = useState(initialCars),
    [reservations, setReservations] = useState(initialReservations)
  const [selected, setSelected] = useState<Car | null>(null),
    [tab, setTab] = useState<Tab>('vehicles'),
    [search, setSearch] = useState('')
  const [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false)
  const set = <K extends keyof Car>(k: K, v: Car[K]) =>
    setSelected((c) => (c ? { ...c, [k]: v } : null))
  const num = (s: string) => (s === '' ? null : Number(s))
  const array = (s: string) => [
    ...new Set(
      s
        .split(/[,\n]/)
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ]
  async function request(url: string, method: string, body?: unknown) {
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Request failed.')
    return d
  }
  async function refresh() {
    const [v, r] = await Promise.all([
      request('/api/admin/vehicles', 'GET'),
      request('/api/admin/reservations', 'GET'),
    ])
    setCars(v)
    setReservations(r)
  }
  async function save(e: FormEvent) {
    e.preventDefault()
    if (!selected) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const c = {
        ...selected,
        brandSlug: categorySlug(selected.brand || ''),
        modelSlug: selected.modelSlug || categorySlug(selected.model),
      }
      const result = await request('/api/admin/vehicles', 'PUT', c)
      setSelected(result)
      await refresh()
      setMessage('Vehicle saved. The live catalogue now uses these details.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setBusy(false)
    }
  }
  async function remove() {
    if (
      !selected ||
      !window.confirm('Delete ' + selected.name + '? This removes the vehicle from the catalogue.')
    )
      return
    setBusy(true)
    setError('')
    try {
      await request('/api/admin/vehicles', 'DELETE', { id: selected.id })
      setSelected(null)
      await refresh()
      setMessage('Vehicle deleted.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.')
    } finally {
      setBusy(false)
    }
  }
  async function upload(file?: File) {
    if (!file || !selected) return
    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      set('images', [
        ...selected.images,
        {
          src: d.src,
          thumbnail: d.src,
          alt: selected.name || [selected.brand, selected.model].join(' '),
        },
      ])
      if (!selected.featuredImage) setSelected((c) => (c ? { ...c, featuredImage: d.src } : null))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }
  async function changeReservation(id: string, status: string) {
    setError('')
    setMessage('')
    setBusy(true)
    try {
      await request('/api/admin/reservations', 'PATCH', { id, status })
      await refresh()
      setMessage('Reservation ' + status + '. Availability has been updated.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed.')
    } finally {
      setBusy(false)
    }
  }
  const c = selected
  return (
    <div className="container-lux z-admin-wrap">
      <header className="z-section-heading">
        <div>
          <p className="z-kicker">Zavi · Fleet management</p>
          <h1 className="font-display display-md">The collection, in your hands.</h1>
        </div>
        <button
          className="z-button z-button-outline"
          onClick={async () => {
            await request('/api/admin/session', 'DELETE')
            window.location.reload()
          }}
        >
          Sign out
        </button>
      </header>
      <div className="z-admin-tabs" role="tablist" aria-label="Management area">
        <button role="tab" aria-selected={tab === 'vehicles'} onClick={() => setTab('vehicles')}>
          Vehicles · {cars.length}
        </button>
        <button
          role="tab"
          aria-selected={tab === 'reservations'}
          onClick={() => setTab('reservations')}
        >
          Reservations · {reservations.filter((r) => r.status === 'pending').length} pending
        </button>
      </div>
      <Link
        href="/admin/partners"
        className="z-text-link"
        style={{ display: 'inline-flex', marginBottom: 24 }}
      >
        Partnership enquiries <Icon name="arrow" size={16} />
      </Link>
      {error && (
        <p className="z-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="z-success" role="status">
          {message}
        </p>
      )}
      {tab === 'vehicles' ? (
        <>
          <div className="z-admin-actions">
            <button
              className="z-button"
              onClick={() => {
                setSelected(emptyCar())
                setError('')
                setMessage('')
              }}
            >
              Add vehicle +
            </button>
            <button
              className="z-button z-button-outline"
              onClick={() => {
                const blob = new Blob([JSON.stringify(cars, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'zavi-fleet.json'
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              Export fleet JSON
            </button>
            <a className="z-button z-button-outline" href="/api/admin/audit" download>
              Download activity log
            </a>
            <Link className="z-text-link" href="/fleet">
              View live catalogue
              <Icon name="arrow" size={16} />
            </Link>
          </div>
          <p className="z-note">
            {cars.filter((c) => c.publicationStatus === 'published').length} published ·{' '}
            {cars.filter((c) => c.publicationStatus === 'draft').length} drafts. Draft vehicles stay
            out of all public listings. A daily rate and approved image are required to publish.
          </p>
          <div className="z-admin-layout">
            <aside>
              <label className="z-field">
                Find a vehicle
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Brand or model…"
                />
              </label>
              <div className="z-admin-list">
                {cars
                  .filter((v) => v.name.toLowerCase().includes(search.toLowerCase()))
                  .map((v) => (
                    <button
                      key={v.id}
                      aria-pressed={selected?.id === v.id}
                      onClick={() => {
                        if (
                          selected &&
                          JSON.stringify(selected) !==
                            JSON.stringify(cars.find((x) => x.id === selected.id)) &&
                          !window.confirm('Discard unsaved changes and open another vehicle?')
                        )
                          return
                        setSelected(structuredClone(v))
                        setError('')
                        setMessage('')
                      }}
                    >
                      {v.name}
                      <small>
                        {v.publicationStatus} ·{' '}
                        {v.pricing.daily
                          ? formatPrice(v.pricing.daily) + '/day'
                          : 'Daily rate missing'}
                      </small>
                    </button>
                  ))}
              </div>
            </aside>
            {c ? (
              <form className="z-admin-editor" key={c.id + ':' + c.revision} onSubmit={save}>
                <fieldset>
                  <legend>Vehicle</legend>
                  <div className="z-two-fields">
                    <label className="z-field">
                      Brand
                      <input
                        required
                        value={c.brand || ''}
                        onChange={(e) => set('brand', e.target.value)}
                      />
                    </label>
                    <label className="z-field">
                      Model
                      <input
                        required
                        value={c.model}
                        onChange={(e) => set('model', e.target.value)}
                      />
                    </label>
                    <label className="z-field">
                      Model year
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 2}
                        value={c.year ?? ''}
                        placeholder="Unknown"
                        onChange={(e) => set('year', num(e.target.value))}
                      />
                    </label>
                    <label className="z-field">
                      Model URL
                      <input
                        value={c.modelSlug}
                        placeholder="Generated from model"
                        pattern="[a-z0-9]+(-[a-z0-9]+)*"
                        onChange={(e) => set('modelSlug', e.target.value)}
                      />
                    </label>
                  </div>
                  <label className="z-field">
                    Categories · comma separated
                    <input
                      defaultValue={c.categories.join(', ')}
                      onChange={(e) => set('categories', array(e.target.value))}
                    />
                  </label>
                  <label className="z-field">
                    Primary category
                    <select
                      value={c.bodyType || ''}
                      onChange={(e) => set('bodyType', e.target.value)}
                    >
                      {c.categories.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                  <label className="z-field">
                    Search keywords · comma separated
                    <input
                      defaultValue={c.keywords.join(', ')}
                      onChange={(e) => set('keywords', array(e.target.value))}
                    />
                  </label>
                </fieldset>
                <fieldset>
                  <legend>Pricing · AED</legend>
                  <div className="z-two-fields">
                    {(
                      [
                        ['daily', 'Daily rate'],
                        ['dailyWas', 'Original daily price'],
                        ['threeDays', '3-day rate'],
                        ['weekly', '7-day rate'],
                        ['fortnightly', '14-day rate'],
                        ['monthly', '30-day rate'],
                        ['monthlyWas', 'Original 30-day price'],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="z-field">
                        {label}
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={withMonthlyOffer(c).pricing[key] ?? ''}
                          readOnly={
                            (key === 'monthly' || key === 'monthlyWas') && !!c.pricing.daily
                          }
                          placeholder="On request"
                          onChange={(e) =>
                            set('pricing', { ...c.pricing, [key]: num(e.target.value) })
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <p className="z-note">
                    Leave unavailable rates blank. Original prices must be higher than the current
                    price.
                  </p>
                  <p className="z-note">
                    When a daily rate is set, the public 30-day offer is calculated automatically at
                    20% less than 30 daily rentals. The original 30-day amount is that daily-rate
                    comparison. Monthly fields are read-only while this offer applies.
                  </p>
                </fieldset>
                <fieldset>
                  <legend>Operations</legend>
                  <div className="z-two-fields">
                    <label className="z-field">
                      Publication
                      <select
                        value={c.publicationStatus}
                        onChange={(e) =>
                          set('publicationStatus', e.target.value as Car['publicationStatus'])
                        }
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </label>
                    <label className="z-field">
                      Availability
                      <select
                        value={c.availability}
                        onChange={(e) => set('availability', e.target.value as Car['availability'])}
                      >
                        {['available', 'reserved', 'unavailable', 'maintenance'].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="z-admin-check">
                    <input
                      type="checkbox"
                      checked={c.featured}
                      onChange={(e) => set('featured', e.target.checked)}
                    />{' '}
                    Feature on the homepage
                  </label>
                  <label className="z-field">
                    Delivery locations · comma separated
                    <input
                      defaultValue={c.locations.join(', ')}
                      onChange={(e) => set('locations', array(e.target.value))}
                    />
                  </label>
                  <div className="z-two-fields">
                    <label className="z-field">
                      Mileage allowance
                      <input
                        value={c.mileage || ''}
                        onChange={(e) => set('mileage', e.target.value || null)}
                      />
                    </label>
                    <label className="z-field">
                      Deposit terms
                      <input
                        value={c.deposit || ''}
                        onChange={(e) => set('deposit', e.target.value || null)}
                      />
                    </label>
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Specifications</legend>
                  <p className="z-note" style={{ marginBottom: 20 }}>
                    Only enter facts verified for this vehicle. Blank specifications are hidden.
                  </p>
                  <div className="z-two-fields">
                    <label className="z-field">
                      Seats
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={c.seats ?? ''}
                        onChange={(e) => set('seats', num(e.target.value))}
                      />
                    </label>
                    {(
                      ['transmission', 'drivetrain', 'exteriorColour', 'interiorColour'] as const
                    ).map((k) => (
                      <label className="z-field" key={k}>
                        {k.replace(/([A-Z])/g, ' $1')}
                        <input
                          value={c[k] || ''}
                          onChange={(e) => set(k, e.target.value || null)}
                        />
                      </label>
                    ))}
                    <label className="z-field">
                      Engine
                      <input
                        value={c.specs.engine || ''}
                        onChange={(e) => {
                          const specs = { ...c.specs }
                          if (e.target.value) specs.engine = e.target.value
                          else delete specs.engine
                          set('specs', specs)
                        }}
                      />
                    </label>
                    {(
                      [
                        ['horsepower', 'Power (hp)'],
                        ['zeroToHundredKph', '0–100 km/h (seconds)'],
                        ['topSpeedKph', 'Top speed (km/h)'],
                        ['torqueLbFt', 'Torque (lb-ft)'],
                      ] as const
                    ).map(([k, label]) => (
                      <label key={k} className="z-field">
                        {label}
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          value={c.specs[k] ?? ''}
                          onChange={(e) => {
                            const specs = { ...c.specs }
                            if (e.target.value) specs[k] = Number(e.target.value)
                            else delete specs[k]
                            set('specs', specs)
                          }}
                        />
                      </label>
                    ))}
                  </div>
                  <label className="z-field">
                    Features · comma separated
                    <textarea
                      defaultValue={c.features.join(', ')}
                      onChange={(e) => set('features', array(e.target.value))}
                    />
                  </label>
                </fieldset>
                <fieldset>
                  <legend>Photography</legend>
                  <label className="z-field">
                    Photographed colours · comma separated
                    <input
                      defaultValue={c.colors.map((colour) => colour.name).join(', ')}
                      onChange={(e) => {
                        const colors = array(e.target.value).map(
                          (name) =>
                            c.colors.find((v) => v.name === name) || {
                              name,
                              slug: categorySlug(name),
                              default: false,
                            },
                        )
                        setSelected((previous) =>
                          previous
                            ? {
                                ...previous,
                                colors,
                                images: previous.images.map((image) => {
                                  if (
                                    !image.colorSlug ||
                                    colors.some((colour) => colour.slug === image.colorSlug)
                                  )
                                    return image
                                  const { colorSlug: _, ...rest } = image
                                  return rest
                                }),
                              }
                            : null,
                        )
                      }}
                    />
                    <span className="z-note">
                      Assign each photo below. Colours without matching photos are removed when
                      saved.
                    </span>
                  </label>
                  <label className="z-field">
                    Image permission / licence reference
                    <textarea
                      required={c.publicationStatus === 'published'}
                      value={c.imagePermission}
                      onChange={(e) => set('imagePermission', e.target.value)}
                    />
                  </label>
                  <label className="z-field">
                    Upload a photograph · JPEG, PNG, WebP or AVIF · up to 8 MB
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={busy}
                      onChange={(e) => {
                        upload(e.target.files?.[0])
                        e.target.value = ''
                      }}
                    />
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))',
                      gap: 16,
                    }}
                  >
                    {c.images.map((img, i) => (
                      <div key={img.src}>
                        <img
                          src={img.thumbnail}
                          alt={img.alt}
                          style={{ width: '100%', aspectRatio: '1.4', objectFit: 'cover' }}
                        />
                        <label className="z-admin-check" style={{ margin: '10px 0' }}>
                          <input
                            type="radio"
                            name="featuredImage"
                            checked={c.featuredImage === img.src}
                            onChange={() => set('featuredImage', img.src)}
                          />{' '}
                          Cover {i + 1}
                        </label>
                        <label className="z-field">
                          Photo {i + 1} colour
                          <select
                            value={img.colorSlug || ''}
                            onChange={(e) =>
                              set(
                                'images',
                                c.images.map((image) => {
                                  if (image.src !== img.src) return image
                                  const { colorSlug: _, ...rest } = image
                                  return e.target.value
                                    ? { ...rest, colorSlug: e.target.value }
                                    : rest
                                }),
                              )
                            }
                          >
                            <option value="">Unassigned / full gallery</option>
                            {c.colors.map((colour) => (
                              <option key={colour.slug} value={colour.slug}>
                                {colour.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          className="z-clear"
                          style={{ padding: 0 }}
                          onClick={() => {
                            set(
                              'images',
                              c.images.filter((v) => v.src !== img.src),
                            )
                            if (c.featuredImage === img.src)
                              setSelected((v) =>
                                v ? { ...v, featuredImage: v.images[0]?.src || '' } : null,
                              )
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </fieldset>
                {c.source && (
                  <p className="z-note" style={{ marginTop: 25 }}>
                    Source facts retrieved: {new Date(c.source.retrievedAt).toLocaleDateString()}.
                    Prices require operational verification before launch.
                  </p>
                )}
                <div className="z-admin-actions">
                  <button className="z-button" disabled={busy}>
                    {busy ? 'Saving…' : 'Save vehicle'}
                  </button>
                  {c.publicationStatus === 'published' && c.revision > 0 && (
                    <Link className="z-button z-button-outline" href={carHref(c)}>
                      View vehicle
                    </Link>
                  )}
                  {c.revision > 0 && (
                    <button type="button" className="z-clear" disabled={busy} onClick={remove}>
                      Delete vehicle
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="z-empty">
                <Icon name="grid" size={32} />
                <h2>Manage your fleet.</h2>
                <p>
                  Select a vehicle to edit its pricing, specifications, images and availability, or
                  add a new vehicle.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <section>
          <p className="z-note" style={{ marginBottom: 25 }}>
            Confirm only after agreeing the rental with the customer. Confirmed reservations block
            overlapping dates immediately. Pending requests do not guarantee availability.
          </p>
          {reservations.length ? (
            reservations.map((r) => (
              <article key={r.id} className="z-reservation-row">
                <p className="z-kicker">
                  {r.status} · {r.id}
                </p>
                <h2 style={{ fontSize: 20, marginTop: 10 }}>
                  {cars.find((c) => c.id === r.vehicleId)?.name || r.vehicleId}
                </h2>
                <p>
                  {r.start} → {r.end} · {r.location}
                </p>
                <p>
                  {r.name} · {r.email} · {r.phone}
                </p>
                {r.notes && <p>{r.notes}</p>}
                {!!r.documents?.length && (
                  <div style={{ marginTop: 16 }}>
                    <p className="z-kicker">Private rental documents</p>
                    <ul>
                      {r.documents.map((document) => (
                        <li key={document.id} style={{ marginTop: 10 }}>
                          <a
                            className="z-text-link"
                            href={'/api/admin/reservations/' + r.id + '/documents/' + document.id}
                            download
                          >
                            {document.name} · {(document.size / 1024).toFixed(0)} KB
                          </a>{' '}
                          <button
                            type="button"
                            className="z-clear"
                            onClick={async () => {
                              if (!window.confirm('Delete this customer document?')) return
                              try {
                                await request(
                                  '/api/admin/reservations/' + r.id + '/documents/' + document.id,
                                  'DELETE',
                                )
                                setReservations((previous) =>
                                  previous.map((item) =>
                                    item.id === r.id
                                      ? {
                                          ...item,
                                          documents: item.documents?.filter(
                                            (file) => file.id !== document.id,
                                          ),
                                        }
                                      : item,
                                  ),
                                )
                              } catch (error) {
                                setError(
                                  error instanceof Error
                                    ? error.message
                                    : 'Could not delete document.',
                                )
                              }
                            }}
                          >
                            Delete document
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="z-note">
                      Downloads are private. Attachments expire after 30 days. Open customer
                      documents only in an up-to-date viewer.
                    </p>
                  </div>
                )}
                <div className="z-admin-actions">
                  {r.status === 'pending' && (
                    <button
                      className="z-button"
                      disabled={busy}
                      onClick={() => changeReservation(r.id, 'confirmed')}
                    >
                      Confirm reservation
                    </button>
                  )}
                  {r.status !== 'cancelled' && (
                    <button
                      className="z-button z-button-outline"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm('Cancel this reservation?'))
                          changeReservation(r.id, 'cancelled')
                      }}
                    >
                      Cancel reservation
                    </button>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="z-empty">
              <Icon name="calendar" size={32} />
              <h2>No reservation requests yet.</h2>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { T, useRegional } from './RegionalProvider'
import Icon from './Icon'
import PhoneField from './PhoneField'
import { partnershipFields, type PartnershipType } from '@/lib/partnership'

export default function PartnershipForm({ initialType }: { initialType: PartnershipType }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [reference, setReference] = useState('')
  const success = useRef<HTMLDivElement>(null),
    errorBox = useRef<HTMLParagraphElement>(null)
  const { t } = useRegional()
  const fields = partnershipFields[initialType]
  useEffect(() => {
    if (reference) success.current?.focus()
  }, [reference])
  useEffect(() => {
    if (error) errorBox.current?.focus()
  }, [error])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: initialType,
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          details: form.get('details'),
          consent: form.get('consent') === 'on',
          application: Object.fromEntries(
            fields.map((field) => [field.name, form.get(field.name)]),
          ),
        }),
      })
      const result = await response.json()
      if (!response.ok)
        throw new Error(result.error || 'Your application could not be sent. Please try again.')
      setReference(result.id)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Your application could not be sent. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }
  if (reference)
    return (
      <div className="z-partner-success" role="status" tabIndex={-1} ref={success}>
        <Icon name="check" size={36} />
        <h2>
          <T>Application received.</T>
        </h2>
        <p>
          <T>
            {initialType === 'consignment'
              ? 'We will review your vehicle details and contact you to discuss suitability, management and consignment terms.'
              : 'We will review your agency and contact you about your selected subscription or lead enquiry.'}
          </T>
        </p>
        <p>
          <T>Your application does not activate a listing or confirm a partnership.</T>
        </p>
        <p>
          <T>Keep your reference</T>: <bdi>{reference}</bdi>
        </p>
        <Link href="/" className="z-button">
          <T>Back to home</T>
          <Icon name="arrow" />
        </Link>
      </div>
    )
  return (
    <form onSubmit={submit} className="z-partner-form" aria-busy={busy}>
      <div className="z-partner-form-heading">
        <p className="z-kicker">
          <T>{initialType === 'consignment' ? 'Owner application' : 'Agency application'}</T>
        </p>
        <h2>
          <T>
            {initialType === 'consignment' ? 'Tell us about your car' : 'Introduce your agency'}
          </T>
        </h2>
        <p>
          <T>
            Required fields are marked *. You can discuss the commercial terms with our team after
            review.
          </T>
        </p>
      </div>
      {[...new Set(fields.map((field) => field.section))].map((section, index) => (
        <fieldset key={section} disabled={busy}>
          <legend>
            <span>0{index + 1}</span>
            <T>{section}</T>
          </legend>
          <div className="z-two-fields">
            {fields
              .filter((field) => field.section === section)
              .map((field) => (
                <label className="z-field" key={field.name} htmlFor={'partner-' + field.name}>
                  <span>
                    <T>{field.label}</T>
                    {!field.optional && ' *'}
                  </span>
                  {field.kind === 'select' ? (
                    <select
                      id={'partner-' + field.name}
                      name={field.name}
                      required
                      defaultValue=""
                      aria-describedby={field.hint ? 'hint-' + field.name : undefined}
                    >
                      <option value="" disabled>
                        {t('Select an option')}
                      </option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {t(option)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={'partner-' + field.name}
                      name={field.name}
                      type={field.kind || 'text'}
                      required={!field.optional}
                      maxLength={field.kind === 'number' ? undefined : field.max || 120}
                      min={field.kind === 'number' ? field.min : undefined}
                      max={field.kind === 'number' ? field.max : undefined}
                      step={field.kind === 'number' ? 1 : undefined}
                      autoComplete={field.name === 'company' ? 'organization' : undefined}
                      aria-describedby={field.hint ? 'hint-' + field.name : undefined}
                    />
                  )}
                  {field.hint && (
                    <small id={'hint-' + field.name}>
                      <T>{field.hint}</T>
                    </small>
                  )}
                </label>
              ))}
          </div>
        </fieldset>
      ))}
      <fieldset disabled={busy}>
        <legend>
          <span>03</span>
          <T>Your contact details</T>
        </legend>
        <label className="z-field">
          <span>
            <T>Your name</T> *
          </span>
          <input name="name" required maxLength={120} autoComplete="name" />
        </label>
        <div className="z-two-fields">
          <label className="z-field">
            <span>
              <T>Email</T> *
            </span>
            <input name="email" required type="email" maxLength={200} autoComplete="email" />
          </label>
          <PhoneField />
        </div>
        <label className="z-field">
          <T>Additional notes (optional)</T>
          <textarea
            name="details"
            maxLength={1500}
            rows={4}
            placeholder={t(
              initialType === 'consignment'
                ? 'Anything else we should know about the car, its history or your expectations?'
                : 'Tell us how many cars you would like to display or ask about the monthly subscription.',
            )}
          />
        </label>
        <p className="z-note">
          <T>
            No document uploads are needed at this stage. Please do not include identity documents,
            bank details or passwords.
          </T>
        </p>
        <label className="z-partner-consent">
          <input name="consent" type="checkbox" required />
          <span>
            <T>
              I am authorised to make this application and agree to Zavi using these details to
              assess it and contact me.
            </T>{' '}
            *{' '}
            <Link href="/privacy">
              <T>Privacy notice</T>
            </Link>
          </span>
        </label>
        {error && (
          <p className="z-error" role="alert" ref={errorBox} tabIndex={-1}>
            {t(error)}
          </p>
        )}
        <button className="z-button" type="submit">
          <T>
            {busy
              ? 'Sending…'
              : initialType === 'consignment'
                ? 'Submit my car for review'
                : 'Apply as a rental agency'}
          </T>
          <Icon name="arrow" size={18} />
        </button>
      </fieldset>
    </form>
  )
}

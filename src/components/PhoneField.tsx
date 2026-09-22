'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { T } from './RegionalProvider'

// Calling codes are explicit choices; no code is inferred from location or language.
const countries: [string, string][] = [
  ['United Arab Emirates', '971'],
  ['Saudi Arabia', '966'],
  ['United Kingdom', '44'],
  ['United States / Canada', '1'],
  ['India', '91'],
  ['Pakistan', '92'],
  ['Qatar', '974'],
  ['Kuwait', '965'],
  ['Bahrain', '973'],
  ['Oman', '968'],
  ['Afghanistan', '93'],
  ['Albania', '355'],
  ['Algeria', '213'],
  ['Argentina', '54'],
  ['Armenia', '374'],
  ['Australia', '61'],
  ['Austria', '43'],
  ['Azerbaijan', '994'],
  ['Bangladesh', '880'],
  ['Belarus', '375'],
  ['Belgium', '32'],
  ['Bosnia and Herzegovina', '387'],
  ['Brazil', '55'],
  ['Bulgaria', '359'],
  ['China', '86'],
  ['Croatia', '385'],
  ['Cyprus', '357'],
  ['Czechia', '420'],
  ['Denmark', '45'],
  ['Egypt', '20'],
  ['Estonia', '372'],
  ['Ethiopia', '251'],
  ['Finland', '358'],
  ['France', '33'],
  ['Georgia', '995'],
  ['Germany', '49'],
  ['Ghana', '233'],
  ['Greece', '30'],
  ['Hong Kong', '852'],
  ['Hungary', '36'],
  ['Iceland', '354'],
  ['Indonesia', '62'],
  ['Iran', '98'],
  ['Iraq', '964'],
  ['Ireland', '353'],
  ['Israel', '972'],
  ['Italy', '39'],
  ['Japan', '81'],
  ['Jordan', '962'],
  ['Kazakhstan / Russia', '7'],
  ['Kenya', '254'],
  ['Kyrgyzstan', '996'],
  ['Latvia', '371'],
  ['Lebanon', '961'],
  ['Libya', '218'],
  ['Lithuania', '370'],
  ['Luxembourg', '352'],
  ['Malaysia', '60'],
  ['Maldives', '960'],
  ['Malta', '356'],
  ['Mauritius', '230'],
  ['Mexico', '52'],
  ['Moldova', '373'],
  ['Montenegro', '382'],
  ['Morocco', '212'],
  ['Nepal', '977'],
  ['Netherlands', '31'],
  ['New Zealand', '64'],
  ['Nigeria', '234'],
  ['North Macedonia', '389'],
  ['Norway', '47'],
  ['Palestine', '970'],
  ['Philippines', '63'],
  ['Poland', '48'],
  ['Portugal', '351'],
  ['Romania', '40'],
  ['Serbia', '381'],
  ['Seychelles', '248'],
  ['Singapore', '65'],
  ['Slovakia', '421'],
  ['Slovenia', '386'],
  ['South Africa', '27'],
  ['South Korea', '82'],
  ['Spain', '34'],
  ['Sri Lanka', '94'],
  ['Sudan', '249'],
  ['Sweden', '46'],
  ['Switzerland', '41'],
  ['Syria', '963'],
  ['Taiwan', '886'],
  ['Tajikistan', '992'],
  ['Tanzania', '255'],
  ['Thailand', '66'],
  ['Tunisia', '216'],
  ['Türkiye', '90'],
  ['Turkmenistan', '993'],
  ['Uganda', '256'],
  ['Ukraine', '380'],
  ['Uzbekistan', '998'],
  ['Vietnam', '84'],
  ['Yemen', '967'],
  ['Zambia', '260'],
  ['Zimbabwe', '263'],
  ['Peru', '51'],
  ['Cuba', '53'],
  ['Chile', '56'],
  ['Colombia', '57'],
  ['Venezuela', '58'],
  ['Myanmar', '95'],
]
export default function PhoneField({ defaultValue = '' }: { defaultValue?: string }) {
  const id = useId()
  const numberInput = useRef<HTMLInputElement>(null)
  const initial = defaultValue.replace(/[ ()-]/g, '')
  const found = [...countries]
    .sort((a, b) => b[1].length - a[1].length)
    .find(([, code]) => initial.startsWith('+' + code))
  const unknownCode = !found && /^\+[1-9][0-9]{7,14}$/.test(initial) ? initial.slice(1, 4) : ''
  const [code, setCode] = useState(found?.[1] || (unknownCode ? 'other' : ''))
  const [customCode, setCustomCode] = useState(unknownCode)
  const [number, setNumber] = useState(
    found
      ? initial.slice(found[1].length + 1)
      : unknownCode
        ? initial.slice(4)
        : initial.replace(/^\+/, ''),
  )
  const selected = code === 'other' ? customCode : code
  const phone = selected ? '+' + selected + number.replace(/[ ()-]/g, '') : ''
  useEffect(() => {
    numberInput.current?.setCustomValidity(
      selected && number && !/^\+[1-9][0-9]{7,14}$/.test(phone)
        ? 'Enter a complete phone number: 8 to 15 digits including the country code.'
        : '',
    )
  }, [selected, number, phone])
  return (
    <fieldset className="z-field z-phone-field">
      <legend>
        <T>Phone / WhatsApp</T> *
      </legend>
      <div className="z-phone-controls">
        <label htmlFor={id + '-code'} className="sr-only">
          <T>Country code</T>
        </label>
        <select
          id={id + '-code'}
          name="countryCode"
          required
          autoComplete="tel-country-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        >
          <option value="" disabled>
            Country code *
          </option>
          {countries.map(([name, value]) => (
            <option value={value} key={value}>
              +{value} · {name}
            </option>
          ))}
          <option value="other">Another country code</option>
        </select>
        <label htmlFor={id + '-number'} className="sr-only">
          <T>Phone number</T>
        </label>
        <input
          ref={numberInput}
          id={id + '-number'}
          name="nationalPhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          pattern={'[0-9](?:[ ()\\-]*[0-9]){4,13}'}
          maxLength={20}
          placeholder="50 123 4567"
          aria-describedby={id + '-hint'}
        />
      </div>
      {code === 'other' && (
        <label className="z-phone-custom">
          <T>Country calling code (without +)</T>
          <input
            name="customCountryCode"
            required
            inputMode="numeric"
            pattern="[1-9][0-9]{0,2}"
            maxLength={3}
            value={customCode}
            onChange={(event) => setCustomCode(event.target.value)}
            placeholder="e.g. 591"
          />
        </label>
      )}
      <input type="hidden" name="phone" value={phone} />
      <small className="z-note" id={id + '-hint'}>
        <T>Select your country code, then enter your phone number.</T>
      </small>
    </fieldset>
  )
}

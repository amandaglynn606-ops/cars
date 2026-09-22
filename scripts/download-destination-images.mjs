import { readFile, writeFile, mkdir } from 'node:fs/promises'
import sharp from 'sharp'
const choices = [
  ['yas-island', 'resort-0', 'File:Yas Marina Hotel by Rob Alter.jpg'],
  ['al-marjan-resort', 'stays-4', 'File:MövenpickResortAlMarjan.jpg'],
  ['palm-coast', 'tourism-5', 'File:Palm jumeirah core.jpg'],
  ['dubai-marina', 'tourism-6', 'File:Dubai Marina Skyline.jpg'],
  ['dubai-creek-harbour', 'tourism-7', 'File:DUBAI CREEK HARBOUR 1.jpg'],
  ['jumeirah-resort', 'tourism-8', 'File:Jumeirah beach hotel pool - panoramio.jpg'],
  [
    'emirates-hills',
    'tourism-9',
    'File:Dubai – Marina - دبي – مارينا - Golf - Emirates Hills 2 - جولف - تلال الإمارات 2 - panoramio.jpg',
  ],
]
const strip = (s) =>
  (s || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
const refresh = process.argv.includes('--refresh-resorts')
const districts = process.argv.includes('--refresh-districts')
const credits = districts ? JSON.parse(await readFile('public/destinations/sources.json','utf8')).filter(x=>!['palm-jumeirah','palm-coast','jumeirah-beach','jumeirah-resort'].includes(x.id)) : refresh
  ? JSON.parse(await readFile('public/destinations/sources.json', 'utf8')).filter(
      (x) =>
        ![
          'ajman-resort',
          'fujairah-rotana',
          'vida-umm-al-quwain',
          'fairmont-ajman',
          'intercontinental-fujairah',
          'vida-resort-pool',
          'sharjah-resort',
        ].includes(x.id),
    )
  : []
await mkdir('public/destinations', { recursive: true })
async function save(id, url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/'))
    throw new Error(id + ' HTTP ' + response.status)
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length > 30000000) throw new Error('Oversize image')
  await sharp(bytes)
    .rotate()
    .resize({ width: 2560, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile('public/destinations/' + id + '.webp')
  console.log('Saved ' + id)
}
for (const [id, file, title] of refresh ? [] : districts ? choices.filter(c=>['palm-coast','jumeirah-resort'].includes(c[0])) : choices) {
  const data = JSON.parse(await readFile('.local/emirates/' + file + '.json', 'utf8'))
  const info = Object.values(data.query.pages).find((p) => p.title === title).imageinfo[0]
  const url = new URL(info.url)
  url.search = ''
  if (url.hostname !== 'upload.wikimedia.org') throw new Error('Unexpected host')
  await save(id, url.href)
  const meta = info.extmetadata
  credits.push({
    id,
    title: title.slice(5),
    author: strip(meta.Artist?.value),
    license: strip(meta.LicenseShortName?.value),
    licenseUrl: (meta.LicenseUrl?.value || info.descriptionurl).replace(/^http:/, 'https:'),
    source: info.descriptionurl,
    original: url.href,
    changes: 'Resized and converted to WebP; cropped in the layout. Original colours retained.',
  })
}
const official = [
  {
    id: 'vida-resort-pool',
    title: 'Vida Beach Resort Umm Al Quwain swimming pool',
    author: 'Vida Hotels and Resorts',
    source:
      'https://www.vidahotels.com/en/resorts/vida-beach-resort-umm-al-quwain/photos-and-videos/',
    url: 'https://www.vidahotels.com/wp-content/uploads/2021/09/Swimming-Pool-1920px-X-1280px-.jpg',
  },
  {
    id: 'fairmont-ajman',
    title: 'Fairmont Ajman',
    author: 'Fairmont Hotels and Resorts',
    source: 'https://www.fairmont.com/en/hotels/ajman/fairmont-ajman.html',
    url: 'https://m.ahstatic.com/is/image/accorhotels/aja_p_5815-30?fmt=jpg&wid=2560&qlt=90',
  },
  {
    id: 'intercontinental-fujairah',
    title: 'InterContinental Fujairah Resort',
    author: 'IHG Hotels and Resorts',
    source: 'https://www.ihg.com/intercontinental/hotels/us/en/fujairah/fjrae/hoteldetail',
    url: 'https://digital.ihg.com/is/image/ihg/intercontinental-fujairah-9690211797-2x1?wid=2560',
  },
  {
    id: 'sharjah-resort',
    title: 'Al Badayer Retreat, Sharjah',
    author: 'Sharjah Collection',
    source: 'https://sharjahcollection.ae/en/al-badayer-retreat/',
    url: 'https://sharjahcollection.ae/wp-content/uploads/2024/02/One-Bedroom-Tent-Outdoor-Area.jpg',
  },
]
for (const asset of districts ? [] : official) {
  await save(asset.id, asset.url)
  credits.push({
    id: asset.id,
    title: asset.title,
    author: asset.author,
    license: 'Official property photograph — reuse permission not verified',
    licenseUrl: asset.source,
    source: asset.source,
    original: asset.url,
    changes:
      'Local design preview. Resized and converted to WebP; obtain publication rights before public use.',
  })
}
await writeFile('public/destinations/sources.json', JSON.stringify(credits, null, 2) + '\n')

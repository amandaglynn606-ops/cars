import { DatabaseSync } from 'node:sqlite'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
const noCredit = process.argv.includes('--no-credit')
const dir = noCredit ? '.local/stock-no-credit' : '.local/stock-research'
await mkdir(dir, { recursive: true })
const db = new DatabaseSync('.local/zavi.sqlite', { readOnly: true })
const fleet = db
  .prepare('SELECT data FROM vehicles')
  .all()
  .map((r) => JSON.parse(r.data))
db.close()
const cars = fleet.filter((c) => c.publicationStatus === 'published')
await writeFile(
  dir + '/inventory.json',
  JSON.stringify(
    cars.map((c) => ({
      id: c.id,
      name: c.name,
      model: c.model,
      year: c.year,
      slug: c.slug,
      brandSlug: c.brandSlug,
      modelSlug: c.modelSlug,
      colours: c.colors.map((x) => x.slug),
      original: c.featuredImage,
    })),
    null,
    2,
  ),
)
const clean = (s) => (s || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&')
async function request(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await fetch(url, {
        headers: { 'User-Agent': 'ZaviPhotoResearch/1.0 (local vehicle photo licence review)' },
        signal: AbortSignal.timeout(30000),
      })
    } catch (error) {
      if (attempt === 3) throw error
      await new Promise((resolve) => setTimeout(resolve, 30000))
    }
  }
}
const limit = Number(process.argv[2] || cars.length)
const refresh = (process.argv[3] || '')
  .split(',')
  .filter((value) => value && !value.startsWith('--'))
const queries = {
  'Mercedes-Benz GT63 Black Series': 'Mercedes AMG GT Black Series',
  'Rolls-Royce Phantom': 'Rolls-Royce Phantom VIII',
  'Lamborghini Performante': 'Lamborghini Urus Performante',
  'Maserati MC120': 'Maserati MC20',
  'BMW 740i': 'BMW G70 740i',
  'BMW 760i': 'BMW G70 760i',
  'BMW 320i': 'BMW G20 320i',
  'Mercedes-Benz GTC/R': 'Mercedes AMG GT R',
  'Range Rover HSE Vogue 1st': 'Range Rover L460',
  'Nissan Nismo': 'Nissan Patrol Nismo',
  'Nissan Patrol': 'Nissan Patrol Y62',
  'Porsche 911 GT3RS': 'Porsche 992 GT3 RS',
  'Porsche GT3RS': 'Porsche 992 GT3 RS',
  'Porsche 911 Targa': 'Porsche 992 Targa',
  'Mercedes-Benz Maybach S680 Long': 'Mercedes Maybach S680',
  'BMW 840': 'BMW G14 convertible',
  'BMW 850i': 'BMW M850i G15',
  'Chevrolet Camaro V8': 'Chevrolet Camaro sixth generation SS',
  'Ford Mustang': 'Ford Mustang VII',
  'MINI Cooper S': 'Mini Cooper S F57 convertible',
  'Land Rover Defender': 'Land Rover Defender L663 110 front',
  'Lamborghini EVO': 'Lamborghini Huracan Evo Spyder',
  'Ferrari F8 Spyder': 'Ferrari F8 Spider',
  'Ferrari F8 Trubito': 'Ferrari F8 Tributo',
  'Mercedes-Benz Brabus G900': 'Mercedes AMG G63',
  'Mercedes-Benz S580 Brabus': 'Mercedes S580 W223',
  'Range Rover Vogue SV': 'Range Rover L460',
}
for (const car of cars.slice(0, limit)) {
  if (refresh.length && !refresh.includes(car.slug)) continue
  const path = dir + '/' + car.slug + '.json'
  if (!refresh.length) {
    try {
      const saved = JSON.parse(await readFile(path, 'utf8'))
      if (!noCredit || !saved.query.includes(' OR ')) continue
    } catch {}
  }
  const baseQuery =
    queries[car.name] || car.name.replace(/Silver|Yellow|Blue|White|Green|Nardo|Red/gi, '').trim()
  const query = noCredit
    ? baseQuery.replace(/Mansory|Brabus|Long|Performante/g, '').trim() + ' incategory:CC-Zero'
    : baseQuery
  const url = new URL('https://commons.wikimedia.org/w/api.php')
  Object.entries({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: '24',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '500',
  }).forEach(([k, v]) => url.searchParams.set(k, v))
  try {
    const response = await request(url)
    if (!response.ok) throw Error('HTTP ' + response.status)
    const data = await response.json()
    if (data.error) throw Error(JSON.stringify(data.error))
    const photos = Object.values(data.query?.pages || {})
      .map((p) => {
        const i = p.imageinfo?.[0],
          m = i?.extmetadata || {}
        return {
          title: p.title,
          url: i?.url,
          thumb: i?.thumburl,
          width: i?.width,
          height: i?.height,
          source: i?.descriptionurl,
          description: clean(m.ImageDescription?.value),
          author: clean(m.Artist?.value),
          license: clean(m.LicenseShortName?.value),
          licenseUrl: m.LicenseUrl?.value,
          restrictions: clean(m.Restrictions?.value),
        }
      })
      .filter(
        (p) =>
          p.width >= 1600 &&
          p.height >= 900 &&
          !/NC|ND|noncommercial|non-commercial|NoDeriv/i.test(p.license) &&
          (noCredit
            ? /^(CC0|Public domain)$/.test(p.license)
            : /CC BY|CC0|Public domain/.test(p.license)),
      )
    await writeFile(path, JSON.stringify({ car: car.name, query, photos }, null, 2))
    console.log(car.name, photos.length)
  } catch (e) {
    console.log(car.name, e.message)
    process.exitCode = 1
    break
  }
  await new Promise((r) => setTimeout(r, 5000))
}

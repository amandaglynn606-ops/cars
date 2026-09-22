import { mkdir, writeFile } from 'node:fs/promises'
import { moduleURL } from '../tests/load-module.mjs'
const directory = '.local/site-audit'
await mkdir(directory, { recursive: true })
const regional = await moduleURL('src/lib/regional-locations.ts')
const { locationPages } = await import(await moduleURL('src/lib/location-pages.ts', { './regional-locations': regional }))
const jobs = [
  ['google-updates', 'https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history'],
  ['google-core', 'https://developers.google.com/search/docs/appearance/core-updates'],
  ['google-spam', 'https://developers.google.com/search/docs/essentials/spam-policies'],
  ['google-helpful', 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content'],
  ['f1-official', 'https://www.formula1.com/en/racing/2026/united-arab-emirates'],
  ['yas-official', 'https://www.yasmarinacircuit.com/en/formula1'],
  ['arena-dubai', 'https://www.coca-cola-arena.com/events'],
  ['arena-abu-dhabi', 'https://www.etihadarena.ae/en/events'],
  ['racing-dubai', 'https://www.dubairacingclub.com/'],
  ['address-sky-view', 'https://www.addresshotels.com/en/hotels/address-sky-view/gallery/'],
  ['armani-hotel-dubai', 'https://www.armanihotels.com/en/hotels/armani-hotel-dubai/'],
]
const headers = { 'User-Agent': 'ZaviLocalReview/1.0 (image attribution and official event research)', 'Accept-Language': 'en' }
const clean = value => value.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
for (let i = 0; i < jobs.length; i += 4) {
  await Promise.all(jobs.slice(i, i + 4).map(async ([id, url]) => {
    try {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(35000) })
      const html = await response.text()
      await writeFile(`${directory}/${id}.html`, html)
      await writeFile(`${directory}/${id}.txt`, clean(html))
      console.log(id, response.status, response.url)
    } catch (error) { console.log(id, error.message) }
  }))
}
await writeFile(`${directory}/locations.json`, JSON.stringify(locationPages.map(({slug,name,group,photo,region})=>({slug,name,group,photo,region})), null, 2))
const searches = [
  ...locationPages.filter(page => page.group === 'Hotels & resorts').map(page => [page.slug, page.name]),
  ['event-f1', 'Abu Dhabi Grand Prix Yas Marina'],
  ['event-concert-dubai', 'Coca Cola Arena concert Dubai'],
  ['event-concert-abu-dhabi', 'Etihad Arena concert'],
  ['event-world-cup', 'Dubai World Cup horse race'],
]
for (let i = 0; i < searches.length; i += 3) {
  await Promise.all(searches.slice(i, i + 3).map(async ([id, query]) => {
    const url = new URL('https://commons.wikimedia.org/w/api.php')
    url.search = new URLSearchParams({ action:'query', format:'json', generator:'search', gsrsearch:query+' filetype:bitmap', gsrnamespace:'6', gsrlimit:'6', prop:'imageinfo', iiprop:'url|size|extmetadata' }).toString()
    try {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(30000) })
      const data = await response.json()
      await writeFile(`${directory}/commons-${id}.json`, JSON.stringify(data, null, 2))
      console.log('Images', id, Object.values(data.query?.pages || {}).map(p=>p.title).join(' | '))
    } catch(error) { console.log('Images',id,error.message) }
  }))
}

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import sharp from 'sharp'
const chosen = [
  ['dubai','File:Dubai skyline unsplash.jpg'],
  ['abu-dhabi','File:Sheikh-Zayed-Grand-Mosque-at-Night.jpg'],
  ['sharjah','File:AL NOORISLAND AND SHARJAH AL MAJAZ.jpg'],
  ['ajman','File:Ajman Fort 2024.jpg'],
  ['umm-al-quwain','File:Umm Al Quwain Fort today.jpg'],
  ['ras-al-khaimah','File:Dhayah Fort, Ras Al Khaimah.jpg'],
  ['fujairah','File:Fujairah Fort, Fujariah.jpg'],
]
const plain = value => (value || '').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()
await mkdir('public/emirates', { recursive:true })
const credits = []
for (const [index, [id, title]] of chosen.entries()) {
  const data = JSON.parse(await readFile('.local/emirates/' + index + '.json','utf8'))
  const info = Object.values(data.query.pages).find(p => p.title === title).imageinfo[0]
  const url = new URL(info.url); url.search = ''
  if (url.hostname !== 'upload.wikimedia.org' || url.protocol !== 'https:') throw new Error('Unexpected image host')
  const response = await fetch(url, { redirect:'error', signal:AbortSignal.timeout(30000) })
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error('Image download failed: ' + id + ' HTTP ' + response.status)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length > 30000000) throw new Error('Image too large')
  await writeFile('.local/emirates/' + id + '.jpg',buffer)
  await sharp(buffer).rotate().resize({width:2560,withoutEnlargement:true}).webp({quality:88}).toFile('public/emirates/' + id + '.webp')
  const meta = info.extmetadata
  credits.push({ id, title:title.slice(5), author:plain(meta.Artist?.value), license:plain(meta.LicenseShortName?.value), licenseUrl:meta.LicenseUrl?.value || (id === 'dubai' ? 'https://creativecommons.org/publicdomain/zero/1.0/' : ''), source:info.descriptionurl, original:url.href, changes:'Resized and converted to WebP. Display cropped to fit the banner; original colours retained.' })
  console.log('Saved ' + id)
}
await writeFile('public/emirates/sources.json',JSON.stringify(credits,null,2)+'\n')

import { mkdir, writeFile } from 'node:fs/promises'
const queries = ['Sharjah beach', 'Barracuda resort', 'Umm Quwain hotel', 'Al Bait Sharjah', 'Al Marjan resort']
await mkdir('.local/emirates', { recursive: true })
for (const query of queries) {
  const url = new URL('https://en.wikipedia.org/w/api.php')
  url.search = new URLSearchParams({ action: 'query', format: 'json', generator: 'search', gsrsearch: query + ' filetype:bitmap', gsrnamespace: '6', gsrlimit: '8', prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '2000' }).toString()
  const response = await fetch(url, { headers: { 'User-Agent': 'ZaviSiteAssets/1.0 (landmark photo attribution research)' }, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error('Commons HTTP ' + response.status)
  const data = await response.json()
  await writeFile('.local/emirates/stays-' + queries.indexOf(query) + '.json', JSON.stringify(data, null, 2))
  console.log(query, Object.values(data.query?.pages || {}).map(p => ({title:p.title,width:p.imageinfo?.[0].width,height:p.imageinfo?.[0].height,license:p.imageinfo?.[0].extmetadata?.LicenseShortName?.value})))
}

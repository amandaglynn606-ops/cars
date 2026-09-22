import { readFile, writeFile } from 'node:fs/promises'
const root = '.local/site-audit'
const locations = JSON.parse(await readFile(root+'/locations.json','utf8'))
const jobs = [
  ['event-f1', '"Abu Dhabi Grand Prix"'],
  ['event-world-cup', '"Dubai World Cup" horses'],
  ['event-concert-dubai', '"Coca-Cola Arena"'],
  ['event-concert-abu-dhabi', '"Etihad Arena"'],
  ['address-sky-view', '"Address Sky View"'],
  ['armani-hotel-dubai', '"Burj Khalifa" exterior'],
  ...locations.filter(p=>!['address-sky-view','armani-hotel-dubai'].includes(p.slug)).map(p=>[p.slug, '"'+p.name.replace(' – ', ' ')+'" '+(p.name.includes(p.region)?'':p.region)]),
]
for(const [id,query] of jobs) {
  try { const old = JSON.parse(await readFile(root+'/commons-'+id+'.json','utf8')); if(Object.keys(old.query?.pages||{}).length)continue } catch {}
  const url=new URL('https://commons.wikimedia.org/w/api.php')
  url.search=new URLSearchParams({action:'query',format:'json',generator:'search',gsrsearch:query+' filetype:bitmap',gsrnamespace:'6',gsrlimit:'6',prop:'imageinfo',iiprop:'url|size|extmetadata'}).toString()
  try {
    const response=await fetch(url,{headers:{'User-Agent':'ZaviLocalReview/1.0 (image attribution research)'},signal:AbortSignal.timeout(25000)})
    if(response.status===429){console.log('Rate limited: stopping for later retry');break}
    if(!response.ok)throw Error('HTTP '+response.status)
    const data=await response.json()
    await writeFile(root+'/commons-'+id+'.json',JSON.stringify(data,null,2))
    console.log(id, Object.values(data.query?.pages||{}).map(p=>p.title).join(' | '))
  }catch(e){console.log(id,e.message)}
  await new Promise(resolve=>setTimeout(resolve,8000))
}

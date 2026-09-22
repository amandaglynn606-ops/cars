import { mkdir, writeFile } from 'node:fs/promises'
const urls = [
  ['lux-home','https://luxmotorsdxb.com/'],
  ['lux-sitemap','https://luxmotorsdxb.com/sitemap_index.xml'],
  ['lux-robots','https://luxmotorsdxb.com/robots.txt'],
  ['google-updates','https://developers.google.com/search/updates/ranking'],
  ['google-core','https://developers.google.com/search/docs/monitor-debug/google-updates/core-updates'],
  ['google-spam','https://developers.google.com/search/docs/essentials/spam-policies'],
]
await mkdir('.local/page-research',{recursive:true})
for(const [name,url] of urls){
  try{
    const response=await fetch(url,{signal:AbortSignal.timeout(25000)})
    const body=await response.text()
    await writeFile('.local/page-research/'+name+'.html',body)
    console.log(name,response.status,body.length)
    if(name==='lux-home') console.log([...new Set([...body.matchAll(/href=["']([^"']+)["']/g)].map(m=>m[1]))].filter(h=>!/\.(css|js|png|jpg|webp|svg)|wp-json|feed|tel:|mailto:/.test(h)))
    if(name==='lux-sitemap'||name==='lux-robots') console.log(body.slice(0,5000))
  }catch(e){console.log(name,e.message)}
}

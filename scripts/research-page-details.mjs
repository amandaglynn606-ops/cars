import { readFile, writeFile } from 'node:fs/promises'
const home=await readFile('.local/page-research/lux-home.html','utf8')
const links=[...new Set([...home.matchAll(/href=["']([^"']+)["']/g)].map(m=>m[1]))]
const start=links.indexOf('https://luxmotorsdxb.com/palm-jumeirah-luxury-car-rentals/')
const end=links.indexOf('https://luxmotorsdxb.com/dubai-real-estate-viewings-luxury-car-rentals/')
const selected=links.slice(start,end+1).filter(url=>new URL(url).hostname==='luxmotorsdxb.com')
const results=[]
const clean=s=>s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()
for(let index=0;index<selected.length;index+=4){
  await Promise.all(selected.slice(index,index+4).map(async url=>{
    const response=await fetch(url,{signal:AbortSignal.timeout(20000)})
    const body=await response.text()
    const slug=new URL(url).pathname.split('/').filter(Boolean)[0]
    await writeFile('.local/page-research/'+slug+'.html',body)
    results.push({url,status:response.status,headings:[...body.matchAll(/<h([12])\b[^>]*>([\s\S]*?)<\/h[12]>/g)].map(m=>({level:Number(m[1]),text:clean(m[2])})),description:body.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/)?.[1]})
  }))
  console.log('Reviewed '+Math.min(index+4,selected.length)+' / '+selected.length)
}
await writeFile('.local/page-research/page-inventory.json',JSON.stringify(results,null,2))
const ranking=await readFile('.local/page-research/google-updates.html','utf8')
const incidents=[...ranking.matchAll(/href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/g)].filter(m=>/2026 (core|spam)/.test(m[2])).map(m=>({url:new URL(m[1],'https://status.search.google.com').href,text:clean(m[2])}))
console.log('Latest updates',incidents.slice(0,3))
const google=[
  ['google-core-latest','https://developers.google.com/search/docs/appearance/core-updates?hl=en'],
  ['google-spam-latest','https://developers.google.com/search/docs/essentials/spam-policies?hl=en'],
  ['google-helpful','https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=en'],
  ...incidents.slice(0,3).map((item,i)=>['google-incident-'+i,item.url])
]
for(const [name,url] of google){const r=await fetch(url,{headers:{'Accept-Language':'en-US,en;q=0.9'},signal:AbortSignal.timeout(20000)});const body=await r.text();await writeFile('.local/page-research/'+name+'.html',body);console.log(name,r.status,r.url);const main=body.match(/<article[\s\S]*?<\/article>/)?.[0]||body;await writeFile('.local/page-research/'+name+'.txt',clean(main.replace(/<script[\s\S]*?<\/script>/g,'')))}

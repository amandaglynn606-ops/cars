import { readFile, readdir, writeFile } from 'node:fs/promises'
const dir='.local/site-audit'
for(const name of ['address-sky-view','yas-official','arena-abu-dhabi','f1-race','dubai-world-cup']) {
 const html=await readFile(dir+'/'+name+'.html','utf8')
 const urls=[...new Set([...html.matchAll(/(?:src|href|content)=["']([^"']+)["']/g)].map(x=>x[1]).filter(x=>/\.(jpg|webp|png)|media|gallery|concert|event|2026|2027/.test(x)))]
 await writeFile(dir+'/'+name+'-links.json',JSON.stringify(urls,null,2))
 console.log(name,urls.filter(x=>/Sky|sky|2026|2027|concert|event/.test(x)).slice(0,25))
}
const files=(await readdir(dir)).filter(f=>f.startsWith('commons-'))
const all={}
for(const file of files){const data=JSON.parse(await readFile(dir+'/'+file,'utf8'));all[file.replace('commons-','').replace('.json','')]=Object.values(data.query?.pages||{}).map(p=>({title:p.title,...p.imageinfo?.[0]}))}
await writeFile(dir+'/candidate-index.json',JSON.stringify(all,null,2))

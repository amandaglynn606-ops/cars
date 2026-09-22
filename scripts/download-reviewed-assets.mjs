import { readFile, writeFile, mkdir } from 'node:fs/promises'
import sharp from 'sharp'
const dir='.local/site-audit'
const clean=s=>(s||'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&')
const choices = [
 ['w-dubai-the-palm','w-dubai-the-palm','File:Liquid Sky by Lucce The Dynamic Porte-Cochère of W Dubai - The Palm.png'],
 ['atlantis-the-royal','atlantis-the-royal','File:Atlantis The Royal, Dubai 2.jpg'],
 ['bulgari-resort-dubai','bulgari-resort-dubai','File:Sunset view from bulgari resort dubai.jpg'],
 ['dubai-concerts','event-concert-dubai','File:June14th-M5 .jpg'],
 ['al-marjan-island','al-marjan-island','File:Aerial View Al Marjan Island.jpg'],
 ['al-zorah','al-zorah','File:Al Zorah, Ajman.jpg'],
 ['al-aqah','al-aqah','File:Pristine blue waters of Snoopy Island.jpg'],
 ['abu-dhabi-corniche','abu-dhabi-corniche','File:Abu Dhabi Corniche 14.jpg'],
 ['al-majaz-sharjah','al-majaz-sharjah','File:AL MAJAZ WATER FRONT SHARJAH.jpg'],
 ['al-khan-sharjah','al-khan-sharjah','File:Sharjah view Al Khan.jpg'],
 ['ajman-corniche','ajman-corniche','File:Ajman corniche.jpg'],
 ['dibba-al-fujairah','dibba-al-fujairah','File:Dibba Al Fujairah Nature19.jpg'],
 ['falaj-al-mualla','falaj-al-mualla','File:Falaj Al Mualla Tower (East).jpg'],
 ['saadiyat-island','saadiyat-island','File:Saadiyat Island, Abu Dhabi, United Arab Emirates, uae, Travelvlogus, Travel To The World,.jpg'],
]
const official = [
 {id:'armani-hotel-dubai',url:'https://www.armanihotels.com/images/hotels/armani-hotel-dubai/hero/poster-desktop.webp',title:'Armani Hotel Dubai in Burj Khalifa',source:'https://www.armanihotels.com/en/hotels/armani-hotel-dubai',author:'Armani Hotels & Resorts'},
 {id:'five-palm-jumeirah',url:'https://palmjumeirah.fivehotelsandresorts.com/wp-content/uploads/2024/06/DSC03797-Editv2-1.jpg',title:'FIVE Palm Jumeirah, Dubai',source:'https://palmjumeirah.fivehotelsandresorts.com/',author:'FIVE Hotels and Resorts'},
 {id:'address-sky-view',url:'https://www-addresshotels-com.azureedge.net/wp-content/uploads/2021/02/Address-SkyView-V1.mp4.jpg',title:'Address Sky View, Dubai',source:'https://www.addresshotels.com/en/hotels/address-sky-view/',author:'Address Hotels + Resorts'},
 {id:'jumeirah-al-naseem',url:'https://cdn.jumeirah.com/api/public/content/cb47e96aed564cf3833f9042c339a959?v=7a58e10a',title:'Jumeirah Al Naseem, Dubai',source:'https://www.jumeirah.com/en/stay/dubai/jumeirah-al-naseem',author:'Jumeirah'},
 {id:'abu-dhabi-grand-prix',url:'https://media.formula1.com/image/upload/c_lfill,w_3392/q_auto/v1740000001/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Abu%20Dhabi.webp',title:'Abu Dhabi Grand Prix at Yas Marina Circuit',source:'https://www.formula1.com/en/racing/2026/united-arab-emirates',author:'Formula 1'},
 {id:'hans-zimmer',url:'https://static.myconnect.ae/-/media/yasconnect/project/ya/events-2026/concert/hans-zimmer/v2/1200x708.jpg',title:'Hans Zimmer Live, Etihad Arena promotional artwork',source:'https://www.etihadarena.ae/en/events',author:'Etihad Arena / event promoter'},
 {id:'andrea-bocelli',url:'https://static.myconnect.ae/-/media/yasconnect/project/ya/events-2026/concert/andrea-bocelli/v2/1200x708.jpg',title:'Andrea Bocelli, Yasalam Classics promotional artwork',source:'https://www.etihadarena.ae/en/events',author:'Etihad Arena / event promoter'},
 {id:'dubai-world-cup',url:'https://drcwebblob.blob.core.windows.net/drcwebmediacontent/2026/03/YT_R9.jpeg',title:'Dubai World Cup race at Meydan, 28 March 2026',source:'https://dubairacingclub.com/race-results-replays/dwc-race-replay-race-9-dubai-world-cup-march-28-2026/',author:'Dubai Racing Club'},
]
const destination='public/verified-places'
await mkdir(destination,{recursive:true})
let credits=[]
try{credits=JSON.parse(await readFile(destination+'/sources.json','utf8'))}catch{}
const jobs=[]
for(const [id,search,title] of choices){
 try{
 const data=JSON.parse(await readFile(dir+'/commons-'+search+'.json','utf8'))
 const page=Object.values(data.query?.pages||{}).find(p=>p.title===title)
 const info=page?.imageinfo?.[0]
 if(!info||info.width<1500){console.log('No suitable resolution',id);continue}
 const m=info.extmetadata
 if(!/^(CC|Public domain)/.test(m.LicenseShortName?.value||''))throw Error('Unreviewed licence')
 jobs.push({id,url:info.url,title:title.slice(5),source:info.descriptionurl,author:clean(m.Artist?.value),license:clean(m.LicenseShortName?.value),licenseUrl:m.LicenseUrl?.value||info.descriptionurl,description:clean(m.ImageDescription?.value)})
 }catch(e){console.log(id,e.message)}
}
jobs.push(...official.map(item=>({...item,license:'Official source — publication permission not verified',licenseUrl:item.source})))
try {
 const eventAssets=JSON.parse(await readFile(dir+'/event-downloads.json','utf8'))
 jobs.push(...eventAssets.map(item=>({...item,license:'Official source — publication permission not verified',licenseUrl:item.source})))
} catch (error) { if(error.code!=='ENOENT') throw error }
for(const item of jobs){
 try{
  if(credits.some(c=>c.id===item.id))continue
  const response=await fetch(item.url,{signal:AbortSignal.timeout(40000),headers:{'User-Agent':'ZaviLocalReview/1.0 (photo attribution review)'}})
  if(!response.ok)throw Error('HTTP '+response.status)
  const bytes=Buffer.from(await response.arrayBuffer())
  if(bytes.length>30000000)throw Error('Image too large')
  const pipeline=sharp(bytes,{limitInputPixels:150000000}).rotate()
  const meta=await pipeline.metadata()
  if(!meta.width||meta.width<(item.minWidth||1100))throw Error('Insufficient source resolution')
  await pipeline.resize({width:2560,withoutEnlargement:true}).webp({quality:90}).toFile(destination+'/'+item.id+'.webp')
  credits.push({...item,original:item.url,src:'/verified-places/'+item.id+'.webp',changes:'Resized and converted to WebP; original appearance retained. Official-source assets are local review copies until publication rights are cleared.'})
  await writeFile(destination+'/sources.json',JSON.stringify(credits,null,2)+'\n')
  console.log('Downloaded',item.id,meta.width,meta.height)
 }catch(e){console.log('Download failed',item.id,e.message)}
 await new Promise(resolve=>setTimeout(resolve,item.license.startsWith('Official')?500:8000))
}

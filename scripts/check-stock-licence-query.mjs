import {writeFile} from 'node:fs/promises';
for(const query of ['Lamborghini Revuelto incategory:CC-Zero','Lamborghini Revuelto hastemplate:cc-zero','Lamborghini Revuelto filelicense:cc-zero']){
const u=new URL('https://commons.wikimedia.org/w/api.php');Object.entries({action:'query',format:'json',list:'search',srsearch:query,srnamespace:6,srlimit:5}).forEach(([k,v])=>u.searchParams.set(k,String(v)));
const r=await fetch(u,{signal:AbortSignal.timeout(30000)});console.log(query,r.status,JSON.stringify(await r.json()).slice(0,1600));await new Promise(r=>setTimeout(r,5000));}

import { chromium } from 'playwright'
import { writeFile } from 'node:fs/promises'
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
const context=await browser.newContext()
for(const [id,url] of [
 ['gp-entertainment','https://www.abudhabigp.com/en/yasalam-entertainment'],
 ['gp-yasalam','https://www.abudhabigp.com/en/yasalam'],
 ['gp-faq','https://www.abudhabigp.com/en/faq'],
 ['gp-inclusions','https://www.abudhabigp.com/en/ticket-inclusions'],
 ['meydan-dining','https://dubairacingclub.com/dining/'],
]){
 const page=await context.newPage()
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:40000})
  await page.waitForTimeout(2500)
  await writeFile('.local/site-audit/'+id+'.txt',await page.locator('body').innerText())
  await writeFile('.local/site-audit/'+id+'.html',await page.content())
  const assets=await page.locator('img').evaluateAll(imgs=>imgs.map(img=>({src:img.currentSrc||img.src,lazy:img.getAttribute('data-src'),alt:img.alt,width:img.naturalWidth,height:img.naturalHeight})).filter(img=>!/(adroll|bing.com|google|doubleclick)/.test(img.src)))
  await writeFile('.local/site-audit/'+id+'-images.json',JSON.stringify(assets,null,2))
  const backgrounds=await page.locator('body *').evaluateAll(nodes=>[...new Set(nodes.map(node=>getComputedStyle(node).backgroundImage).filter(value=>value.includes('url(')))])
  await writeFile('.local/site-audit/'+id+'-backgrounds.json',JSON.stringify(backgrounds,null,2))
  const links=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(node=>({text:node.textContent?.trim(),url:node.href})).filter(link=>link.url.startsWith('https:')))
  await writeFile('.local/site-audit/'+id+'-links.json',JSON.stringify(links,null,2))
  console.log(id,(await page.locator('body').innerText()).slice(0,220))
 }catch(e){console.log(id,e.message.slice(0,180))}
 await page.close()
}
await browser.close()

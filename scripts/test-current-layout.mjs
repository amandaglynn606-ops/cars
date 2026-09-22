import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
await mkdir('test-results',{recursive:true})
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'})
const page=await context.newPage()
const errors=[]
page.on('pageerror',e=>errors.push(e.message))
const base='http://127.0.0.1:43117'
try{
 await page.goto(base+'/fleet/rolls-royce/cullinan',{waitUntil:'networkidle'})
 const country=page.locator('select[name="countryCode"]').first()
 assert.equal(await country.inputValue(),'')
 assert.equal(await country.evaluate(el=>el.required),true)
 await page.locator('input[name="name"]').fill('Local Layout Test')
 await page.locator('input[name="email"]').fill('layout@example.invalid')
 await page.locator('input[name="nationalPhone"]').fill('50 123 4567')
 assert.equal(await country.evaluate(el=>el.checkValidity()),false)
 await country.selectOption('971')
 assert.equal(await page.locator('input[name="phone"]').inputValue(),'+971501234567')
 await page.getByRole('button',{name:'Continue to reservation',exact:true}).click()
 await page.waitForURL('**/book?**')
 assert.equal(await page.locator('input[name="name"]').count(),0)
 await page.evaluate(()=>{window.datePickerCalls=0;HTMLInputElement.prototype.showPicker=function(){window.datePickerCalls++}})
 const dates=page.locator('input[type="date"]')
 for(let i=0;i<2;i++){const box=await dates.nth(i).boundingBox();await dates.nth(i).click({position:{x:Math.max(12,box.width/2),y:box.height/2}})}
 assert.equal(await page.evaluate(()=>window.datePickerCalls),2)
 await page.screenshot({path:'test-results/booking-fields-wide.png',fullPage:true})
 const findings=[]
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1000})
  await page.goto(base+'/fleet',{waitUntil:'networkidle'})
  const card=page.locator('.z-car-card').first()
  assert.equal(await page.locator('.z-car-card .z-car-meta').count(),0)
  const rects=await card.evaluate(el=>{const r=x=>{const b=x.getBoundingClientRect();return {x:b.x,width:b.width}};return {card:r(el),wa:r(el.querySelector('.z-car-whatsapp')),overflow:document.documentElement.scrollWidth>innerWidth}})
  assert.ok(Math.abs(rects.card.width-rects.wa.width)<=3,'WhatsApp fills card at '+width)
  assert.equal(rects.overflow,false,'no page overflow at '+width)
  findings.push({width,...rects})
  await card.screenshot({path:'test-results/product-card-'+width+'.png'})
  await page.goto(base+'/events/abu-dhabi-grand-prix-luxury-car-rental',{waitUntil:'networkidle'})
  assert.equal(await page.locator('h1').count(),1)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
  await page.screenshot({path:'test-results/event-page-'+width+'.png',fullPage:true})
 }
 for(const route of ['/partners/consign-your-car','/partners/rental-agencies','/book']){
  await page.goto(base+route,{waitUntil:'networkidle'})
  assert.equal(await page.locator('select[name="countryCode"]').count(),1)
 }
 assert.deepEqual(errors,[])
 await writeFile('test-results/current-layout.json',JSON.stringify({findings,errors,datePickerCalls:2},null,2))
 console.log('Country selection, contact handoff, full-field date clicks, edge-to-edge WhatsApp and desktop/mobile layouts passed.')
}finally{await browser.close()}
